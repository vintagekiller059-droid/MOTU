"""Core chat business logic — orchestrates sessions + Ollama streaming."""

import json
from collections.abc import AsyncGenerator

from sqlalchemy.orm import Session as DBSession

from config import settings
from services.ollama_client import OllamaError, ollama_client
from services.session_service import SessionService


class ChatService:
    @staticmethod
    def send_message(
        db: DBSession, session_id: str | None, message: str, model: str | None
    ) -> tuple[str, str]:
        """Ensure a session exists, save the user message, return (session_id, message_id)."""
        session = SessionService.get_or_create_session(db, session_id, model)
        user_message = SessionService.add_message(db, session.id, "user", message)
        return session.id, user_message.id

    @staticmethod
    async def stream_response(
        db: DBSession, session_id: str, model: str | None = None
    ) -> AsyncGenerator[str, None]:
        """Stream the assistant's reply as SSE events, saving the full response at the end."""
        session = SessionService.get_session(db, session_id)
        if not session:
            yield ChatService._sse_error("SESSION_NOT_FOUND", "Session does not exist.")
            return

        use_model = model or session.model or settings.default_model
        history = SessionService.get_history(db, session_id)

        full_response = ""
        try:
            async for token in ollama_client.chat_stream(history, use_model):
                full_response += token
                yield ChatService._sse_token(token)
        except OllamaError as exc:
            if full_response:
                SessionService.add_message(
                    db, session_id, "assistant", full_response
                )
            yield ChatService._sse_error("OLLAMA_ERROR", str(exc))
            return

        if full_response:
            assistant_message = SessionService.add_message(
                db, session_id, "assistant", full_response
            )
            yield ChatService._sse_done(assistant_message.id)
        else:
            yield ChatService._sse_error(
                "EMPTY_RESPONSE", "Model returned no content."
            )

    @staticmethod
    def _sse_token(content: str) -> str:
        return f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"

    @staticmethod
    def _sse_done(message_id: str) -> str:
        return f"data: {json.dumps({'type': 'done', 'message_id': message_id})}\n\n"

    @staticmethod
    def _sse_error(code: str, message: str) -> str:
        return f"data: {json.dumps({'type': 'error', 'code': code, 'message': message})}\n\n"