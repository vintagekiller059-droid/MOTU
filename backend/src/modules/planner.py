"""Query planner for the module system."""

from dataclasses import dataclass, field
from typing import List


@dataclass
class PlannerDecision:
    modules: List[str] = field(default_factory=list)
    reasoning: str = ""
    priority: str = "normal"


class QueryPlanner:
    async def plan(self, user_content: str, session_id: str) -> PlannerDecision:
        # TODO: implement actual planning logic
        return PlannerDecision()