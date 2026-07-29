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


async def _sse_generator(
    request: ChatRequest,
    db: Session,
) -> AsyncGenerator[str, None]:
    session_id = request.session_id
    user_content = request.message.strip()

    if not user_content:
        yield 'data: {"error": "Message cannot be empty"}\n\n'
        return

    # Resolve or create session
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

    # Save user message
    user_msg = Message(
        id=uuid7(),
        session_id=session_id,
        role="user",
        content=user_content,
    )
    db.add(user_msg)
    db.commit()
    logger.debug("Saved user message %s in session %s", user_msg.id, session_id)

    # Build conversation history (last 20 messages)
    stmt = select(Message).where(Message.session_id == session_id).order_by(Message.created_at).limit(20)
    history = db.execute(stmt).scalars().all()
    messages = [{"role": m.role, "content": m.content} for m in history]

    assistant_content = ""
    assistant_msg_id = uuid7()

    try:
        async for token in stream_chat(messages, model=session.model):
            assistant_content += token
            yield f'data: {{"token": {json.dumps(token)}}}\n\n'
    except Exception as e:
        logger.error("Ollama streaming error: %s", e)
        yield 'data: {"error": "Failed to get response from Ollama"}\n\n'
        return

    # Save assistant message
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
