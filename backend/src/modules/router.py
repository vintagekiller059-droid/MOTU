"""Module Router — executes cognitive modules in parallel."""

import asyncio
import time
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.types import EnrichedContext, UserProfile
from src.modules.planner import PlannerDecision
from src.modules.memory_module import MemoryModule
from src.modules.context_module import ContextModule
from src.modules.knowledge_module import KnowledgeModule
from src.modules.reasoning_module import ReasoningModule


class ModuleRouter:
    """Routes planner decisions to module executors and aggregates results."""

    def __init__(self, db: AsyncSession, user_profile: UserProfile | None = None):
        self.db = db
        self.user_profile = user_profile

    async def route(
        self,
        decision: PlannerDecision,
        user_content: str,
        session_id: str | None,
    ) -> EnrichedContext:
        t0 = time.perf_counter()
        enriched = EnrichedContext(active_modules=decision.modules)

        # Build module tasks
        tasks = {}
        if "memory" in decision.modules:
            mem = MemoryModule(self.db)
            tasks["memory"] = mem.run(user_content, session_id, self.user_profile)
        if "context" in decision.modules:
            ctx = ContextModule(self.db)
            tasks["context"] = ctx.run(user_content, session_id)
        if "knowledge" in decision.modules:
            kng = KnowledgeModule()
            tasks["knowledge"] = kng.run(user_content)
        if "reasoning" in decision.modules:
            rsn = ReasoningModule()
            tasks["reasoning"] = rsn.run(user_content)

        # Execute all required modules in parallel with timeout
        results: dict[str, Any] = {}
        if tasks:
            coros = list(tasks.values())
            keys = list(tasks.keys())
            try:
                gathered = await asyncio.wait_for(
                    asyncio.gather(*coros, return_exceptions=True),
                    timeout=2.0,
                )
                results = dict(zip(keys, gathered))
            except asyncio.TimeoutError:
                results = {k: {"error": "Module timeout"} for k in keys}

        # Aggregate results into EnrichedContext
        for mod_name, res in results.items():
            if isinstance(res, Exception):
                enriched.module_timings[mod_name] = -1.0
                continue
            enriched.module_timings[mod_name] = res.get("latency_ms", 0.0)

            if mod_name == "memory":
                enriched.user_profile_context = res.get("profile_context")
                enriched.memory_snippets = res.get("memory_snippets", [])
            elif mod_name == "context":
                enriched.conversation_history = res.get("conversation_history", [])
            elif mod_name == "knowledge":
                enriched.knowledge_facts = res.get("facts", [])
            elif mod_name == "reasoning":
                enriched.reasoning_notes = res.get("reasoning_notes", "")

        enriched.module_timings["router_total"] = round((time.perf_counter() - t0) * 1000, 3)
        return enriched
