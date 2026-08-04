"""Module router that executes planner decisions."""

from typing import Optional
from src.core.types import UserProfile, EnrichedContext
from src.modules.planner import PlannerDecision


class ModuleRouter:
    def __init__(self, db, user_profile: Optional[UserProfile] = None):
        self.db = db
        self.user_profile = user_profile

    async def route(self, decision: PlannerDecision, user_content: str, session_id: str) -> EnrichedContext:
        # TODO: implement actual module routing logic
        return EnrichedContext()