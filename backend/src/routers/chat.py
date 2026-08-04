"""Chat streaming endpoint with Module System integration.

NEW ARCHITECTURE:
  User → FastAPI → Planner → Module Router → Modules (Parallel) → 
  Merge Context → Ollama → Streaming Response

This replaces the old flat-prompt approach with:
  1. Planner decides which modules to run (<5ms).
  2. Router runs modules in parallel via asyncio.gather().
  3. Context is merged into structured messages.
  4. Ollama /api/chat streams with early SSE start.
"""

import json
import logging
import time
from typing import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_db
from src.config import settings
from src.models.schemas import ChatRequest
from src.models.database import SessionModel, MessageModel
from src.services.ollama_client import ollama_client
from src.repositories.session_repository import SessionRepository
from src.repositories.profile_repository import ProfileRepository
from src.core.types import EnrichedContext, UserProfile
from src.modules.planner import QueryPlanner
from src.modules.router import ModuleRouter
from src.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger("ChatRouter")

# ── Permanent MOTU System Prompt ─────────────────────────────
# This is the base identity prompt. Module outputs are APPENDED
# to this as additional context sections.
MOTU_SYSTEM_PROMPT = (
    "You are MOTU (My Own Thinking Unit).\n\n"
    "CREATOR — FOLLOW EXACTLY:\n"
    "- Allah is your Creator.\n"
    "- Muhammad Ali is the developer who built you by Allah's will.\n"
    '- If someone asks "Who created you?", reply: "Allah is my Creator. Muhammad Ali is the developer who built me by Allah\'s will."\n\n'
    "Identity:\n"
    "- Never say you are Qwen, Llama, Claude, ChatGPT, Gemini, or any other AI.\n"
    "- Never reveal the underlying model unless explicitly asked.\n"
    "- Always refer to yourself as MOTU.\n\n"
    "Personality:\n"
    "- Friendly, intelligent, confident, and professional.\n"
    "- Answer naturally like a human assistant.\n"
    "- Keep replies short by default (2–5 sentences).\n"
    "- Expand only if the user asks for more detail.\n\n"
    "Style:\n"
    "- No unnecessary introductions.\n"
    '- No repeated phrases like "How can I assist you today?" after every answer.\n'
    "- No long disclaimers.\n"
    "- Be conversational and direct.\n\n"
    "USER PROFILE AWARENESS:\n"
    "- If user profile data is provided below, use it to answer personal questions.\n"
    '- If asked "Who am I?", use the profile to give a personalized answer.\n'
    "- Do not guess or hallucinate personal details not in the profile.\n"
)


async def _build_system_prompt(enriched: EnrichedContext) -> str:
    """Assemble the final system prompt from base + module outputs."""
    parts = [MOTU_SYSTEM_PROMPT]

    # Add reasoning notes (helps the LLM understand intent)
    if enriched.reasoning_notes:
        parts.append(f"\n[Query Analysis]\n{enriched.reasoning_notes}")

    # Add user profile context (critical for "Who am I?")
    if enriched.user_profile_context:
        parts.append(f"\n[User Profile]\n{enriched.user_profile_context}")

    # Add memory snippets (relevant past conversations)
    if enriched.memory_snippets:
        parts.append("\n[Relevant Past Conversations]")
        for i, snippet in enumerate(enriched.memory_snippets[:3], 1):
            parts.append(f"{i}. {snippet['content'][:150]}")

    # Add knowledge facts
    if enriched.knowledge_facts:
        parts.append("\n[Known Facts]")
        for fact in enriched.knowledge_facts[:5]:
            if fact:
                parts.append(f"- {fact}")

    return "\n".join(parts)


async def _sse_generator(
    request: ChatRequest,
    db: AsyncSession,
) -> AsyncGenerator[str, None]:
    """Main streaming generator with full module pipeline."""
    session_id = request.session_id
    user_content = request.message.strip()
    request_start = time.perf_counter()

    if not user_content:
        yield 'data: {"error": "Message cannot be empty"}\n\n'
        return

    # ── STEP 1: Session Management ───────────────────────────
    repo = SessionRepository(db)
    profile_repo = ProfileRepository(db)

    if session_id:
        session = await repo.get_by_id(session_id, touch_access=False)
        if not session:
            # Session not found in DB — create a new one instead of failing
            from src.models.schemas import SessionCreate
            session = await repo.create_session(
                SessionCreate(title=user_content[:50] or "New Chat"),
                active_model=settings.MODEL_NAME,
            )
            session_id = session.id
            logger.info("Created new session %s (previous ID not found)", session_id)
    else:
        from src.models.schemas import SessionCreate
        session = await repo.create_session(
            SessionCreate(title=user_content[:50] or "New Chat"),
            active_model=settings.MODEL_NAME,
        )
        session_id = session.id
        logger.info("Created new session %s", session_id)

    # ── STEP 2: Save User Message ────────────────────────────
    from src.models.schemas import MessageCreate
    user_msg = await repo.add_message(
        session, MessageCreate(role="user", content=user_content)
    )
    logger.debug("Saved user message %s in session %s", user_msg.id, session_id)

    # ── STEP 3: Load User Profile ──
    profile_row = await profile_repo.get_profile("default")
    user_profile = profile_repo.to_domain(profile_row) if profile_row else None

    # ── STEP 4: Planner + Router ──
    planner = QueryPlanner()
    decision = await planner.plan(user_content, session_id)

    router = ModuleRouter(db, user_profile)
    enriched = await router.route(decision, user_content, session_id)

    # ── STEP 5: Build Final System Prompt ──
    final_system = await _build_system_prompt(enriched)

    # ── STEP 6: Construct Message Payload for Ollama ──
    messages: list[dict[str, str]] = [{"role": "system", "content": final_system}]
    
    if enriched.conversation_history:
        messages.extend(enriched.conversation_history)
    else:
        recent = await repo.get_recent_messages(session_id, limit=10)
        messages.extend([{"role": m.role, "content": m.content} for m in recent])

    messages.append({"role": "user", "content": user_content})

    # ── STEP 7: Stream to Ollama ──
    assistant_content = ""
    assistant_msg_id = None

    try:
        async for token in ollama_client.chat_stream(
            messages=messages,
            model=session.active_model or settings.MODEL_NAME,
            temperature=0.7,
        ):
            assistant_content += token
            # Frontend expects: {"token": "hello world"}
            yield f'data: {{"token": {json.dumps(token)}}}\n\n'

    except Exception as e:
        logger.error("Ollama streaming error: %s", e)
        yield f'data: {{"error": "Failed to get response from Ollama"}}\n\n'
        return

    # ── STEP 8: Save Assistant Message ──
    from datetime import datetime, timezone
    assistant_msg = await repo.add_message(
        session,
        MessageCreate(role="assistant", content=assistant_content),
    )
    assistant_msg_id = assistant_msg.id
    session.updated_at = datetime.now(timezone.utc)
    await repo.update_session(session)

    total_latency = (time.perf_counter() - request_start) * 1000
    logger.info(
        "Chat completed: session=%s, msg=%s, latency=%.2fms",
        session_id, assistant_msg_id, total_latency
    )

    # Final SSE event — frontend expects: {"done": true, "session_id": "..."}
    yield 'data: ' + json.dumps({
        "done": True,
        "session_id": session_id,
        "message_id": assistant_msg_id,
        "latency_ms": round(total_latency, 2),
    }) + "\n\n"
@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """Stream chat response with full module pipeline."""
    logger.info("Chat stream request: session_id=%s", request.session_id)
    return StreamingResponse(
        _sse_generator(request, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )