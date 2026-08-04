"""Ollama model listing endpoints."""

import logging
from fastapi import APIRouter

from src.config import settings
from src.services.ollama_client import ollama_client
from src.models.schemas import ModelListResponse, ActiveModelResponse, ModelInfo

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/models", response_model=ModelListResponse)
async def get_models() -> ModelListResponse:
    models = await ollama_client.list_models()
    logger.info("Listed %d models", len(models))
    return ModelListResponse(
        models=[ModelInfo(**m) for m in models]
    )

@router.get("/models/active", response_model=ActiveModelResponse)
async def get_active_model() -> ActiveModelResponse:
    return ActiveModelResponse(active_model=settings.MODEL_NAME)