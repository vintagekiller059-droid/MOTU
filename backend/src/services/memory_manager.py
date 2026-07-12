"""Memory Manager — single gateway for all memory operations."""

import hashlib
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from models.database import MemoryEntryModel, MemoryEntryTagModel
from models.schemas import (
    MemoryCreateRequest,
    MemoryEntryResponse,
    MemoryExtractionResult,
    MemorySearchResult,
)
from services.context_assembler import ContextAssembler
from services.memory_searcher import MemorySearcher


class MemoryManager:
    """Single gateway for reading and writing long-term memory.

    No other service may directly access memory_entries or memory_fts.
    """

    # ─────────────────────────────────────────────────────────
    # Retrieval
    # ─────────────────────────────────────────────────────────

    @staticmethod
    def assemble_working_memory(
        db: DBSession,
        session_id: str,
        query: str | None = None,
    ) -> str:
        """Assemble token-budgeted Working Memory context string."""
        retrieved: list[MemoryEntryResponse] | None = None
        if query:
            search_results = MemorySearcher.search(db, query, limit=10)
            retrieved = [r.entry for r in search_results]

        return ContextAssembler.assemble(db, session_id, query, retrieved)

    @staticmethod
    def search_memories(
        db: DBSession,
        query: str,
        limit: int = 10,
        entry_type: str | None = None,
    ) -> list[MemorySearchResult]:
        """Search memories via FTS5 with composite ranking."""
        return MemorySearcher.search(db, query, limit, entry_type)

    @staticmethod
    def list_memories(db: DBSession) -> list[MemoryEntryResponse]:
        """List all non-deleted memory entries."""
        stmt = (
            select(MemoryEntryModel)
            .order_by(MemoryEntryModel.created_at.desc())
        )
        rows = list(db.execute(stmt).scalars().all())
        return [MemoryManager._model_to_response(r) for r in rows]

    @staticmethod
    def get_memory(db: DBSession, memory_id: str) -> MemoryEntryResponse | None:
        """Fetch a single memory by ID."""
        model = db.get(MemoryEntryModel, memory_id)
        if not model:
            return None
        return MemoryManager._model_to_response(model)

    # ─────────────────────────────────────────────────────────
    # Storage
    # ─────────────────────────────────────────────────────────

    @staticmethod
    def store_memory(
        db: DBSession,
        request: MemoryCreateRequest,
    ) -> MemoryEntryResponse:
        """Store a new memory or update existing by fingerprint."""
        fingerprint = MemoryManager._compute_fingerprint(request.content)

        existing = MemoryManager._get_by_fingerprint(db, fingerprint)
        if existing:
            return MemoryManager._update_existing(db, existing, request)

        return MemoryManager._insert_new(db, request, fingerprint)

    @staticmethod
    def extract_and_store(
        db: DBSession,
        extraction: MemoryExtractionResult,
        session_id: str | None = None,
        message_id: str | None = None,
    ) -> list[MemoryEntryResponse]:
        """Store memories from LLM extraction result."""
        stored: list[MemoryEntryResponse] = []
        for mem in extraction.memories:
            req = MemoryCreateRequest(
                content=mem.content,
                entry_type=mem.type,
                importance=mem.importance,
                source=mem.source,
                confidence=mem.confidence,
                tags=mem.tags,
                source_session_id=session_id,
                source_message_id=message_id,
            )
            stored.append(MemoryManager.store_memory(db, req))
        return stored

    # ─────────────────────────────────────────────────────────
    # Mutations
    # ─────────────────────────────────────────────────────────

    @staticmethod
    def pin_memory(db: DBSession, memory_id: str, pinned: bool) -> bool:
        """Toggle pin status on a memory."""
        model = db.get(MemoryEntryModel, memory_id)
        if not model:
            return False

        model.is_pinned = pinned
        model.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(model)
        return True

    @staticmethod
    def update_importance(db: DBSession, memory_id: str, importance: int) -> bool:
        """Update importance score."""
        model = db.get(MemoryEntryModel, memory_id)
        if not model:
            return False

        model.importance = max(0, min(100, importance))
        model.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(model)
        return True

    @staticmethod
    def delete_memory(db: DBSession, memory_id: str) -> bool:
        """Hard-delete a memory and its tags."""
        model = db.get(MemoryEntryModel, memory_id)
        if not model:
            return False

        db.delete(model)
        db.commit()
        return True

    @staticmethod
    def update_memory_access(db: DBSession, memory_id: str) -> None:
        """Increment access_count and update last_accessed_at."""
        model = db.get(MemoryEntryModel, memory_id)
        if not model:
            return

        model.access_count += 1
        model.last_accessed_at = datetime.now(timezone.utc)
        db.commit()

    # ─────────────────────────────────────────────────────────
    # Internal
    # ─────────────────────────────────────────────────────────

    @staticmethod
    def _compute_fingerprint(content: str) -> str:
        """Generate SHA-256 fingerprint from normalized content."""
        normalized = (
            content.lower()
            .strip()
            .replace(".", "")
            .replace(",", "")
            .replace("!", "")
            .replace("?", "")
            .replace("  ", " ")
        )
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    @staticmethod
    def _get_by_fingerprint(db: DBSession, fingerprint: str) -> MemoryEntryModel | None:
        """Fetch memory by fingerprint."""
        stmt = select(MemoryEntryModel).where(MemoryEntryModel.fingerprint == fingerprint)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def _insert_new(
        db: DBSession,
        request: MemoryCreateRequest,
        fingerprint: str,
    ) -> MemoryEntryResponse:
        """Insert a new memory entry."""
        now = datetime.now(timezone.utc)

        model = MemoryEntryModel(
            content=request.content,
            entry_type=request.entry_type,
            importance=request.importance,
            source=request.source,
            schema_version=1,
            fingerprint=fingerprint,
            source_session_id=request.source_session_id,
            source_message_id=request.source_message_id,
            confidence=request.confidence,
            is_pinned=False,
            access_count=0,
            created_at=now,
            updated_at=now,
            last_accessed_at=None,
        )
        db.add(model)
        db.flush()

        for tag in request.tags:
            db.add(MemoryEntryTagModel(entry_id=model.id, tag=tag))

        db.commit()
        db.refresh(model)
        return MemoryManager._model_to_response(model)

    @staticmethod
    def _update_existing(
        db: DBSession,
        existing: MemoryEntryModel,
        request: MemoryCreateRequest,
    ) -> MemoryEntryResponse:
        """Update existing memory on fingerprint collision."""
        now = datetime.now(timezone.utc)

        if request.importance > existing.importance:
            existing.importance = request.importance

        current_tags = {t.tag for t in existing.tags}
        for tag in request.tags:
            if tag not in current_tags:
                db.add(MemoryEntryTagModel(entry_id=existing.id, tag=tag))

        existing.access_count += 1
        existing.updated_at = now
        existing.source = request.source

        db.commit()
        db.refresh(existing)
        return MemoryManager._model_to_response(existing)

    @staticmethod
    def _model_to_response(model: MemoryEntryModel) -> MemoryEntryResponse:
        """Convert ORM model to Pydantic response."""
        return MemoryEntryResponse(
            id=model.id,
            content=model.content,
            entry_type=model.entry_type,
            importance=model.importance,
            source=model.source,
            schema_version=model.schema_version,
            fingerprint=model.fingerprint,
            source_session_id=model.source_session_id,
            source_message_id=model.source_message_id,
            confidence=model.confidence,
            is_pinned=bool(model.is_pinned),
            access_count=model.access_count,
            created_at=model.created_at,
            updated_at=model.updated_at,
            last_accessed_at=model.last_accessed_at,
            tags=[t.tag for t in model.tags],
        )
