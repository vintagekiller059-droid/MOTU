"""Conversation persistence logic."""

from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from models.database import MessageModel, SessionModel


class SessionService:
    @staticmethod
    def create_session(
        db: DBSession, title: str | None = None, model: str | None = None
    ) -> SessionModel:
        session = SessionModel(
            title=title or "New Conversation",
            model=model or "llama3.1",
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_session(db: DBSession, session_id: str) -> SessionModel | None:
        return db.get(SessionModel, session_id)

    @staticmethod
    def get_or_create_session(
        db: DBSession, session_id: str | None, model: str | None = None
    ) -> SessionModel:
        if session_id:
            existing = SessionService.get_session(db, session_id)
            if existing:
                return existing
        return SessionService.create_session(db, model=model)

    @staticmethod
    def list_sessions(db: DBSession) -> list[SessionModel]:
        stmt = select(SessionModel).order_by(SessionModel.updated_at.desc())
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def delete_session(db: DBSession, session_id: str) -> bool:
        session = db.get(SessionModel, session_id)
        if not session:
            return False
        db.delete(session)
        db.commit()
        return True

    @staticmethod
    def add_message(
        db: DBSession, session_id: str, role: str, content: str
    ) -> MessageModel:
        message = MessageModel(session_id=session_id, role=role, content=content)
        db.add(message)

        session = db.get(SessionModel, session_id)
        if session:
            session.message_count += 1
            if role == "user" and session.message_count == 1:
                session.title = content[:60]

        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_history(db: DBSession, session_id: str) -> list[dict]:
        stmt = (
            select(MessageModel)
            .where(MessageModel.session_id == session_id)
            .order_by(MessageModel.created_at)
        )
        rows = db.execute(stmt).scalars().all()
        return [{"role": m.role, "content": m.content} for m in rows]