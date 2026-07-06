"""Pydantic schemas for chat endpoints."""
from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    model: str = "qwen2.5"
    temperature: float = 0.7
    conversation_id: Optional[str] = None


class ModelInfo(BaseModel):
    name: str
    size: Optional[int] = None
    parameter_size: Optional[str] = None
