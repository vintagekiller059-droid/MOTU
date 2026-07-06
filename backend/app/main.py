"""MOTU v3 — FastAPI entry point with Memory + Voice."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db
from app.api.routes import router as api_router

app = FastAPI(
    title="MOTU API",
    description="My Own Thinking Unit — Local AI Companion (v3)",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()
    print("Database initialized at data/motu.db")

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok", "version": "3.0.0"}
