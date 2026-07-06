"""Route aggregation for v3."""
from fastapi import APIRouter

from app.api.endpoints import chat, memory, voice

router = APIRouter()
router.include_router(chat.router, prefix="/chat")
router.include_router(memory.router, prefix="/conversations")
router.include_router(voice.router, prefix="/voice")
