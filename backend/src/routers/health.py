"""Health check endpoint."""

import time

import psutil
from fastapi import APIRouter

from ollama_client import check_health
from schemas import HealthResponse

router = APIRouter()
_START_TIME = time.time()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    mem = psutil.virtual_memory()
    ollama_ok = await check_health()

    return HealthResponse(
        status="ok",
        version="1.0.0",
        uptime=round(time.time() - _START_TIME, 2),
        cpu_percent=round(psutil.cpu_percent(interval=0.1), 1),
        memory_percent=round(mem.percent, 1),
        memory_used_gb=round(mem.used / (1024 ** 3), 2),
        ollama_connected=ollama_ok,
    )
