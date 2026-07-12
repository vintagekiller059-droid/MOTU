"""Pydantic request/response models."""

from datetime import datetime

from pydantic import BaseModel, Field


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


# ─────────────────────────────────────────────────────────────
# Memory Schemas
# ─────────────────────────────────────────────────────────────

class MemoryEntryTag(BaseModel):
    tag: str

    class Config:
        from_attributes = True


class MemoryEntryResponse(BaseModel):
    id: str
    content: str
    entry_type: str
    importance: int
    source: str
    schema_version: int
    fingerprint: str
    source_session_id: str | None
    source_message_id: str | None
    confidence: float
    is_pinned: bool
    access_count: int
    created_at: datetime
    updated_at: datetime
    last_accessed_at: datetime | None
    tags: list[str] = Field(default_factory=list)

    class Config:
        from_attributes = True


class MemorySearchResult(BaseModel):
    entry: MemoryEntryResponse
    score: float


class MemorySearchRequest(BaseModel):
    query: str
    limit: int = Field(default=10, ge=1, le=100)
    entry_type: str | None = None


class MemoryCreateRequest(BaseModel):
    content: str
    entry_type: str
    importance: int = Field(default=50, ge=0, le=100)
    source: str = Field(default="user")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    tags: list[str] = Field(default_factory=list)
    source_session_id: str | None = None
    source_message_id: str | None = None


class MemoryPinRequest(BaseModel):
    is_pinned: bool


class MemoryImportanceRequest(BaseModel):
    importance: int = Field(ge=0, le=100)


class MemoryListResponse(BaseModel):
    memories: list[MemoryEntryResponse]


class MemorySearchResponse(BaseModel):
    results: list[MemorySearchResult]


class ExtractedMemory(BaseModel):
    type: str
    content: str
    importance: int = Field(ge=0, le=100)
    confidence: float = Field(ge=0.0, le=1.0)
    tags: list[str] = Field(default_factory=list)
    source: str = "assistant"


class MemoryExtractionResult(BaseModel):
    memories: list[ExtractedMemory]
