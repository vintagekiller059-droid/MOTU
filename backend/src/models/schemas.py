"""MOTU Core System Pydantic Schemas."""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


# --- Chat & Message Schemas ---

class MessageBase(BaseModel):
    role: str
    content: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: str
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0)
    system_prompt: Optional[str] = None


# --- Health & Settings Schemas ---

class SystemSubsystems(BaseModel):
    database: bool
    ollama: bool
    storage: Optional[bool] = True


class SystemHealthResponse(BaseModel):
    status: str
    model: str
    subsystems: SystemSubsystems
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SystemSettingsUpdate(BaseModel):
    model_name: Optional[str] = None
    temperature: Optional[float] = None
    system_prompt: Optional[str] = None


# --- Session Workspace Schemas ---

class SessionBase(BaseModel):
    title: str = Field(default="New Session")
    model: str = Field(default="qwen2.5:1.5b")


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None


class SessionResponse(SessionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SessionDetailResponse(SessionResponse):
    messages: List[MessageResponse] = []


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]


# --- Model Management Schemas ---

class ModelInfo(BaseModel):
    name: str
    size: Optional[int] = None
    digest: Optional[str] = None
    modified_at: Optional[datetime] = None


class ModelListResponse(BaseModel):
    models: List[ModelInfo]