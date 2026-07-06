"""Memory (conversation persistence) endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import crud
from app.models.memory import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationDetailResponse,
    MessageCreate,
    MessageResponse
)

router = router = APIRouter(tags=["memory"])

@router.get("", response_model=List[ConversationResponse])
def list_conversations(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    conversations = crud.list_conversations(db, limit=limit, offset=offset)
    return [conv.to_dict() for conv in conversations]


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db)
):
    conv = crud.create_conversation(db, title=data.title)
    db.commit()
    db.refresh(conv)
    return conv.to_dict()


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    conv = crud.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = conv.to_dict()
    result["messages"] = [msg.to_dict() for msg in conv.messages]
    return result


@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: str,
    data: ConversationUpdate,
    db: Session = Depends(get_db)
):
    conv = crud.update_conversation(db, conversation_id, title=data.title)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.commit()
    db.refresh(conv)
    return conv.to_dict()


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    success = crud.delete_conversation(db, conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.commit()
    return None


@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_message(
    conversation_id: str,
    data: MessageCreate,
    db: Session = Depends(get_db)
):
    conv = crud.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg = crud.create_message(
        db,
        conversation_id=conversation_id,
        role=data.role,
        content=data.content,
        model=data.model
    )
    db.commit()
    db.refresh(msg)
    return msg.to_dict()
