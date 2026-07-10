"""Ollama model management."""

from fastapi import APIRouter, HTTPException

from models.schemas import ModelInfo, ModelListResponse
from services.ollama_client import OllamaError, ollama_client

router = APIRouter(prefix="/api/v1/models", tags=["models"])


@router.get("", response_model=ModelListResponse)
async def list_models():
    try:
        models = await ollama_client.list_models()
    except OllamaError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return ModelListResponse(models=[ModelInfo(**m) for m in models])