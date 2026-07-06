"""Pydantic schemas for memory endpoints."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class MessageCreate(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    model: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    timestamp: datetime
    model: Optional[str] = None

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    title: str = "New Conversation"


class ConversationUpdate(BaseModel):
    title: str


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []
