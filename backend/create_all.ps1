# Create all V2 backend files

$src = "C:\Users\shaik\OneDrive\Desktop\MOTU\backend\src"
$routers = "$src\routers"

# Ensure directories exist
New-Item -ItemType Directory -Force -Path $routers | Out-Null

# config.py
@'
"""Application configuration."""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    OLLAMA_URL: str = "http://localhost:11434"
    MODEL_NAME: str = "qwen2.5:1.5b"
    DATABASE_PATH: Path = Path("./motu.db")
    LOG_LEVEL: str = "INFO"

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            HOST=os.getenv("MOTU_HOST", cls.HOST),
            PORT=int(os.getenv("MOTU_PORT", cls.PORT)),
            OLLAMA_URL=os.getenv("MOTU_OLLAMA_URL", cls.OLLAMA_URL),
            MODEL_NAME=os.getenv("MOTU_MODEL_NAME", cls.MODEL_NAME),
            DATABASE_PATH=Path(os.getenv("MOTU_DATABASE_PATH", str(cls.DATABASE_PATH))),
            LOG_LEVEL=os.getenv("MOTU_LOG_LEVEL", cls.LOG_LEVEL),
        )


settings = Settings.from_env()
'@ | Set-Content -Path "$src\config.py" -Encoding UTF8

# idgen.py
@'
"""Time-ordered UUIDv7 generator (RFC 9562)."""

import time
import uuid


def uuid7() -> str:
    timestamp_ms = int(time.time() * 1000)
    timestamp_bytes = timestamp_ms.to_bytes(6, "big")
    rand_bytes = uuid.uuid4().bytes
    v7 = bytearray(16)
    v7[0:6] = timestamp_bytes
    v7[6] = (rand_bytes[6] & 0x0F) | 0x70
    v7[7] = (rand_bytes[7] & 0x3F) | 0x80
    v7[8:16] = rand_bytes[8:16]
    return str(uuid.UUID(bytes=bytes(v7)))


def uuid7_to_datetime(uuid_str: str) -> float:
    u = uuid.UUID(uuid_str)
    timestamp_ms = int.from_bytes(u.bytes[0:6], "big")
    return timestamp_ms / 1000.0
'@ | Set-Content -Path "$src\idgen.py" -Encoding UTF8

# db.py
@'
"""SQLite database setup with WAL mode."""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings

DB_URL = f"sqlite:///{settings.DATABASE_PATH.resolve()}"

engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
    echo=False,
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
'@ | Set-Content -Path "$src\db.py" -Encoding UTF8

# orm.py
@'
"""SQLAlchemy ORM models."""

from datetime import datetime, timezone
from typing import List

from sqlalchemy import String, Text, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base
from idgen import uuid7


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid7)
    title: Mapped[str] = mapped_column(String(255), default="New Chat")
    model: Mapped[str] = mapped_column(String(100), default="qwen2.5:1.5b")
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    messages: Mapped[List["Message"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    __table_args__ = (Index("idx_sessions_updated", "updated_at"),)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid7)
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)

    session: Mapped["Session"] = relationship(back_populates="messages")

    __table_args__ = (Index("idx_messages_session", "session_id", "created_at"),)
'@ | Set-Content -Path "$src\orm.py" -Encoding UTF8

# schemas.py
@'
"""Pydantic request/response models."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime


class SessionCreate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    message_count: int


class SessionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse]


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


class ModelInfo(BaseModel):
    name: str
    size: int
    parameter_count: str
    format: str


class ModelListResponse(BaseModel):
    models: List[ModelInfo]


class ActiveModelResponse(BaseModel):
    active_model: str


class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    ollama_connected: bool
'@ | Set-Content -Path "$src\schemas.py" -Encoding UTF8

# deps.py
@'
"""FastAPI database dependency."""

from typing import Generator

from sqlalchemy.orm import Session

from db import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
'@ | Set-Content -Path "$src\deps.py" -Encoding UTF8

# ollama_client.py
@'
"""Async HTTP client for local Ollama instance."""

import json
import logging
from typing import AsyncGenerator, List, Dict, Any

import httpx

from config import settings

logger = logging.getLogger(__name__)

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.OLLAMA_URL,
            timeout=httpx.Timeout(120.0, connect=5.0),
        )
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def check_health() -> bool:
    try:
        client = get_client()
        resp = await client.get("/api/tags", timeout=3.0)
        return resp.status_code == 200
    except Exception:
        return False


async def list_models() -> List[Dict[str, Any]]:
    client = get_client()
    resp = await client.get("/api/tags")
    resp.raise_for_status()
    data = resp.json()

    models = []
    for m in data.get("models", []):
        name = m.get("name", "unknown")
        size = m.get("size", 0)
        param_count = "unknown"
        if ":" in name:
            tag = name.split(":")[1]
            if "b" in tag.lower():
                param_count = tag.lower().replace("b", "B")
        models.append({
            "name": name,
            "size": size,
            "parameter_count": param_count,
            "format": m.get("details", {}).get("format", "gguf"),
        })
    return models


async def stream_chat(
    messages: List[Dict[str, str]],
    model: str | None = None,
) -> AsyncGenerator[str, None]:
    client = get_client()
    model = model or settings.MODEL_NAME

    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
    }

    async with client.stream("POST", "/api/chat", json=payload) as resp:
        resp.raise_for_status()
        async for line in resp.aiter_lines():
            if not line.strip():
                continue
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                logger.warning("Ollama sent invalid JSON: %s", line)
                continue

            msg = data.get("message", {})
            token = msg.get("content", "")
            if token:
                yield token

            if data.get("done"):
                break
'@ | Set-Content -Path "$src\ollama_client.py" -Encoding UTF8

# main.py
@'
"""FastAPI application factory and lifespan management."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db import init_db
from ollama_client import close_client
from routers import health, models, sessions, chat

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("MOTU Backend V2 starting up...")
    init_db()
    logger.info("Database initialized at %s", settings.DATABASE_PATH.resolve())
    yield
    logger.info("MOTU Backend V2 shutting down...")
    await close_client()


