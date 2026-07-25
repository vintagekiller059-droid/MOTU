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
        model_name = payload.model or settings.MODEL_NAME
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
        if payload.model is not None:
            session.model = payload.model

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
            await self._generate_title(session)

    async def _generate_title(self, session: SessionModel) -> None:
        """Generates a concise title from the first user message."""
        try:
            recent = await self.repo.get_recent_messages(session.id, limit=2)
            user_msg = next((m for m in recent if m.role == "user"), None)
            if not user_msg:
                return

            prompt = f"Generate a very short title (3-5 words) for this conversation: {user_msg.content}"
            title = ""
            async for token in ollama_client.generate_stream(prompt, session.model or settings.MODEL_NAME):
                title += token

            session.title = title.strip()[:50] or "New Chat"
            await self.repo.update_session(session)
            logger.info(f"Auto-generated session title: '{session.title}'")
        except Exception as exc:
            logger.warning(f"Title generation failed: {exc}")
            session.title = "New Chat"
            await self.repo.update_session(session)