"""MOTU Local AI Operating System Core Entry Point."""

from contextlib import asynccontextmanager  # <-- ADD THIS MISSING IMPORT
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.utils.logger import setup_logger
from src.database.session import init_db
from src.services.ollama_client import ollama_client
from src.routers import chat, settings as settings_router, models, sessions

logger = setup_logger("Main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management for initialization and clean teardown."""
    logger.info("Starting MOTU Operating System Core...")
    await init_db()
    logger.info(f"Target local model configured: '{settings.MODEL_NAME}'")
    
    yield
    
    logger.info("Closing persistent HTTP connections...")
    await ollama_client.close()
    logger.info("Stopping MOTU OS Core cleanly...")


app = FastAPI(
    title="MOTU Local AI OS Core",
    description="OS-grade local AI session workspace engine",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Mounting
app.include_router(sessions.router, prefix="/api", tags=["OS Sessions Workspace"])
app.include_router(chat.router, prefix="/api", tags=["Chat Engine"])
app.include_router(settings_router.router, prefix="/api", tags=["Settings & Health"])
app.include_router(models.router, prefix="/api", tags=["Model Management"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)