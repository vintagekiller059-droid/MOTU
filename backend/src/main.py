"""FastAPI application factory and lifespan management."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.database.session import init_db
from src.services.ollama_client import ollama_client
from src.routers import health, models, sessions, chat, profile
from src.utils.logger import setup_logger

logger = setup_logger("Main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("MOTU Backend v2.0 starting up...")
    await init_db()
    logger.info("Database initialized at %s", settings.DATABASE_PATH.resolve())
    yield
    logger.info("MOTU Backend shutting down...")
    await ollama_client.close()

app = FastAPI(
    title="MOTU Backend",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.LOG_LEVEL == "DEBUG" else None,
    redoc_url="/redoc" if settings.LOG_LEVEL == "DEBUG" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers with /api/v1 prefix
app.include_router(health.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")  # NEW

@app.get("/")
async def root():
    return {"message": "MOTU Backend", "version": "2.0.0", "modules": "active"}