"""Conversation CRUD."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from dependencies import get_db
from models.schemas import (
    MessageResponse,
    SessionCreate,
    SessionDetailResponse,
    SessionListResponse,
    SessionSummary,
)
from services.session_service import SessionService

router = APIRouter(prefix="/api/v1/sessions", tags=["sessions"])


@router.get("", response_model=SessionListResponse)
def list_sessions(db: DBSession = Depends(get_db)):
    sessions = SessionService.list_sessions(db)
    return SessionListResponse(
        sessions=[SessionSummary.model_validate(s) for s in sessions]
    )


@router.post("", response_model=SessionSummary)
def create_session(payload: SessionCreate, db: DBSession = Depends(get_db)):
    session = SessionService.create_session(db, payload.title, payload.model)
    return SessionSummary.model_validate(session)


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session(session_id: str, db: DBSession = Depends(get_db)):
    session = SessionService.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return SessionDetailResponse(
        id=session.id,
        title=session.title,
        model=session.model,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=[MessageResponse.model_validate(m) for m in session.messages],
    )


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str, db: DBSession = Depends(get_db)):
    if not SessionService.delete_session(db, session_id):
        raise HTTPException(status_code=404, detail="Session not found.")