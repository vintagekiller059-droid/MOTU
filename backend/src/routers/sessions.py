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
