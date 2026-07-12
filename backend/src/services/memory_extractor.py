"""LLM-based structured memory extraction scaffolding.

Sprint 2.1: Skeleton only. Full extraction logic wired in Sprint 2.2.
"""

from __future__ import annotations

import json
from typing import TYPE_CHECKING

from models.schemas import ExtractedMemory, MemoryExtractionResult

if TYPE_CHECKING:
    from sqlalchemy.orm import Session as DBSession


class MemoryExtractor:
    """Extract structured memories from conversation text using Ollama.

    Sprint 2.1: Scaffolding only. The extract() method returns an empty
    result. Sprint 2.2 will implement the full LLM call.
    """

    @staticmethod
    def build_extraction_prompt(messages: list[dict]) -> str:
        """Build the prompt sent to Ollama for memory extraction."""
        conversation = "\n".join(
            f"[{m['role']}]: {m['content']}" for m in messages
        )

        return (
            "You are MOTU's Memory Extractor. Analyze the conversation below and extract "
            "memories worth storing for future reference.\n\n"
            "For each memory, output a JSON object:\n"
            '{\n'
            '  "type": "fact" | "preference" | "entity" | "task" | "insight",\n'
            '  "content": "concise, standalone statement",\n'
            '  "importance": 0-100,\n'
            '  "confidence": 0.0-1.0,\n'
            '  "tags": ["tag1", "tag2"],\n'
            '  "source": "user" | "assistant" | "system"\n'
            '}\n\n'
            "Rules:\n"
            "- source: who stated this information\n"
            "- Only extract information useful in future conversations\n"
            "- Importance 90-100: Critical facts about the user\n"
            "- Importance 70-89: Significant context\n"
            "- Importance 50-69: Useful but not critical\n"
            "- Importance <50: Do not extract\n"
            "- Content must be self-contained\n"
            "- Maximum 5 memories per extraction\n"
            "- Return empty array [] if nothing worth remembering\n\n"
            f"Conversation:\n{conversation}\n\n"
            "Output JSON array only, no markdown:"
        )

    @staticmethod
    async def extract(
        db: DBSession,
        messages: list[dict],
        model: str | None = None,
    ) -> MemoryExtractionResult:
        """Extract memories from a conversation.

        Sprint 2.1: Returns empty result. Sprint 2.2 will implement the
        actual Ollama call and parsing.
        """
        # Scaffolding: no actual extraction in Sprint 2.1
        return MemoryExtractionResult(memories=[])

    @staticmethod
    def parse_extraction_response(raw: str) -> MemoryExtractionResult:
        """Parse the LLM response into structured memory objects."""
        try:
            # Strip markdown code fences if present
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()

            data = json.loads(cleaned)
            if not isinstance(data, list):
                return MemoryExtractionResult(memories=[])

            memories: list[ExtractedMemory] = []
            for item in data:
                if not isinstance(item, dict):
                    continue
                try:
                    mem = ExtractedMemory(
                        type=item.get("type", "fact"),
                        content=item.get("content", "").strip(),
                        importance=max(0, min(100, int(item.get("importance", 50)))),
                        confidence=max(0.0, min(1.0, float(item.get("confidence", 1.0)))),
                        tags=item.get("tags", []) if isinstance(item.get("tags"), list) else [],
                        source=item.get("source", "assistant"),
                    )
                    if mem.content and mem.importance >= 50:
                        memories.append(mem)
                except (ValueError, TypeError):
                    continue

            return MemoryExtractionResult(memories=memories)

        except json.JSONDecodeError:
            return MemoryExtractionResult(memories=[])