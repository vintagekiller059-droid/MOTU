"""SQLAlchemy ORM models."""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import String, Text, Index, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base
from idgen import uuid7


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid7)
    title: Mapped[str] = mapped_column(String(255), default="New Chat")
    model: Mapped[str] = mapped_column(String(100), default="qwen2.5:1.5b")
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)
    message_count: Mapped[int] = mapped_column(Integer, default=0)

    messages: Mapped[List["Message"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    __table_args__ = (Index("idx_sessions_updated", "updated_at"),)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid7)
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tokens: Mapped[Optional[int]] = mapped_column(Integer, default=None, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)

    session: Mapped["Session"] = relationship(back_populates="messages")

    __table_args__ = (Index("idx_messages_session", "session_id", "created_at"),)