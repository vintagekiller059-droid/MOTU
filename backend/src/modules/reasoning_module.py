"""Reasoning Module — analyzes query complexity and intent.

Produces structured reasoning notes that guide the LLM on how to
approach the answer: depth, style, and structure.
"""

import time
from typing import Dict, Any


class ReasoningModule:
    """Analyzes query to determine reasoning approach and complexity."""

    async def run(self, user_content: str) -> Dict[str, Any]:
        t0 = time.perf_counter()
        result = {
            "reasoning_notes": "",
            "complexity": "low",
            "intent": "general",
            "latency_ms": 0.0,
        }

        try:
            q = user_content.lower().strip()
            words = q.split()
            word_count = len(words)
            notes: list[str] = []

            # ── Complexity Analysis ──
            if word_count > 40:
                result["complexity"] = "high"
                notes.append(f"Complex multi-part query ({word_count} words). Break into steps.")
            elif word_count > 20:
                result["complexity"] = "medium"
                notes.append(f"Moderate complexity ({word_count} words). Provide structured answer.")
            elif word_count > 8:
                result["complexity"] = "low"
                notes.append(f"Simple query ({word_count} words). Direct answer.")
            else:
                result["complexity"] = "minimal"
                notes.append(f"Very short query ({word_count} words). Ultra-concise answer.")

            # ── Intent Detection ──
            intents = []

            if any(w in q for w in ["compare", "versus", "vs", "difference", "differentiate", "contrast", "similarities", "distinction"]):
                intents.append("comparative")
                notes.append("Intent: comparative analysis → use side-by-side or pros/cons structure")

            if any(w in q for w in ["why", "because", "reason", "cause", "causes", "explain why"]):
                intents.append("causal")
                notes.append("Intent: causal explanation → explain root cause and mechanism")

            if any(w in q for w in ["how to", "steps", "guide", "tutorial", "walk me through", "instructions", "procedure"]):
                intents.append("procedural")
                notes.append("Intent: procedural instruction → numbered steps, clear sequence")

            if any(w in q for w in ["what if", "scenario", "hypothetical", "imagine", "suppose", "assume that"]):
                intents.append("hypothetical")
                notes.append("Intent: hypothetical reasoning → explore consequences and edge cases")

            if any(w in q for w in ["should", "recommend", "suggest", "advice", "opinion", "best", "better", "worse", "worst", "good idea", "bad idea"]):
                intents.append("evaluative")
                notes.append("Intent: evaluation/recommendation → weigh options, give reasoned judgment")

            if any(w in q for w in ["solve", "solution", "calculate", "compute", "equation", "formula", "proof", "prove", "derive"]):
                intents.append("computational")
                notes.append("Intent: computational → show work, verify each step")

            if any(w in q for w in ["define", "definition", "meaning", "what is", "what are", "who is", "who are"]):
                intents.append("definitional")
                notes.append("Intent: definition → concise, accurate, include key attributes")

            if any(w in q for w in ["think", "analyze", "analyse", "critique", "assess", "evaluate", "judge", "critically"]):
                intents.append("analytical")
                notes.append("Intent: deep analysis → examine assumptions, evidence, implications")

            if q.endswith("?") and not intents:
                intents.append("interrogative")
                notes.append("Intent: direct question → concise, factual answer")
            elif not intents:
                intents.append("declarative")
                notes.append("Intent: statement/command → acknowledge and respond appropriately")

            result["intent"] = " + ".join(intents) if intents else "general"

            # ── Style Guidance ──
            if result["complexity"] == "high":
                notes.append("Style: Use headings, bullet points, and summaries. Keep paragraphs short.")
            elif result["complexity"] == "medium":
                notes.append("Style: Structured but conversational. One main idea per paragraph.")
            else:
                notes.append("Style: Conversational and direct. No fluff.")

            # ── Safety Guardrails ──
            if any(w in q for w in ["my name", "who am i", "about me", "personal", "private", "my address", "my phone", "my email"]):
                notes.append("SAFETY: Personal information query → ONLY use User Profile section. If empty, say you don\'t know.")

            result["reasoning_notes"] = "\n".join(notes)

        except Exception as e:
            result["error"] = str(e)

        result["latency_ms"] = round((time.perf_counter() - t0) * 1000, 3)
        return result
