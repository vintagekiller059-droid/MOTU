"""Ollama model listing endpoints."""

from fastapi import APIRouter

from config import settings
from ollama_client import list_models
from schemas import ModelListResponse, ActiveModelResponse, ModelInfo

router = APIRouter()


@router.get("/models", response_model=ModelListResponse)
async def get_models() -> ModelListResponse:
    models = await list_models()
    return ModelListResponse(
        models=[ModelInfo(**m) for m in models]
    )


@router.get("/models/active", response_model=ActiveModelResponse)
async def get_active_model() -> ActiveModelResponse:
    return ActiveModelResponse(active_model=settings.MODEL_NAME)
