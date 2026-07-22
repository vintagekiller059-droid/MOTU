"""
Placeholders for Memory ORM models and Vector/Memory Pydantic schemas.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class MemoryEntry(BaseModel):
    """Pydantic schema representing a single retrieved memory item."""
    id: str
    session_id: Optional[str] = None
    content: str
    embedding: Optional[List[float]] = None
    metadata_json: Optional[Dict[str, Any]] = None
    score: Optional[float] = None
    created_at: Optional[datetime] = None


class MemorySearchQuery(BaseModel):
    """Payload for querying vector memory."""
    query: str
    limit: int = Field(default=5, ge=1, le=20)
    min_score: float = Field(default=0.7, ge=0.0, le=1.0)
    session_id: Optional[str] = None