app = FastAPI(
    title="MOTU Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.LOG_LEVEL == "DEBUG" else None,
    redoc_url="/redoc" if settings.LOG_LEVEL == "DEBUG" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "MOTU Backend V2", "version": "1.0.0"}
'@ | Set-Content -Path "$src\main.py" -Encoding UTF8

# routers/health.py
@'
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
'@ | Set-Content -Path "$routers\health.py" -Encoding UTF8

# routers/models.py
@'
"""Ollama model listing endpoints."""

from fastapi import APIRouter

from config import settings
from ollama_client import list_models
from schemas import ModelListResponse, ActiveModelResponse, ModelInfo

router = APIRouter()


@router.get("/models", response_model=ModelListResponse)
async def get_models() -> ModelListResponse:
    models = await list_models()
    return ModelListResponse(
        models=[ModelInfo(**m) for m in models]
    )


@router.get("/models/active", response_model=ActiveModelResponse)
async def get_active_model() -> ActiveModelResponse:
    return ActiveModelResponse(active_model=settings.MODEL_NAME)
'@ | Set-Content -Path "$routers\models.py" -Encoding UTF8

# routers/sessions.py
@'
"""Session management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from deps import get_db
from idgen import uuid7
from orm import Session as SessionModel, Message
from schemas import (
    SessionCreate,
    SessionResponse,
    SessionDetailResponse,
    SessionListResponse,
    MessageResponse,
)

router = APIRouter()


@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(db: Session = Depends(get_db)) -> SessionListResponse:
    stmt = select(SessionModel).order_by(SessionModel.updated_at.desc())
    sessions = db.execute(stmt).scalars().all()

    result = []
    for s in sessions:
        msg_count = db.execute(
            select(func.count(Message.id)).where(Message.session_id == s.id)
        ).scalar_one()
        result.append(SessionResponse(
            id=s.id,
            title=s.title,
            model=s.model,
            created_at=s.created_at,
            updated_at=s.updated_at,
            message_count=msg_count,
        ))

    return SessionListResponse(sessions=result)


@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
) -> SessionResponse:
    session = SessionModel(
        id=uuid7(),
        title=data.title or "New Chat",
        model=data.model or "qwen2.5:1.5b",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        id=session.id,
        title=session.title,
        model=session.model,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0,
    )


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: str,
    db: Session = Depends(get_db),
) -> SessionDetailResponse:
    session = db.get(SessionModel, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = [
        MessageResponse(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            content=m.content,
            created_at=m.created_at,
        )
        for m in session.messages
    ]

    return SessionDetailResponse(
        id=session.id,
        title=session.title,
        model=session.model,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=messages,
    )


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
) -> None:
    session = db.get(SessionModel, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
'@ | Set-Content -Path "$routers\sessions.py" -Encoding UTF8

# routers/chat.py
@'
"""Chat streaming endpoint."""

import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from deps import get_db
from config import settings
from idgen import uuid7
from orm import Session as SessionModel, Message
from schemas import ChatRequest
from ollama_client import stream_chat

router = APIRouter()
logger = logging.getLogger(__name__)


async def _sse_generator(
    request: ChatRequest,
    db: Session,
) -> AsyncGenerator[str, None]:
    session_id = request.session_id
    user_content = request.message.strip()

    if not user_content:
        yield 'data: {"error": "Message cannot be empty"}\n\n'
        return

    if session_id:
        session = db.get(SessionModel, session_id)
        if not session:
            yield 'data: {"error": "Session not found"}\n\n'
            return
    else:
        session = SessionModel(
            id=uuid7(),
            title=user_content[:50] or "New Chat",
            model=settings.MODEL_NAME,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id

    user_msg = Message(
        id=uuid7(),
        session_id=session_id,
        role="user",
        content=user_content,
    )
    db.add(user_msg)
    db.commit()

    stmt = select(Message).where(Message.session_id == session_id).order_by(Message.created_at).limit(20)
    history = db.execute(stmt).scalars().all()
    messages = [{"role": m.role, "content": m.content} for m in history]

    assistant_content = ""
    assistant_msg_id = uuid7()

    try:
        async for token in stream_chat(messages, model=session.model):
            assistant_content += token
            yield f'data: {{"token": {json.dumps(token)}}}\n\n'
    except Exception as e:
        logger.error("Ollama streaming error: %s", e)
        yield 'data: {"error": "Failed to get response from Ollama"}\n\n'
        return

    assistant_msg = Message(
        id=assistant_msg_id,
        session_id=session_id,
        role="assistant",
        content=assistant_content,
    )
    db.add(assistant_msg)
    from datetime import datetime, timezone
    session.updated_at = datetime.now(timezone.utc)
    db.commit()

    yield f'data: {{"done": true, "session_id": "{session_id}", "message_id": "{assistant_msg_id}"}}\n\n'


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    return StreamingResponse(
        _sse_generator(request, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
'@ | Set-Content -Path "$routers\chat.py" -Encoding UTF8

# routers/__init__.py (empty)
"" | Set-Content -Path "$routers\__init__.py" -Encoding UTF8

Write-Host "All V2 files created successfully!"
Write-Host "Start server: uvicorn src.main:app --reload --port 8000"