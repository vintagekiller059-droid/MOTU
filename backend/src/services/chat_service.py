"""Core chat business logic — orchestrates sessions + Ollama streaming."""

import json
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.services.ollama_client import ollama_client
from src.utils.logger import setup_logger

logger = setup_logger("ChatService")


class ChatService:
    @staticmethod
    async def send_message(
        db: AsyncSession, session_id: str | None, message: str, model: str | None
    ) -> tuple[str, str]:
        """Create/get session, save user message, return (session_id, message_id)."""
        from src.repositories.session_repository import SessionRepository
        
        repo = SessionRepository(db)
        
        if not session_id:
            from src.models.schemas import SessionCreate
            session = await repo.create_session(SessionCreate(), active_model=settings.MODEL_NAME)
            session_id = session.id
        
        session = await repo.get_by_id(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found.")
        
        from src.models.schemas import MessageCreate
        user_msg = await repo.add_message(session, MessageCreate(role="user", content=message))
        
        return session_id, user_msg.id

    @staticmethod
    async def stream_response(
        db: AsyncSession, session_id: str, model: str | None = None
    ) -> AsyncGenerator[str, None]:
        """Stream the assistant's reply as SSE events, saving the full response at the end."""
        from src.repositories.session_repository import SessionRepository
        from src.models.schemas import MessageCreate
        
        repo = SessionRepository(db)
        
        session = await repo.get_by_id(session_id)
        if not session:
            yield ChatService._sse_error("SESSION_NOT_FOUND", "Session does not exist.")
            return

        use_model = model or session.model or settings.MODEL_NAME
        
        # Build prompt from history
        messages = await repo.get_recent_messages(session_id, limit=20)
        prompt = ""
        for msg in messages:
            if msg.role == "user":
                prompt += f"User: {msg.content}\n"
            elif msg.role == "assistant":
                prompt += f"Assistant: {msg.content}\n"
        prompt += "Assistant: "

        full_response = ""
        try:
            async for token in ollama_client.generate_stream(prompt, use_model):
                full_response += token
                yield ChatService._sse_token(token)
        except Exception as exc:
            logger.error(f"Ollama streaming error: {exc}")
            if full_response:
                await repo.add_message(session, MessageCreate(role="assistant", content=full_response))
            yield ChatService._sse_error("OLLAMA_ERROR", str(exc))
            return

        if full_response:
            await repo.add_message(session, MessageCreate(role="assistant", content=full_response))
            yield ChatService._sse_done(session_id)
        else:
            yield ChatService._sse_error("EMPTY_RESPONSE", "Model returned no content.")

    @staticmethod
    def _sse_token(content: str) -> str:
        return f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"

    @staticmethod
    def _sse_done(message_id: str) -> str:
        return f"data: {json.dumps({'type': 'done', 'message_id': message_id})}\n\n"

    @staticmethod
    def _sse_error(code: str, message: str) -> str:
        return f"data: {json.dumps({'type': 'error', 'code': code, 'message': message})}\n\n"