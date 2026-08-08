"""Memory Module — retrieves user profile and relevant past memories.

Uses keyword overlap to find relevant past messages instead of blindly
returning the last N. This prevents noise and improves accuracy.
"""

import time
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.profile_repository import ProfileRepository
from src.repositories.session_repository import SessionRepository


class MemoryModule:
    """Fetches user identity and conversation memories relevant to the query."""

    def __init__(self, db: AsyncSession):
        self.db = db

    def _extract_keywords(self, text: str) -> set[str]:
        """Extract meaningful keywords from text (excluding stopwords)."""
        stopwords = {
            "the", "a", "an", "is", "are", "was", "were", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "will",
            "would", "could", "should", "may", "might", "must", "shall",
            "can", "need", "dare", "ought", "used", "to", "of", "in",
            "for", "on", "with", "at", "by", "from", "as", "into",
            "through", "during", "before", "after", "above", "below",
            "between", "under", "again", "further", "then", "once",
            "here", "there", "when", "where", "why", "how", "all",
            "each", "few", "more", "most", "other", "some", "such",
            "no", "nor", "not", "only", "own", "same", "so", "than",
            "too", "very", "just", "and", "but", "if", "or", "because",
            "until", "while", "about", "against", "between", "into",
            "through", "during", "before", "after", "above", "below",
            "up", "down", "out", "off", "over", "under", "again",
            "further", "then", "once", "this", "that", "these", "those",
            "i", "me", "my", "myself", "we", "our", "you", "your",
            "he", "him", "his", "she", "her", "it", "its", "they",
            "them", "their", "what", "which", "who", "whom", "whose",
            "am", "is", "are", "was", "were", "be", "been", "being",
        }
        words = text.lower().split()
        return {w.strip(".,!?;:\"'()[]") for w in words if len(w) > 2 and w not in stopwords}

    def _score_relevance(self, query_keywords: set[str], message_content: str) -> float:
        """Score how relevant a message is to the query (0.0–1.0)."""
        msg_keywords = self._extract_keywords(message_content)
        if not msg_keywords or not query_keywords:
            return 0.0
        overlap = query_keywords & msg_keywords
        return len(overlap) / max(len(query_keywords), len(msg_keywords), 1)

    async def run(
        self,
        user_content: str,
        session_id: str | None,
        user_profile: Any | None,
    ) -> Dict[str, Any]:
        t0 = time.perf_counter()
        result = {
            "profile_context": None,
            "memory_snippets": [],
            "latency_ms": 0.0,
        }

        try:
            # ── 1. User Profile ──
            if user_profile:
                parts = []
                has_any_data = False
                if user_profile.name:
                    parts.append(f"Name: {user_profile.name}")
                    has_any_data = True
                if user_profile.education:
                    parts.append(f"Education: {user_profile.education}")
                    has_any_data = True
                if user_profile.projects:
                    parts.append(f"Projects: {', '.join(user_profile.projects)}")
                    has_any_data = True
                if user_profile.interests:
                    parts.append(f"Interests: {', '.join(user_profile.interests)}")
                    has_any_data = True
                if user_profile.goals:
                    parts.append(f"Goals: {', '.join(user_profile.goals)}")
                    has_any_data = True
                if user_profile.additional:
                    for k, v in user_profile.additional.items():
                        parts.append(f"{k}: {v}")
                        has_any_data = True

                if has_any_data:
                    result["profile_context"] = "\n".join(parts)
                else:
                    result["profile_context"] = "[PROFILE EXISTS BUT IS EMPTY]"
            else:
                result["profile_context"] = "[NO PROFILE DATA AVAILABLE]"

            # ── 2. Relevant Past Messages ──
            if session_id:
                repo = SessionRepository(self.db)
                # Fetch last 20 messages for relevance scoring
                recent = await repo.get_recent_messages(session_id, limit=20)
                query_keywords = self._extract_keywords(user_content)

                scored_messages: List[tuple[float, Any]] = []
                for msg in recent:
                    if msg.role in ("user", "assistant"):
                        score = self._score_relevance(query_keywords, msg.content)
                        # Boost messages that mention the user directly
                        if any(w in msg.content.lower() for w in ["my name", "i am", "i'm", "my "]):
                            score += 0.3
                        scored_messages.append((score, msg))

                # Sort by relevance descending, take top 5
                scored_messages.sort(key=lambda x: x[0], reverse=True)
                top_messages = [m for s, m in scored_messages[:5] if s > 0.05]

                for msg in top_messages:
                    result["memory_snippets"].append({
                        "role": msg.role,
                        "content": msg.content[:250],
                        "timestamp": msg.created_at.isoformat() if msg.created_at else None,
                        "relevance": round(next((s for s, m in scored_messages if m.id == msg.id), 0.0), 2),
                    })

        except Exception as e:
            result["error"] = str(e)
            logger = __import__("src.utils.logger", fromlist=["setup_logger"]).setup_logger("MemoryModule")
            logger.error("Memory module error: %s", e)

        result["latency_ms"] = round((time.perf_counter() - t0) * 1000, 3)
        return result