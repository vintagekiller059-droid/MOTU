"""Query Planner — determines which cognitive modules are required.

Uses keyword matching + heuristics to decide module activation.
Every query ALWAYS runs through Planner → Router → Modules.
"""

import time
from dataclasses import dataclass, field
from typing import List, Set


@dataclass
class PlannerDecision:
    modules: List[str] = field(default_factory=list)
    reasoning: str = ""
    priority: str = "normal"
    latency_ms: float = 0.0


class QueryPlanner:
    """Analyzes user query and decides which modules to activate.

    Module selection rules:
      memory    → user asks about themselves, their data, or past interactions
      context   → query refers to prior conversation or is very short/vague
      knowledge → factual, informational, or "what/who/where/when/why/how" questions
      reasoning → analysis, comparison, problem-solving, or opinion requests
    """

    async def plan(self, user_content: str, session_id: str | None = None) -> PlannerDecision:
        t0 = time.perf_counter()
        q = user_content.lower().strip()
        words = q.split()
        word_count = len(words)
        modules: Set[str] = set()
        reasoning_parts: List[str] = []

        # ── MEMORY TRIGGERS ──
        # Personal pronouns, identity questions, recall requests
        memory_keywords = [
            "i ", "my ", "me ", "mine", "myself", "remember", "recall",
            "forget", "saved", "earlier", "before", "ago", "previously",
            "yesterday", "last time", "we talked", "you said", "who am i",
            "do you know me", "about me", "what's my name", "my name is",
            "i am ", "i'm ", "call me", "who i am", "what is my",
            "tell me about myself", "do you remember", "did i say",
            "what did i", "what have i", "my favorite", "my job",
            "my work", "my age", "where do i", "where am i from",
        ]
        memory_score = sum(1 for w in memory_keywords if w in q)
        if memory_score > 0:
            modules.add("memory")
            reasoning_parts.append(f"Personal/identity references detected (score={memory_score}) → Memory")

        # ── CONTEXT TRIGGERS ──
        # Anaphora, short responses, conversation continuations
        context_keywords = [
            "this", "that", "these", "those", "it", "they", "them",
            "here", "there", "the same", "the other", "the previous",
            "continue", "go on", "anyway", "therefore", "thus", "moreover",
            "furthermore", "what about", "how about", "and ", "but ",
            "so ", "then ", "also", "too", "as well", "likewise",
            "similarly", "in addition", "on the other hand", "however",
            "nevertheless", "otherwise", "instead", "meanwhile",
        ]
        context_score = sum(1 for w in context_keywords if w in q)
        # Short queries (< 5 words) or single-word responses strongly imply context dependency
        if word_count <= 3:
            context_score += 2
        if word_count <= 5:
            context_score += 1
        # Affirmative/negative standalone responses
        standalone_responses = ["yes", "no", "maybe", "sure", "ok", "okay", "fine",
                                "right", "exactly", "correct", "true", "false",
                                "agreed", "disagreed", "indeed", "absolutely",
                                "nope", "nah", "yep", "yeah"]
        if words and words[0] in standalone_responses:
            context_score += 3
            reasoning_parts.append("Standalone affirmative/negative → strong Context signal")

        if context_score > 0:
            modules.add("context")
            reasoning_parts.append(f"Context-dependent language detected (score={context_score}) → Context")

        # ── KNOWLEDGE TRIGGERS ──
        # Factual questions, definitions, explanations
        wh_words = ["what", "who", "when", "where", "why", "which", "whose", "whom", "how"]
        has_wh = any(w in q for w in wh_words)
        knowledge_keywords = [
            "explain", "define", "meaning", "definition", "history",
            "information", "facts", "tell me about", "describe", "overview",
            "summary", "science", "physics", "math", "biology", "chemistry",
            "geography", "technology", "programming", "world", "universe",
            "planet", "galaxy", "country", "language", "culture", "religion",
            "philosophy", "economy", "politics", "medicine", "health",
            "sports", "music", "art", "literature", "movie", "film",
            "book", "author", "actor", "scientist", "inventor", "president",
            "war", "battle", "treaty", "constitution", "law", "theory",
            "hypothesis", "experiment", "discovery", "invention",
        ]
        knowledge_score = sum(1 for w in knowledge_keywords if w in q)
        if has_wh and q.endswith("?"):
            knowledge_score += 1
        if knowledge_score > 0:
            modules.add("knowledge")
            reasoning_parts.append(f"Factual/informational query detected (score={knowledge_score}) → Knowledge")

        # ── REASONING TRIGGERS ──
        # Analysis, logic, comparison, problem-solving
        reasoning_keywords = [
            "think", "analyze", "analyse", "compare", "comparison",
            "difference", "different", "versus", "vs", "better", "best",
            "worse", "worst", "should", "recommend", "suggest", "advice",
            "opinion", "evaluate", "assess", "judge", "solve", "solution",
            "calculate", "compute", "equation", "formula", "proof", "prove",
            "logic", "logical", "reason", "infer", "deduce", "conclude",
            "conclusion", "strategy", "plan", "approach", "method",
            "optimize", "improve", "fix", "debug", "because", "therefore",
            "thus", "hence", "since", "implies", "leads to", "results in",
            "consequence", "impact", "effect", "cause", "predict",
            "forecast", "estimate", "approximate", "step by step",
            "walk me through", "help me understand", "why does", "why is",
            "why are", "why do", "why did", "why would", "why should",
            "what if", "suppose", "assume", "given that", "if then",
            "in your opinion", "do you think", "would you say",
        ]
        reasoning_score = sum(1 for w in reasoning_keywords if w in q)
        # Long queries (> 20 words) often need reasoning breakdown
        if word_count > 20:
            reasoning_score += 1
        if reasoning_score > 0:
            modules.add("reasoning")
            reasoning_parts.append(f"Analytical/reasoning language detected (score={reasoning_score}) → Reasoning")

        # ── FALLBACKS ──
        # Ensure at least 2 modules for rich pipeline visualization
        if len(modules) == 0:
            modules.update(["knowledge", "reasoning"])
            reasoning_parts.append("No strong signals → default Knowledge + Reasoning")
        elif len(modules) == 1:
            if "memory" in modules:
                modules.add("context")
                reasoning_parts.append("Memory alone → add Context for conversation continuity")
            elif "context" in modules:
                modules.add("memory")
                reasoning_parts.append("Context alone → add Memory for user identity")
            elif "knowledge" in modules:
                modules.add("reasoning")
                reasoning_parts.append("Knowledge alone → add Reasoning for structured answer")
            elif "reasoning" in modules:
                modules.add("knowledge")
                reasoning_parts.append("Reasoning alone → add Knowledge for factual grounding")

        latency = (time.perf_counter() - t0) * 1000
        return PlannerDecision(
            modules=sorted(list(modules)),
            reasoning="; ".join(reasoning_parts) if reasoning_parts else "General query",
            priority="high" if len(modules) >= 3 else "normal",
            latency_ms=round(latency, 3),
        )
