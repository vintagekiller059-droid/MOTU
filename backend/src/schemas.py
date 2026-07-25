"""Pydantic request/response models."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime


class SessionCreate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    message_count: int


class SessionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse]


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


class ModelInfo(BaseModel):
    name: str
    size: int
    parameter_count: str
    format: str


class ModelListResponse(BaseModel):
    models: List[ModelInfo]


class ActiveModelResponse(BaseModel):
    active_model: str


class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    ollama_connected: bool
