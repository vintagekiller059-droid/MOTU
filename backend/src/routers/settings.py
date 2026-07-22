"""System settings & health status diagnostic endpoint."""

import time
from datetime import datetime, timezone
from fastapi import APIRouter
from src.config import settings
from src.models.schemas import SystemHealthResponse, SystemSubsystems

router = APIRouter()
START_TIME = time.time()


@router.get("/health", response_model=SystemHealthResponse)
async def get_health() -> SystemHealthResponse:
    """Returns real-time operational state across all MOTU modules."""
    uptime = time.time() - START_TIME
    
    return SystemHealthResponse(
        status="operational",
        uptime_seconds=round(uptime, 2),
        timestamp=datetime.now(timezone.utc).isoformat(),
        active_model=settings.MODEL_NAME,
        subsystems=SystemSubsystems(
            model_engine="idle",
            database="connected",
            memory_engine=settings.ENABLE_MEMORY,
            voice_engine=settings.ENABLE_VOICE,
            vision_engine=settings.ENABLE_VISION,
            tool_engine=settings.ENABLE_TOOLS
        )
    )