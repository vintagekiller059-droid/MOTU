import time

import psutil
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database.connection import init_db
from models.schemas import HealthResponse
from routers import chat, memory as memory_router, models as models_router, sessions
from services.ollama_client import ollama_client

app = FastAPI(
    title="MOTU API",
    description="My Own Thinking Unit — Backend API",
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(sessions.router)
app.include_router(models_router.router)
app.include_router(memory_router.router)

_start_time = time.monotonic()


@app.on_event("startup")
async def on_startup():
    init_db()


@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check(response: Response):
    response.headers["Cache-Control"] = "no-store"
    ollama_connected = await ollama_client.is_available()
    vm = psutil.virtual_memory()
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        uptime=round(time.monotonic() - _start_time, 1),
        cpu_percent=psutil.cpu_percent(interval=0.1),
        memory_percent=vm.percent,
        memory_used_gb=round(vm.used / (1024**3), 2),
        ollama_connected=ollama_connected,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
