"""Pydantic request/response models."""

from datetime import datetime
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, ConfigDict, Field


# ═══════════════════════════════════════════════════════════════
# Message Schemas
# ═══════════════════════════════════════════════════════════════

class MessageCreate(BaseModel):
    """Schema for creating a new message."""
    role: str
    content: str
    parent_message_id: Optional[str] = None
    token_count: Optional[int] = 0
    generation_time: Optional[float] = 0.0
    metadata_json: Optional[Dict[str, Any]] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime


# ═══════════════════════════════════════════════════════════════
# Session Schemas
# ═══════════════════════════════════════════════════════════════

class SessionCreate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7
    max_context_messages: Optional[int] = 20


class SessionUpdate(BaseModel):
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


# ═══════════════════════════════════════════════════════════════
# Chat Schemas
# ═══════════════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


# ═══════════════════════════════════════════════════════════════
# Model Schemas
# ═══════════════════════════════════════════════════════════════

class ModelInfo(BaseModel):
    name: str
    size: int
    parameter_count: str
    format: str


class ModelListResponse(BaseModel):
    models: List[ModelInfo]


class ActiveModelResponse(BaseModel):
    active_model: str


# ═══════════════════════════════════════════════════════════════
# Health Schemas
# ═══════════════════════════════════════════════════════════════

class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    ollama_connected: bool
    database_connected: bool
    active_model: str


class SystemSubsystems(BaseModel):
    model_engine: str
    database: str
    memory_engine: bool
    voice_engine: bool
    vision_engine: bool
    tool_engine: bool


class SystemHealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    timestamp: str
    active_model: str
    subsystems: SystemSubsystems


# ═══════════════════════════════════════════════════════════════
# User Profile Schemas
# ═══════════════════════════════════════════════════════════════

class UserProfileBase(BaseModel):
    """Base profile fields — all optional."""
    name: Optional[str] = None
    education: Optional[str] = None
    projects: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    goals: List[str] = Field(default_factory=list)
    additional: Dict[str, Any] = Field(default_factory=dict)


class UserProfileCreate(UserProfileBase):
    """Create or replace the entire profile."""
    pass


class UserProfileUpdate(BaseModel):
    """Partial update — only send fields you want to change."""
    name: Optional[str] = None
    education: Optional[str] = None
    projects: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    additional: Optional[Dict[str, Any]] = None


class UserProfileResponse(UserProfileBase):
    """Full profile response with metadata."""
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════
# Module System Schemas (for debugging / admin UI)
# ═══════════════════════════════════════════════════════════════

class ModuleResultSchema(BaseModel):
    """Serializable version of ModuleResult for API responses."""
    module: str
    content: Dict[str, Any]
    confidence: float
    latency_ms: float


class PlannerDecisionSchema(BaseModel):
    """Serializable version of PlannerDecision."""
    modules: List[str]
    reasoning: str
    priority: str


class ChatDebugInfo(BaseModel):
    """Optional debug payload showing what modules ran."""
    planner: PlannerDecisionSchema
    modules: List[ModuleResultSchema]
    context_tokens: int