"""Business logic engine handling automated title and summary generations."""

from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from src.config import settings
from src.repositories.session_repository import SessionRepository
from src.models.database import SessionModel, MessageModel
from src.models.schemas import SessionCreate, SessionUpdate, MessageCreate
from src.services.ollama_client import ollama_client
from src.utils.logger import setup_logger

logger = setup_logger("SessionService")


class SessionService:
    """Manages workspace lifecycle, title generation, and context summarization."""

    def __init__(self, db: AsyncSession):
        self.repo = SessionRepository(db)

    async def create_session(self, payload: SessionCreate) -> SessionModel:
        model_name = payload.active_model or settings.MODEL_NAME
        return await self.repo.create_session(payload, active_model=model_name)

    async def get_session_detail(self, session_id: str, window: int = 20) -> Tuple[SessionModel, List[MessageModel]]:
        session = await self.repo.get_by_id(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found.")
        messages = await self.repo.get_recent_messages(session_id, limit=window)
        return session, messages

    async def update_session(self, session_id: str, payload: SessionUpdate) -> SessionModel:
        session = await self.repo.get_by_id(session_id, touch_access=False)
        if not session:
            raise ValueError(f"Session '{session_id}' not found.")
            
        if payload.title is not None:
            session.title = payload.title
        if payload.active_model is not None:
            session.active_model = payload.active_model
        if payload.system_prompt is not None:
            session.system_prompt = payload.system_prompt
        if payload.temperature is not None:
            session.temperature = payload.temperature
        if payload.max_context_messages is not None:
            session.max_context_messages = payload.max_context_messages
        if payload.is_pinned is not None:
            session.is_pinned = payload.is_pinned
        if payload.is_archived is not None:
            session.is_archived = payload.is_archived

        return await self.repo.update_session(session)

    async def append_turns_and_summarize(
        self, 
        session: SessionModel, 
        user_payload: MessageCreate, 
        assistant_payload: MessageCreate
    ) -> None:
        """Saves interaction turns and conditionally auto-generates titles/summaries."""
        await self.repo.add_message(session, user_payload)
        await self.repo.add_message(session, assistant_payload)

        # Check for first-turn title generation
        recent_msgs = await self.repo.get_recent_messages(session.id, limit=10)
        if len(recent_msgs) <= 2 and session.title == "New Companion Workspace":
            await self._generate_title(session, user_payload.content)

        # Auto-summarize when message limit exceeds configured threshold
        if len(recent_msgs) >= session.max_context_messages:
            await self._generate_summary(session, recent_msgs)

    async def _generate_title(self, session: SessionModel, text: str) -> None:
        prompt = f"Summarize this prompt into a 3-5 word concise title. Return ONLY the title text:\n\n'{text}'"
        try:
            title = ""
            async for token in ollama_client.generate_stream(prompt=prompt, model=session.active_model):
                title += token
            clean = title.strip().replace('"', '').replace('\n', '')
            if clean:
                session.title = clean[:255]
                logger.info(f"Auto-generated workspace title: '{clean}'")
        except Exception as e:
            logger.warning(f"Failed to auto-generate title: {e}")

    async def _generate_summary(self, session: SessionModel, messages: List[MessageModel]) -> None:
        msgs_text = "\n".join([f"{m.role.upper()}: {m.content}" for m in messages])
        prompt = (
            f"Existing Summary: {session.summary or 'None'}\n\n"
            f"Recent Context:\n{msgs_text}\n\n"
            "Task: Generate a 2-3 sentence rolling context summary of key facts. Return ONLY the summary:"
        )
        try:
            summary = ""
            async for token in ollama_client.generate_stream(prompt=prompt, model=session.active_model):
                summary += token
            if summary.strip():
                session.summary = summary.strip()
                logger.info(f"Updated rolling context summary for session {session.id}")
        except Exception as e:
            logger.warning(f"Failed to update context summary: {e}")