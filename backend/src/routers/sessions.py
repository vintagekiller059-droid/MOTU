"""Session management endpoints — async version."""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_db
from src.models.database import SessionModel, MessageModel
from src.models.schemas import (
    SessionCreate,
    SessionResponse,
    SessionDetailResponse,
    SessionListResponse,
    MessageResponse,
)
from src.repositories.session_repository import SessionRepository
from src.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger("SessionsRouter")

@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(db: AsyncSession = Depends(get_db)) -> SessionListResponse:
    repo = SessionRepository(db)
    sessions, total = await repo.list_sessions(limit=50, offset=0)

    result = []
    for s in sessions:
        result.append(SessionResponse(
            id=s.id,
            title=s.title,
            model=s.active_model,
            created_at=s.created_at,
            updated_at=s.updated_at,
            message_count=len(s.messages),
        ))

    logger.info("Listed %d sessions", len(result))
    return SessionListResponse(sessions=result)

@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    data: SessionCreate,
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    repo = SessionRepository(db)
    from src.config import settings
    session = await repo.create_session(data, active_model=data.model or settings.MODEL_NAME)

    logger.info("Created session: %s", session.id)
    return SessionResponse(
        id=session.id,
        title=session.title,
        model=session.active_model,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0,
    )

@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionDetailResponse:
    repo = SessionRepository(db)
    session = await repo.get_by_id(session_id, touch_access=False)
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
        model=session.active_model,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=messages,
    )

@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = SessionRepository(db)
    deleted = await repo.soft_delete(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    logger.info("Deleted session: %s", session_id)