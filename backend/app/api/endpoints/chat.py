"""Chat endpoint with memory persistence."""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from app.db.database import get_db
from app.db import crud
from app.services.ollama_client import OllamaClient
from ai.system_prompt import build_system_prompt
from app.models.chat import ChatRequest

router = APIRouter()
ollama = OllamaClient()


@router.post("/")
async def chat_stream(request: ChatRequest, db: Session = Depends(get_db)):
    if request.conversation_id:
        conv = crud.get_conversation(db, request.conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conversation_id = request.conversation_id
    else:
        title = request.message[:50] + "..." if len(request.message) > 50 else request.message
        conv = crud.create_conversation(db, title=title)
        db.commit()
        db.refresh(conv)
        conversation_id = conv.id

    crud.create_message(
        db,
        conversation_id=conversation_id,
        role="user",
        content=request.message,
        model=request.model
    )
    db.commit()

    messages = [{"role": "system", "content": build_system_prompt()}]
    history = crud.get_messages(db, conversation_id)
    for msg in history:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})

    async def generate():
        full_response = ""
        try:
            async for chunk in ollama.chat_stream(
                model=request.model,
                messages=messages,
                temperature=request.temperature
            ):
                if chunk:
                    full_response += chunk
                    yield f"data: {json.dumps({'content': chunk, 'conversation_id': conversation_id})}\n\n"

            crud.create_message(
                db,
                conversation_id=conversation_id,
                role="assistant",
                content=full_response,
                model=request.model
            )
            db.commit()

            yield f"data: {json.dumps({'done': True, 'conversation_id': conversation_id})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Conversation-Id": conversation_id
        }
    )


@router.get("/models")
async def list_models():
    return await ollama.list_models()


@router.get("/health")
async def health_check():
    return await ollama.health_check()
