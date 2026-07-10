"""Chat endpoints (REST + SSE stream)."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session as DBSession

from dependencies import get_db
from models.schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def send_message(payload: ChatRequest, db: DBSession = Depends(get_db)):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    session_id, message_id = ChatService.send_message(
        db, payload.session_id, payload.message, payload.model
    )
    return ChatResponse(session_id=session_id, message_id=message_id)


@router.get("/stream")
async def stream_chat(
    session_id: str, model: str | None = None, db: DBSession = Depends(get_db)
):
    return StreamingResponse(
        ChatService.stream_response(db, session_id, model),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )