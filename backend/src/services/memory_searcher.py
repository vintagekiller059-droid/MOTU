"""FTS5 memory search with composite ranking."""

import math
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session as DBSession

from config import settings
from models.database import MemoryEntryModel, MemoryEntryTagModel
from models.schemas import MemoryEntryResponse, MemorySearchResult


class MemorySearcher:
    """Search long-term memory using SQLite FTS5 with composite ranking."""

    @staticmethod
    def search(
        db: DBSession,
        query: str,
        limit: int = 10,
        entry_type: str | None = None,
    ) -> list[MemorySearchResult]:
        """Search memories via FTS5 and rank by composite score."""
        if not query or not query.strip():
            return []

        sql = text("""
            SELECT
                me.id,
                me.content,
                me.entry_type,
                me.importance,
                me.source,
                me.schema_version,
                me.fingerprint,
                me.source_session_id,
                me.source_message_id,
                me.confidence,
                me.is_pinned,
                me.access_count,
                me.created_at,
                me.updated_at,
                me.last_accessed_at,
                rank AS bm25_score
            FROM memory_fts
            JOIN memory_entries me ON me.rowid = memory_fts.rowid
            WHERE memory_fts MATCH :query
            ORDER BY rank
            LIMIT :limit
        """)

        params = {"query": query.strip(), "limit": limit}

        if entry_type:
            sql = text("""
                SELECT
                    me.id,
                    me.content,
                    me.entry_type,
                    me.importance,
                    me.source,
                    me.schema_version,
                    me.fingerprint,
                    me.source_session_id,
                    me.source_message_id,
                    me.confidence,
                    me.is_pinned,
                    me.access_count,
                    me.created_at,
                    me.updated_at,
                    me.last_accessed_at,
                    rank AS bm25_score
                FROM memory_fts
                JOIN memory_entries me ON me.rowid = memory_fts.rowid
                WHERE memory_fts MATCH :query
                  AND me.entry_type = :entry_type
                ORDER BY rank
                LIMIT :limit
            """)
            params["entry_type"] = entry_type

        rows = db.execute(sql, params).mappings().all()

        if not rows:
            return []

        entry_ids = [r["id"] for r in rows]
        tags_map = MemorySearcher._fetch_tags(db, entry_ids)

        bm25_scores = [r["bm25_score"] for r in rows]
        bm25_min = min(bm25_scores)
        bm25_max = max(bm25_scores)
        bm25_range = bm25_max - bm25_min if bm25_max != bm25_min else 1.0

        access_counts = [r["access_count"] for r in rows]
        max_access = max(access_counts) if access_counts else 1
        max_log_access = math.log(max_access + 1) if max_access > 0 else 1.0

        now = datetime.now(timezone.utc)
        results: list[MemorySearchResult] = []

        for row in rows:
            entry = MemorySearcher._row_to_response(row, tags_map.get(row["id"], []))

            norm_importance = row["importance"] / 100.0
            norm_bm25 = 1.0 - ((row["bm25_score"] - bm25_min) / bm25_range)

            created = row["created_at"]
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            days_old = max(0, (now - created).total_seconds() / 86400)
            recency = math.exp(-days_old / 30.0)

            log_access = math.log(row["access_count"] + 1)
            norm_access = log_access / max_log_access if max_log_access > 0 else 0.0

            score = (
                settings.memory_weight_importance * norm_importance
                + settings.memory_weight_relevance * norm_bm25
                + settings.memory_weight_recency * recency
                + settings.memory_weight_access * norm_access
            )

            results.append(MemorySearchResult(entry=entry, score=round(score, 4)))

        results.sort(key=lambda r: r.score, reverse=True)
        return results

    @staticmethod
    def _fetch_tags(db: DBSession, entry_ids: list[str]) -> dict[str, list[str]]:
        """Fetch tags for a list of memory entry IDs."""
        if not entry_ids:
            return {}

        sql = text("""
            SELECT entry_id, tag
            FROM memory_entry_tags
            WHERE entry_id IN :entry_ids
        """)
        rows = db.execute(sql, {"entry_ids": tuple(entry_ids)}).mappings().all()

        tags_map: dict[str, list[str]] = {}
        for r in rows:
            tags_map.setdefault(r["entry_id"], []).append(r["tag"])
        return tags_map

    @staticmethod
    def _row_to_response(row, tags: list[str]) -> MemoryEntryResponse:
        """Convert a raw row to MemoryEntryResponse."""
        return MemoryEntryResponse(
            id=row["id"],
            content=row["content"],
            entry_type=row["entry_type"],
            importance=row["importance"],
            source=row["source"],
            schema_version=row["schema_version"],
            fingerprint=row["fingerprint"],
            source_session_id=row["source_session_id"],
            source_message_id=row["source_message_id"],
            confidence=row["confidence"],
            is_pinned=bool(row["is_pinned"]),
            access_count=row["access_count"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            last_accessed_at=row["last_accessed_at"],
            tags=tags,
        )
