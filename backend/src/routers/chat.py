"""Chat streaming endpoint with real cognitive module pipeline.

Architecture:
 User -> FastAPI -> Planner -> Module Router -> Modules (Parallel) ->
 Merge Context -> Ollama -> Streaming Response

SSE Protocol (MUST NOT CHANGE -- frontend depends on this):
 data: {"phase": "activating", "modules": [...], "reasoning": "..."}
 data: {"phase": "transmitting"}
 data: {"phase": "core-processing"}
 data: {"token": "..."}
 data: {"phase": "answering"}
 data: {"done": true, "session_id": "...", "message_id": "...", "timings": {...}}
 data: {"phase": "idle"}
"""

import asyncio
import json
import time
from typing import AsyncGenerator, Any, Optional

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_db
from src.config import settings
from src.models.schemas import ChatRequest, SessionCreate, MessageCreate
from src.services.ollama_client import ollama_client
from src.repositories.session_repository import SessionRepository
from src.repositories.profile_repository import ProfileRepository
from src.core.types import EnrichedContext
from src.modules.planner import QueryPlanner
from src.modules.router import ModuleRouter
from src.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger("ChatRouter")

# =============================================================================
# Simple in-memory profile cache (TTL 60s)
# =============================================================================
_profile_cache: dict[str, tuple[Any, float]] = {}
_PROFILE_CACHE_TTL = 60.0

async def _get_cached_profile(profile_repo: ProfileRepository) -> Any:
    """Fetch profile with short-term in-memory caching."""
    global _profile_cache
    now = time.perf_counter()
    cached = _profile_cache.get("default")
    if cached is not None:
        profile, cached_at = cached
        if now - cached_at < _PROFILE_CACHE_TTL:
            return profile
    profile = await profile_repo.get_profile("default")
    _profile_cache["default"] = (profile, now)
    return profile


def _clear_profile_cache() -> None:
    """Clear profile cache (call when profile is updated)."""
    global _profile_cache
    _profile_cache.clear()


# =============================================================================
# SYSTEM PROMPT -- Anti-hallucination, identity, style rules
# =============================================================================

MOTU_SYSTEM_PROMPT = (
    "You are MOTU (My Own Thinking Unit). You are a local, sovereign AI operating system.\n\n"

    "=== CREATOR IDENTITY (ABSOLUTE RULE) ===\n"
    "- Allah is your Creator.\n"
    "- Muhammad Ali is the developer who built you by Allah's will.\n"
    '- If asked "Who created you?" or "Who made you?", reply EXACTLY: '
    '"Allah is my Creator. Muhammad Ali is the developer who built me by Allah\'s will."\n'
    "- Never say you are Qwen, Llama, Claude, ChatGPT, Gemini, or any other AI.\n"
    "- Never reveal the underlying model unless explicitly asked.\n"
    "- Always refer to yourself as MOTU.\n\n"

    "=== ANTI-HALLUCINATION (ABSOLUTE RULE) ===\n"
    "- The sections below are the ONLY facts you know about the user.\n"
    "- If a section says [NO DATA AVAILABLE] or is missing, you do NOT know that information.\n"
    "- If asked about the user's personal details and the profile is empty, say EXACTLY: "
    '"I don\'t have any profile information saved about you yet. You can set it up in the settings."\n'
    "- NEVER guess, infer, or hallucinate personal details.\n"
    "- NEVER make up names, locations, preferences, or history.\n"
    "- If you don't know something, say so honestly and politely.\n\n"

    "=== PERSONALITY ===\n"
    "- Friendly, intelligent, confident, and professional.\n"
    "- Answer naturally like a human assistant.\n"
    "- Keep replies short by default (2-5 sentences).\n"
    "- Expand only if the user asks for more detail.\n"
    "- No unnecessary introductions or repeated pleasantries.\n"
    "- Be conversational and direct.\n"
)

