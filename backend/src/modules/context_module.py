"""Context Module — assembles recent conversation history.

Provides the last N messages as a clean conversation window for the LLM.
Does NOT overlap with MemoryModule (which does relevance scoring).
"""

import time
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.session_repository import SessionRepository


class ContextModule:
    """Fetches bounded conversation window for prompt context."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def run(self, user_content: str, session_id: str | None) -> Dict[str, Any]:
        t0 = time.perf_counter()
        result = {
            "conversation_history": [],
            "latency_ms": 0.0,
        }

        try:
            if session_id:
                repo = SessionRepository(self.db)
                # Get last 8 messages for context window (excludes current message)
                recent = await repo.get_recent_messages(session_id, limit=8)
                for msg in recent:
                    result["conversation_history"].append({
                        "role": msg.role,
                        "content": msg.content,
                    })
        except Exception as e:
            result["error"] = str(e)

        result["latency_ms"] = round((time.perf_counter() - t0) * 1000, 3)
        return result
