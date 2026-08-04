"""Health check endpoint — async version compatible with new architecture."""

import time
import logging

import psutil
from fastapi import APIRouter
from sqlalchemy import text

from src.config import settings
from src.database.session import engine
from src.services.ollama_client import ollama_client
from src.models.schemas import HealthResponse

router = APIRouter()
logger = logging.getLogger(__name__)
_START_TIME = time.time()

@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    mem = psutil.virtual_memory()
    ollama_ok = await ollama_client.check_health()

    db_ok = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception as e:
        logger.warning("Database health check failed: %s", e)

    return HealthResponse(
        status="ok",
        version="2.0.0",
        uptime=round(time.time() - _START_TIME, 2),
        cpu_percent=round(psutil.cpu_percent(interval=0.1), 1),
        memory_percent=round(mem.percent, 1),
        memory_used_gb=round(mem.used / (1024 ** 3), 2),
        ollama_connected=ollama_ok,
        database_connected=db_ok,
        active_model=settings.MODEL_NAME,
    )