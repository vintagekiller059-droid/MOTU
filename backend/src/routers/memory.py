"""Memory API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from dependencies import get_db
from models.schemas import (
    MemoryCreateRequest,
    MemoryEntryResponse,
    MemoryImportanceRequest,
    MemoryListResponse,
    MemoryPinRequest,
    MemorySearchRequest,
    MemorySearchResponse,
)
from services.memory_manager import MemoryManager

router = APIRouter(prefix="/api/v1/memory", tags=["memory"])


@router.get("", response_model=MemoryListResponse)
def list_memories(db: DBSession = Depends(get_db)):
    """List all memory entries."""
    memories = MemoryManager.list_memories(db)
    return MemoryListResponse(memories=memories)


@router.post("", response_model=MemoryEntryResponse)
def create_memory(payload: MemoryCreateRequest, db: DBSession = Depends(get_db)):
    """Create a new memory entry."""
    return MemoryManager.store_memory(db, payload)


@router.post("/search", response_model=MemorySearchResponse)
def search_memories(payload: MemorySearchRequest, db: DBSession = Depends(get_db)):
    """Search memories via FTS5 with composite ranking."""
    results = MemoryManager.search_memories(
        db,
        query=payload.query,
        limit=payload.limit,
        entry_type=payload.entry_type,
    )
    return MemorySearchResponse(results=results)


@router.patch("/{memory_id}/pin", response_model=MemoryEntryResponse)
def pin_memory(
    memory_id: str,
    payload: MemoryPinRequest,
    db: DBSession = Depends(get_db),
):
    """Pin or unpin a memory."""
    if not MemoryManager.pin_memory(db, memory_id, payload.is_pinned):
        raise HTTPException(status_code=404, detail="Memory not found.")
    memory = MemoryManager.get_memory(db, memory_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found.")
    return memory


@router.patch("/{memory_id}/importance", response_model=MemoryEntryResponse)
def update_importance(
    memory_id: str,
    payload: MemoryImportanceRequest,
    db: DBSession = Depends(get_db),
):
    """Update memory importance score."""
    if not MemoryManager.update_importance(db, memory_id, payload.importance):
        raise HTTPException(status_code=404, detail="Memory not found.")
    memory = MemoryManager.get_memory(db, memory_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found.")
    return memory


@router.delete("/{memory_id}", status_code=204)
def delete_memory(memory_id: str, db: DBSession = Depends(get_db)):
    """Delete a memory."""
    if not MemoryManager.delete_memory(db, memory_id):
        raise HTTPException(status_code=404, detail="Memory not found.")
    return None
