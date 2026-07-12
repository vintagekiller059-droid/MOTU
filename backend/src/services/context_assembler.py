"""Token-budgeted Working Memory assembly."""

from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from config import settings
from models.database import MemoryEntryModel, MessageModel
from models.schemas import MemoryEntryResponse


class ContextAssembler:
    """Assemble Working Memory from multiple sources within a token budget."""

    @staticmethod
    def assemble(
        db: DBSession,
        session_id: str,
        query: str | None = None,
        retrieved_memories: list[MemoryEntryResponse] | None = None,
    ) -> str:
        """Assemble Working Memory context string within token budget.

        Priority order:
        1. Pinned memories
        2. User preferences
        3. Current session history
        4. High-importance memories
        5. Retrieved relevant memories

        Stops immediately when token budget is exhausted.
        """
        remaining = settings.memory_working_token_budget
        assembled: list[tuple[str, str]] = []
        seen_fingerprints: set[str] = set()

        # Priority 1: Pinned memories
        pinned = ContextAssembler._get_pinned_memories(db)
        section, remaining, seen = ContextAssembler._add_section(
            "Pinned Memories", pinned, remaining, seen_fingerprints
        )
        if section:
            assembled.append(section)
        seen_fingerprints.update(seen)

        # Priority 2: User preferences
        if remaining > 0:
            prefs = ContextAssembler._get_preferences(db)
            section, remaining, seen = ContextAssembler._add_section(
                "User Preferences", prefs, remaining, seen_fingerprints
            )
            if section:
                assembled.append(section)
            seen_fingerprints.update(seen)

        # Priority 3: Current session history
        if remaining > 0:
            history = ContextAssembler._get_session_history(db, session_id)
            section, remaining, _ = ContextAssembler._add_messages_section(
                "Current Conversation", history, remaining
            )
            if section:
                assembled.append(section)

        # Priority 4: High-importance memories
        if remaining > 0:
            high_imp = ContextAssembler._get_high_importance_memories(db, seen_fingerprints)
            section, remaining, seen = ContextAssembler._add_section(
                "Relevant Context", high_imp, remaining, seen_fingerprints
            )
            if section:
                assembled.append(section)
            seen_fingerprints.update(seen)

        # Priority 5: Retrieved relevant memories
        if remaining > 0 and retrieved_memories:
            filtered = [
                m for m in retrieved_memories
                if m.fingerprint not in seen_fingerprints
            ]
            section, remaining, seen = ContextAssembler._add_response_section(
                "Relevant Context", filtered, remaining, seen_fingerprints
            )
            if section:
                assembled.append(section)
            seen_fingerprints.update(seen)

        return ContextAssembler._format_context(assembled)

    @staticmethod
    def _estimate_tokens(text: str) -> int:
        """Rough token estimate: ~4 characters per token."""
        return max(1, len(text) // 4)

    @staticmethod
    def _get_pinned_memories(db: DBSession) -> list[MemoryEntryModel]:
        """Fetch all pinned memories ordered by importance."""
        stmt = (
            select(MemoryEntryModel)
            .where(MemoryEntryModel.is_pinned.is_(True))
            .order_by(MemoryEntryModel.importance.desc(), MemoryEntryModel.created_at.desc())
        )
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def _get_preferences(db: DBSession) -> list[MemoryEntryModel]:
        """Fetch all preference memories ordered by importance."""
        stmt = (
            select(MemoryEntryModel)
            .where(MemoryEntryModel.entry_type == "preference")
            .order_by(MemoryEntryModel.importance.desc(), MemoryEntryModel.created_at.desc())
        )
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def _get_session_history(db: DBSession, session_id: str, limit: int = 10) -> list[MessageModel]:
        """Fetch last N messages from current session."""
        stmt = (
            select(MessageModel)
            .where(MessageModel.session_id == session_id)
            .order_by(MessageModel.created_at.desc())
            .limit(limit)
        )
        rows = list(db.execute(stmt).scalars().all())
        rows.reverse()
        return rows

    @staticmethod
    def _get_high_importance_memories(
        db: DBSession, exclude_fingerprints: set[str]
    ) -> list[MemoryEntryModel]:
        """Fetch high-importance (>=80) non-pinned, non-preference memories."""
        stmt = (
            select(MemoryEntryModel)
            .where(MemoryEntryModel.importance >= 80)
            .where(MemoryEntryModel.is_pinned.is_(False))
            .where(MemoryEntryModel.entry_type != "preference")
            .order_by(MemoryEntryModel.importance.desc(), MemoryEntryModel.created_at.desc())
            .limit(10)
        )
        rows = list(db.execute(stmt).scalars().all())
        return [r for r in rows if r.fingerprint not in exclude_fingerprints]

    @staticmethod
    def _add_section(
        section_name: str,
        memories: list[MemoryEntryModel],
        remaining_budget: int,
        seen_fingerprints: set[str],
    ) -> tuple[tuple[str, str] | None, int, set[str]]:
        """Add model memories to a section, respecting token budget."""
        lines: list[str] = []
        new_seen: set[str] = set()
        budget = remaining_budget

        for mem in memories:
            if mem.fingerprint in seen_fingerprints or mem.fingerprint in new_seen:
                continue

            tokens = ContextAssembler._estimate_tokens(mem.content)
            if tokens > budget:
                break

            lines.append(mem.content)
            new_seen.add(mem.fingerprint)
            budget -= tokens

        if not lines:
            return None, remaining_budget, new_seen

        return (section_name, "\n".join(lines)), budget, new_seen

    @staticmethod
    def _add_response_section(
        section_name: str,
        memories: list[MemoryEntryResponse],
        remaining_budget: int,
        seen_fingerprints: set[str],
    ) -> tuple[tuple[str, str] | None, int, set[str]]:
        """Add response memories to a section, respecting token budget."""
        lines: list[str] = []
        new_seen: set[str] = set()
        budget = remaining_budget

        for mem in memories:
            if mem.fingerprint in seen_fingerprints or mem.fingerprint in new_seen:
                continue

            tokens = ContextAssembler._estimate_tokens(mem.content)
            if tokens > budget:
                break

            lines.append(mem.content)
            new_seen.add(mem.fingerprint)
            budget -= tokens

        if not lines:
            return None, remaining_budget, new_seen

        return (section_name, "\n".join(lines)), budget, new_seen

    @staticmethod
    def _add_messages_section(
        section_name: str,
        messages: list[MessageModel],
        remaining_budget: int,
    ) -> tuple[tuple[str, str] | None, int, set[str]]:
        """Add session messages to a section, respecting token budget."""
        lines: list[str] = []
        budget = remaining_budget

        for msg in messages:
            line = f"[{msg.role}]: {msg.content}"
            tokens = ContextAssembler._estimate_tokens(line)
            if tokens > budget:
                break

            lines.append(line)
            budget -= tokens

        if not lines:
            return None, remaining_budget, set()

        return (section_name, "\n".join(lines)), budget, set()

    @staticmethod
    def _format_context(sections: list[tuple[str, str]]) -> str:
        """Format assembled sections into a single context string."""
        if not sections:
            return ""

        parts: list[str] = []
        for name, content in sections:
            parts.append(f"--- {name} ---\n{content}")

        return "\n\n".join(parts)
