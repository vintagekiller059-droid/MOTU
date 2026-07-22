"""Data Access Object (DAO) for Workspace Sessions, Messages, and Attachments."""

from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy import select, update, func, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.database import SessionModel, MessageModel, AttachmentModel
from src.models.schemas import SessionCreate, MessageCreate


class SessionRepository:
    """DAO handling database queries with explicit UUIDv7 sorting and filtering."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session(self, payload: SessionCreate, active_model: str) -> SessionModel:
        session = SessionModel(
            title=payload.title or "New Companion Workspace",
            active_model=active_model,
            system_prompt=payload.system_prompt,
            temperature=payload.temperature or 0.7,
            max_context_messages=payload.max_context_messages or 20
        )
        self.db.add(session)
        await self.db.flush()
        return session

    async def get_by_id(self, session_id: str, touch_access: bool = True) -> Optional[SessionModel]:
        stmt = select(SessionModel).where(
            SessionModel.id == session_id,
            SessionModel.is_deleted == False
        )
        result = await self.db.execute(stmt)
        session = result.scalar_one_or_none()
        
        if session and touch_access:
            session.last_accessed_at = datetime.now(timezone.utc)
            await self.db.flush()
            
        return session

    async def list_sessions(self, include_archived: bool = False, limit: int = 50, offset: int = 0) -> Tuple[List[SessionModel], int]:
        base_query = select(SessionModel).where(SessionModel.is_deleted == False)
        if not include_archived:
            base_query = base_query.where(SessionModel.is_archived == False)

        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0

        query = base_query.order_by(
            desc(SessionModel.is_pinned), 
            desc(SessionModel.last_accessed_at)
        ).limit(limit).offset(offset)
        
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def update_session(self, session: SessionModel) -> SessionModel:
        session.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return session

    async def soft_delete(self, session_id: str) -> bool:
        stmt = update(SessionModel).where(SessionModel.id == session_id).values(is_deleted=True)
        result = await self.db.execute(stmt)
        return result.rowcount > 0

    async def add_message(self, session: SessionModel, payload: MessageCreate) -> MessageModel:
        msg = MessageModel(
            session_id=session.id,
            parent_message_id=payload.parent_message_id,
            role=payload.role,
            content=payload.content,
            model_name=session.active_model,
            token_count=payload.token_count or 0,
            generation_time=payload.generation_time or 0.0,
            metadata_json=payload.metadata_json
        )
        self.db.add(msg)
        
        session.context_tokens += (payload.token_count or 0)
        session.updated_at = datetime.now(timezone.utc)
        session.last_accessed_at = datetime.now(timezone.utc)
        await self.db.flush()
        return msg

    async def get_recent_messages(self, session_id: str, limit: int = 20) -> List[MessageModel]:
        """Loads bounded message window for LLM prompt context."""
        stmt = (
            select(MessageModel)
            .where(MessageModel.session_id == session_id)
            .order_by(desc(MessageModel.created_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        messages = list(result.scalars().all())
        messages.reverse()
        return messages

    async def search_sessions(self, query_str: str) -> List[SessionModel]:
        pattern = f"%{query_str}%"
        stmt = (
            select(SessionModel)
            .outerjoin(MessageModel)
            .where(
                SessionModel.is_deleted == False,
                or_(
                    SessionModel.title.ilike(pattern),
                    SessionModel.summary.ilike(pattern),
                    MessageModel.content.ilike(pattern)
                )
            )
            .distinct()
            .order_by(desc(SessionModel.last_accessed_at))
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())