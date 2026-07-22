"""API router for Ollama model querying and switching capabilities."""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from src.services.ollama_client import ollama_client
from src.config import settings

router = APIRouter()


@router.get("/models", response_model=List[Dict[str, Any]])
async def get_models():
    """Returns a list of all models installed in the local Ollama instance."""
    is_alive = await ollama_client.check_health()
    if not is_alive:
        raise HTTPException(
            status_code=503, 
            detail="Ollama service is currently unreachable. Ensure Ollama is running locally."
        )

    models = await ollama_client.list_models()
    return models


@router.get("/models/active")
async def get_active_model():
    """Returns the currently active default model configuration."""
    return {
        "active_model": settings.MODEL_NAME,
        "ollama_url": settings.OLLAMA_URL
    }