"""Data Access Object for User Profile operations."""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.database import UserProfileModel
from src.models.schemas import UserProfileCreate, UserProfileUpdate
from src.core.types import UserProfile
from src.utils.logger import setup_logger

logger = setup_logger("ProfileRepository")


class ProfileRepository:
    """Handles all database operations for user profiles."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, profile_id: str = "default") -> Optional[UserProfileModel]:
        """Fetch profile by ID. Returns None if not found."""
        stmt = select(UserProfileModel).where(UserProfileModel.id == profile_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_or_update(self, payload: UserProfileCreate, profile_id: str = "default") -> UserProfileModel:
        """Create new profile or replace existing one."""
        existing = await self.get_profile(profile_id)
        if existing:
            # Update existing
            existing.name = payload.name
            existing.education = payload.education
            existing.projects = payload.projects
            existing.interests = payload.interests
            existing.goals = payload.goals
            existing.additional = payload.additional
            await self.db.flush()
            logger.info("Updated user profile '%s'", profile_id)
            return existing

        # Create new
        profile = UserProfileModel(
            id=profile_id,
            name=payload.name,
            education=payload.education,
            projects=payload.projects,
            interests=payload.interests,
            goals=payload.goals,
            additional=payload.additional,
        )
        self.db.add(profile)
        await self.db.flush()
        logger.info("Created user profile '%s'", profile_id)
        return profile

    async def patch(self, payload: UserProfileUpdate, profile_id: str = "default") -> Optional[UserProfileModel]:
        """Partial update — only modifies provided fields."""
        existing = await self.get_profile(profile_id)
        if not existing:
            return None

        if payload.name is not None:
            existing.name = payload.name
        if payload.education is not None:
            existing.education = payload.education
        if payload.projects is not None:
            existing.projects = payload.projects
        if payload.interests is not None:
            existing.interests = payload.interests
        if payload.goals is not None:
            existing.goals = payload.goals
        if payload.additional is not None:
            existing.additional = payload.additional

        await self.db.flush()
        logger.info("Patched user profile '%s'", profile_id)
        return existing

    async def delete(self, profile_id: str = "default") -> bool:
        """Delete a profile. Returns True if deleted."""
        profile = await self.get_profile(profile_id)
        if not profile:
            return False
        await self.db.delete(profile)
        await self.db.flush()
        logger.info("Deleted user profile '%s'", profile_id)
        return True

    def to_domain(self, model: UserProfileModel) -> UserProfile:
        """Convert ORM model to domain object."""
        return UserProfile(
            name=model.name,
            education=model.education,
            projects=model.projects or [],
            interests=model.interests or [],
            goals=model.goals or [],
            additional=model.additional or {},
        )