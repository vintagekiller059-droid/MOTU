"""REST endpoints for OS Session Workspace management."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.session import get_db
from src.services.session_service import SessionService
from src.repositories.session_repository import SessionRepository
from src.models.schemas import (
    SessionCreate, SessionUpdate, SessionResponse, 
    SessionDetailResponse, SessionListResponse, MessageResponse
)

router = APIRouter()


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(payload: SessionCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new workspace session with UUIDv7 ID."""
    service = SessionService(db)
    session = await service.create_session(payload)
    await db.commit()
    return session


@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(
    include_archived: bool = Query(default=False),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Lists sessions ordered by pinned status and last access timestamp."""
    repo = SessionRepository(db)
    sessions, total = await repo.list_sessions(include_archived=include_archived, limit=limit, offset=offset)
    return SessionListResponse(sessions=sessions, total_count=total)


@router.get("/sessions/search", response_model=List[SessionResponse])
async def search_sessions(q: str = Query(..., min_length=1), db: AsyncSession = Depends(get_db)):
    """Searches workspace titles, summaries, or message contents."""
    repo = SessionRepository(db)
    return await repo.search_sessions(q)


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: str, 
    window: int = Query(default=20, ge=1, le=100), 
    db: AsyncSession = Depends(get_db)
):
    """Retrieves session details and recent message history window."""
    service = SessionService(db)
    try:
        session, messages = await service.get_session_detail(session_id, window=window)
        msg_responses = [MessageResponse.model_validate(m) for m in messages]
        resp = SessionDetailResponse.model_validate(session)
        resp.messages = msg_responses
        return resp
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(session_id: str, payload: SessionUpdate, db: AsyncSession = Depends(get_db)):
    """Updates session parameters (system prompt, temperature, pinned status)."""
    service = SessionService(db)
    try:
        session = await service.update_session(session_id, payload)
        await db.commit()
        return session
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Soft deletes a session workspace."""
    repo = SessionRepository(db)
    success = await repo.soft_delete(session_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    await db.commit()
    return None