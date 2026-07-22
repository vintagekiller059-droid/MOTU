"""Session-integrated streaming chat router with context windowing and UUIDv7 persistence."""

import json
import time
import math
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.session import get_db
from src.services.session_service import SessionService
from src.repositories.session_repository import SessionRepository
from src.models.schemas import ChatRequest, MessageCreate
from src.services.ollama_client import ollama_client
from src.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger("SessionChatRouter")


def estimate_tokens(text: str) -> int:
    return max(1, math.ceil(len(text) / 4))


@router.post("/sessions/{session_id}/chat/stream")
async def stream_session_chat(
    session_id: str, 
    payload: ChatRequest, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Streams responses into an active OS workspace and persists turns into SQLite."""
    repo = SessionRepository(db)
    service = SessionService(db)
    
    session = await repo.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session workspace '{session_id}' not found.")

    recent_messages = await repo.get_recent_messages(session_id, limit=session.max_context_messages)

    # Build prompt context incorporating system prompt and rolling summary
    context_parts = []
    if session.system_prompt:
        context_parts.append(f"SYSTEM INSTRUCTION: {session.system_prompt}")
    if session.summary:
        context_parts.append(f"[ROLLING CONTEXT SUMMARY: {session.summary}]")

    context_parts.extend([f"{m.role.upper()}: {m.content}" for m in recent_messages])
    context_parts.append(f"USER: {payload.message}\nASSISTANT:")
    
    full_prompt = "\n\n".join(context_parts)
    start_time = time.time()

    async def token_generator():
        assistant_response = ""
        try:
            async for token in ollama_client.generate_stream(
                prompt=full_prompt,
                model=session.active_model,
                temperature=payload.temperature or session.temperature
            ):
                if await request.is_disconnected():
                    logger.warning(f"Client disconnected during generation for session {session_id}.")
                    break
                
                assistant_response += token
                
                # Send JSON-encoded data payload to support newlines and structured client parsing
                payload_data = json.dumps({"token": token, "content": token})
                yield f"data: {payload_data}\n\n"

        except Exception as e:
            logger.error(f"Error during Ollama generation stream: {e}")
            err_payload = json.dumps({"error": str(e)})
            yield f"data: {err_payload}\n\n"

        finally:
            elapsed = round(time.time() - start_time, 2)
            
            user_msg = MessageCreate(
                role="user",
                content=payload.message,
                token_count=estimate_tokens(payload.message)
            )
            assistant_msg = MessageCreate(
                role="assistant",
                content=assistant_response or "[Interrupted]",
                token_count=estimate_tokens(assistant_response),
                generation_time=elapsed
            )

            try:
                await service.append_turns_and_summarize(session, user_msg, assistant_msg)
                await db.commit()
            except Exception as e:
                logger.error(f"Failed to persist session turns: {e}")

    return StreamingResponse(
        token_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )