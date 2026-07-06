"""CRUD operations for conversations and messages."""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.db.models import Conversation, Message


def create_conversation(db: Session, title: str = "New Conversation") -> Conversation:
    conv = Conversation(title=title)
    db.add(conv)
    db.flush()
    return conv


def get_conversation(db: Session, conversation_id: str) -> Optional[Conversation]:
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()


def list_conversations(db: Session, limit: int = 50, offset: int = 0) -> List[Conversation]:
    return (
        db.query(Conversation)
        .order_by(desc(Conversation.updated_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def update_conversation(db: Session, conversation_id: str, title: str) -> Optional[Conversation]:
    conv = get_conversation(db, conversation_id)
    if conv:
        conv.title = title
        conv.updated_at = datetime.utcnow()
    return conv


def delete_conversation(db: Session, conversation_id: str) -> bool:
    conv = get_conversation(db, conversation_id)
    if conv:
        db.delete(conv)
        return True
    return False


def create_message(
    db: Session,
    conversation_id: str,
    role: str,
    content: str,
    model: Optional[str] = None
) -> Message:
    msg = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        model=model
    )
    db.add(msg)
    conv = get_conversation(db, conversation_id)
    if conv:
        conv.updated_at = datetime.utcnow()
    db.flush()
    return msg


def get_messages(db: Session, conversation_id: str) -> List[Message]:
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.timestamp)
        .all()
    )
