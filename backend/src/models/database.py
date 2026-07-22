"""SQLAlchemy ORM database definitions matching explicit OS schema design."""

import uuid
import time
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Text, Boolean, Integer, Float, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database.session import Base


def generate_uuidv7() -> str:
    """Generates a time-ordered UUIDv7 string for sequential primary key indexing."""
    # Standard 48-bit timestamp in milliseconds
    ms = int(time.time() * 1000)
    rand_bytes = os_random_bytes = uuid.uuid4().bytes
    
    # Construct 16-byte UUIDv7 payload
    v7_bytes = bytearray(16)
    v7_bytes[0:6] = ms.to_bytes(6, byteorder='big')
    v7_bytes[6] = (rand_bytes[6] & 0x0F) | 0x70  # Version 7
    v7_bytes[7] = (rand_bytes[7] & 0x3F) | 0x80  # Variant 10
    v7_bytes[8:16] = rand_bytes[8:16]
    
    return str(uuid.UUID(bytes=bytes(v7_bytes)))


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SessionModel(Base):
    """OS Workspace Session tracking model parameters and context bounds."""

    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuidv7)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="New Companion Workspace")
    active_model: Mapped[str] = mapped_column(String(100), nullable=False)
    system_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    temperature: Mapped[float] = mapped_column(Float, default=0.7, nullable=False)
    context_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_context_messages: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    messages: Mapped[List["MessageModel"]] = relationship(
        "MessageModel",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="MessageModel.created_at.asc()"
    )

    __table_args__ = (
        Index("idx_sessions_status", "is_deleted", "is_archived", "is_pinned", "last_accessed_at"),
    )


class MessageModel(Base):
    """Individual interaction record supporting parent branching and file attachments."""

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuidv7)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    parent_message_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    token_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    generation_time: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    session: Mapped["SessionModel"] = relationship("SessionModel", back_populates="messages")
    parent_message: Mapped[Optional["MessageModel"]] = relationship("MessageModel", remote_side=[id])
    attachments: Mapped[List["AttachmentModel"]] = relationship(
        "AttachmentModel",
        back_populates="message",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_messages_session_created", "session_id", "created_at"),
    )


class AttachmentModel(Base):
    """Files or media contexts attached to message prompts."""

    __tablename__ = "attachments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuidv7)
    message_id: Mapped[str] = mapped_column(String(36), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    local_path: Mapped[str] = mapped_column(String(512), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    message: Mapped["MessageModel"] = relationship("MessageModel", back_populates="attachments")