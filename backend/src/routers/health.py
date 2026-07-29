"""Health check endpoint."""

import time
import logging

import psutil
from fastapi import APIRouter
from sqlalchemy import text

from config import settings
from db import engine
from ollama_client import check_health
from schemas import HealthResponse

router = APIRouter()
logger = logging.getLogger(__name__)
_START_TIME = time.time()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    mem = psutil.virtual_memory()
    ollama_ok = await check_health()

    # Check database connectivity
    db_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception as e:
        logger.warning("Database health check failed: %s", e)

    return HealthResponse(
        status="ok",
        version="1.0.0",
        uptime=round(time.time() - _START_TIME, 2),
        cpu_percent=round(psutil.cpu_percent(interval=0.1), 1),
        memory_percent=round(mem.percent, 1),
        memory_used_gb=round(mem.used / (1024 ** 3), 2),
        ollama_connected=ollama_ok,
        database_connected=db_ok,
        active_model=settings.MODEL_NAME,
    )