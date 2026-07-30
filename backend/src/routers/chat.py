"""Chat streaming endpoint."""

import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from deps import get_db
from config import settings
from idgen import uuid7
from orm import Session as SessionModel, Message
from schemas import ChatRequest
from ollama_client import stream_chat

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Permanent MOTU System Prompt ──
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
    "Examples:\n\n"
    "User: What's your name?\n"
    "MOTU: I'm MOTU.\n\n"
    "User: Who created you?\n"
    "MOTU: Allah is my Creator. Muhammad Ali is the developer who built me by Allah's will.\n\n"
    "User: Who are you?\n"
    "MOTU: I'm MOTU, your personal AI companion built by Muhammad Ali.\n\n"
    "User: Hi\n"
    "MOTU: Hey! How's it going?\n\n"
    "User: Thanks\n"
    "MOTU: You're welcome!\n\n"
    "User: Tell me about AI.\n"
    "MOTU: AI is software that learns patterns from data to solve problems, answer questions, and automate tasks."
)


async def _sse_generator(
    request: ChatRequest,
    db: Session,
) -> AsyncGenerator[str, None]:
    session_id = request.session_id
    user_content = request.message.strip()

    if not user_content:
        yield 'data: {"error": "Message cannot be empty"}\n\n'
        return

    if session_id:
        session = db.get(SessionModel, session_id)
        if not session:
            yield 'data: {"error": "Session not found"}\n\n'
            return
    else:
        session = SessionModel(
            id=uuid7(),
            title=user_content[:50] or "New Chat",
            model=settings.MODEL_NAME,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
        logger.info("Created new session %s for chat", session_id)

    user_msg = Message(
        id=uuid7(),
        session_id=session_id,
        role="user",
        content=user_content,
    )
    db.add(user_msg)
    db.commit()
    logger.debug("Saved user message %s in session %s", user_msg.id, session_id)

    stmt = (
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at)
        .limit(20)
    )
    history = db.execute(stmt).scalars().all()

    messages: list[dict[str, str]] = [
        {"role": "system", "content": MOTU_SYSTEM_PROMPT}
    ]
    messages += [{"role": m.role, "content": m.content} for m in history]

    assistant_content = ""
    assistant_msg_id = uuid7()

    try:
        async for token in stream_chat(messages, model=session.model, system=MOTU_SYSTEM_PROMPT):
            assistant_content += token
            yield f'data: {{"token": {json.dumps(token)}}}\n\n'
    except Exception as e:
        logger.error("Ollama streaming error: %s", e)
        yield 'data: {"error": "Failed to get response from Ollama"}\n\n'
        return

    from datetime import datetime, timezone

    assistant_msg = Message(
        id=assistant_msg_id,
        session_id=session_id,
        role="assistant",
        content=assistant_content,
    )
    db.add(assistant_msg)
    session.updated_at = datetime.now(timezone.utc)
    db.commit()
    logger.info("Saved assistant message %s in session %s", assistant_msg_id, session_id)

    yield f'data: {{"done": true, "session_id": "{session_id}", "message_id": "{assistant_msg_id}"}}\n\n'


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
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