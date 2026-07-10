"""Pydantic request/response models."""

from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str
    model: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    message_id: str


class SessionCreate(BaseModel):
    title: str | None = None
    model: str | None = None


class SessionSummary(BaseModel):
    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    message_count: int

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    sessions: list[SessionSummary]


class SessionDetailResponse(BaseModel):
    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse]


class ModelInfo(BaseModel):
    name: str
    size: int = 0
    parameter_count: str = ""
    format: str = ""


class ModelListResponse(BaseModel):
    models: list[ModelInfo]


class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    ollama_connected: bool