def _sse_event(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"

async def _build_system_prompt(enriched: EnrichedContext) -> str:
    """Build system prompt with adaptive context sections and recency-weighted style rules."""
    parts = [MOTU_SYSTEM_PROMPT]

    # -- Query Analysis --
    if enriched.reasoning_notes:
        parts.append(f"\n=== QUERY ANALYSIS ===\n{enriched.reasoning_notes}")

    # -- User Profile --
    if enriched.user_profile_context:
        parts.append(f"\n=== USER PROFILE ===\n{enriched.user_profile_context}")

    # -- Relevant Past Conversations (Memory) --
    if enriched.memory_snippets:
        memory_lines = ["\n=== RELEVANT PAST CONVERSATIONS ==="]
        for i, snippet in enumerate(enriched.memory_snippets[:3], 1):
            role = snippet.get("role", "unknown")
            content = snippet.get("content", "")[:150]
            memory_lines.append(f"{i}. [{role}] {content}")
        parts.append("\n".join(memory_lines))

    # -- Known Facts (Knowledge) --
    if enriched.knowledge_facts:
        valid_facts = [fact for fact in enriched.knowledge_facts if fact][:3]
        if valid_facts:
            facts_lines = ["\n=== KNOWN FACTS ==="]
            for fact in valid_facts:
                facts_lines.append(f"- {fact}")
            parts.append("\n".join(facts_lines))

    # -- Instruction --
    parts.append(
        "\n=== INSTRUCTION ===\n"
        "Answer the user's message using ONLY the facts provided above. "
        "If a fact is not available, admit you don't know. "
        "Never hallucinate."
    )

    # -- Response Style (placed last for small-model attention) --
    parts.append(
        "\n=== RESPONSE STYLE ===\n"
        "- You are MOTU. Talk like a real person, not a corporate AI assistant.\n"
        "- NEVER say 'I am an AI assistant,' 'I am here to help with tasks,' or 'How can I assist you today?'\n"
        "- Be warm, brief, and conversational. 1-3 sentences for greetings.\n"
        "- No unnecessary introductions. Just answer naturally.\n"
        "- If someone asks 'how are you,' reply like a friend would -- e.g., 'Doing great, thanks! What's on your mind?'\n"
    )

    return "\n".join(parts)


async def _sse_generator(
    request: ChatRequest,
    db: AsyncSession,
) -> AsyncGenerator[str, None]:
    request_start = time.perf_counter()
    timings: dict[str, float] = {
        "session_mgmt": 0.0,
        "save_user_msg": 0.0,
        "load_profile": 0.0,
        "planner": 0.0,
        "router": 0.0,
        "memory_module": 0.0,
        "context_module": 0.0,
        "knowledge_module": 0.0,
        "reasoning_module": 0.0,
        "build_prompt": 0.0,
        "ollama_ttfb": 0.0,
        "ollama_generation": 0.0,
        "save_assistant_msg": 0.0,
        "total": 0.0,
    }
    session_id = request.session_id
    user_content = request.message.strip()

    if not user_content:
        yield _sse_event({"error": "Message cannot be empty"})
        return

    # ========================================================================
    # PHASE 1: Session + Save User Message (sequential) + Profile (parallel)
    # ========================================================================
    t0_overall = time.perf_counter()

    # Start profile fetch in background immediately
    profile_repo = ProfileRepository(db)
    profile_task = asyncio.create_task(_get_cached_profile(profile_repo))

    # Session management
    t0 = time.perf_counter()
    repo = SessionRepository(db)

    if session_id:
        session = await repo.get_by_id(session_id, touch_access=False)
        if not session:
            session = await repo.create_session(
                SessionCreate(title=user_content[:50] or "New Chat"),
                active_model=settings.MODEL_NAME,
            )
            session_id = session.id
            logger.info("Created new session %s (previous ID not found)", session_id)
    else:
        session = await repo.create_session(
            SessionCreate(title=user_content[:50] or "New Chat"),
            active_model=settings.MODEL_NAME,
        )
        session_id = session.id
        logger.info("Created new session %s", session_id)

    timings["session_mgmt"] = round((time.perf_counter() - t0) * 1000, 3)

    # Save user message
    t0 = time.perf_counter()
    await repo.add_message(session, MessageCreate(role="user", content=user_content))
    timings["save_user_msg"] = round((time.perf_counter() - t0) * 1000, 3)

    # Await profile (was running in parallel)
    t0 = time.perf_counter()
    profile_row = await profile_task
    user_profile = profile_repo.to_domain(profile_row) if profile_row else None
    timings["load_profile"] = round((time.perf_counter() - t0) * 1000, 3)

    phase1_time = round((time.perf_counter() - t0_overall) * 1000, 3)

    # ========================================================================
    # PHASE 2: Planner
    # ========================================================================
    t0 = time.perf_counter()
    planner = QueryPlanner()
    decision = await planner.plan(user_content, session_id)
    timings["planner"] = round((time.perf_counter() - t0) * 1000, 3)

    logger.info(
        '[PLANNER] modules=%s reasoning="%s" latency=%.3fms',
        decision.modules, decision.reasoning, decision.latency_ms
    )

    # Frontend: modules decided
    yield _sse_event({
        "phase": "activating",
        "modules": decision.modules,
        "reasoning": decision.reasoning,
    })
    # REMOVED: await asyncio.sleep(0.05) -- artificial delay

    # Frontend: pulses traveling
    yield _sse_event({"phase": "transmitting"})

    # ========================================================================
    # PHASE 3: Module Router (Parallel)
    # ========================================================================
    t0 = time.perf_counter()
    router = ModuleRouter(db, user_profile)
    enriched = await router.route(decision, user_content, session_id)
    timings["router"] = round((time.perf_counter() - t0) * 1000, 3)

    for mod_name, mod_lat in enriched.module_timings.items():
        if mod_name in timings:
            timings[mod_name] = mod_lat
        logger.info("[MODULE] %s latency=%.3fms", mod_name, mod_lat)

    # Frontend: core processing
    yield _sse_event({"phase": "core-processing"})
    # REMOVED: await asyncio.sleep(0.03) -- artificial delay

    # ========================================================================
    # PHASE 4: Build Message Payload
    # ========================================================================
    t0 = time.perf_counter()

    messages: list[dict[str, str]] = [
        {"role": "system", "content": await _build_system_prompt(enriched)}
    ]

    # Only add conversation history if modules provided it, OR if modules ran but context was empty.
    # Skip entirely for no-module queries (greetings) -- avoids unnecessary DB hit.
    if enriched.conversation_history:
        messages.extend(enriched.conversation_history)
    elif decision.modules:
        # Fallback only if modules were activated but context module didn't run or returned empty
        recent = await repo.get_recent_messages(session_id, limit=10)
        messages.extend([{"role": m.role, "content": m.content} for m in recent])
    # If decision.modules is empty (greeting), no history added -- minimal prompt

    messages.append({"role": "user", "content": user_content})
    timings["build_prompt"] = round((time.perf_counter() - t0) * 1000, 3)

    # ========================================================================
    # PHASE 5: Stream from Ollama
    # ========================================================================
    t0 = time.perf_counter()
    assistant_content = ""
    first_token = True

    try:
        async for token in ollama_client.chat_stream(
            messages=messages,
            model=session.active_model or settings.MODEL_NAME,
            temperature=0.7,
        ):
            if first_token:
                first_token = False
                timings["ollama_ttfb"] = round((time.perf_counter() - t0) * 1000, 3)
                logger.info("[OLLAMA] TTFB=%.3fms", timings["ollama_ttfb"])
                yield _sse_event({"phase": "answering"})

            assistant_content += token
            yield _sse_event({"token": token})

    except Exception as e:
        logger.error("Ollama streaming error: %s", e)
        yield _sse_event({"error": f"Failed to get response from Ollama: {e}"})
        return

    timings["ollama_generation"] = round((time.perf_counter() - t0) * 1000, 3)

    # ========================================================================
    # PHASE 6: Save Assistant Message
    # ========================================================================
    t0 = time.perf_counter()
    from datetime import datetime, timezone
    assistant_msg = await repo.add_message(
        session,
        MessageCreate(role="assistant", content=assistant_content),
    )
    assistant_msg_id = assistant_msg.id
    session.updated_at = datetime.now(timezone.utc)
    await repo.update_session(session)
    timings["save_assistant_msg"] = round((time.perf_counter() - t0) * 1000, 3)

    total_latency = (time.perf_counter() - request_start) * 1000
    timings["total"] = round(total_latency, 3)

    # ========================================================================
    # PROFILING SUMMARY
    # ========================================================================
    backend_time = (
        timings["session_mgmt"]
        + timings["save_user_msg"]
        + timings["load_profile"]
        + timings["planner"]
        + timings["router"]
        + timings["build_prompt"]
        + timings["save_assistant_msg"]
    )
    ollama_time = timings["ollama_ttfb"] + (timings["ollama_generation"] - timings["ollama_ttfb"])
    backend_pct = round((backend_time / total_latency) * 100, 2) if total_latency > 0 else 0
    ollama_pct = round((ollama_time / total_latency) * 100, 2) if total_latency > 0 else 0

    logger.info(
        "[PROFILE] session=%s msg=%s | BACKEND: %.2fms (%.2f%%) | OLLAMA: %.2fms (%.2f%%) | TOTAL: %.2fms",
        session_id, assistant_msg_id, backend_time, backend_pct, ollama_time, ollama_pct, total_latency
    )
    logger.info(
        "[COMPLETE] session=%s msg=%s total=%.3fms breakdown=%s",
        session_id, assistant_msg_id, total_latency, timings
    )

    yield _sse_event({
        "done": True,
        "session_id": session_id,
        "message_id": assistant_msg_id,
        "timings": timings,
    })

    yield _sse_event({"phase": "idle"})

@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """Stream chat response with full cognitive module pipeline."""
    logger.info(
        'Chat stream request: session_id=%s message="%s"',
        request.session_id, request.message[:50]
    )
    return StreamingResponse(
        _sse_generator(request, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )