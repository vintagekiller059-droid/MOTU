"""User Profile management endpoints."""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_db
from src.repositories.profile_repository import ProfileRepository
from src.models.schemas import (
    UserProfileCreate,
    UserProfileUpdate,
    UserProfileResponse,
)
from src.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger("ProfileRouter")


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(db: AsyncSession = Depends(get_db)) -> UserProfileResponse:
    """Get the current user's profile."""
    repo = ProfileRepository(db)
    profile = await repo.get_profile("default")
    if not profile:
        raise HTTPException(status_code=404, detail="No user profile found. Create one first.")
    return UserProfileResponse.model_validate(profile)


@router.put("/profile", response_model=UserProfileResponse)
async def create_or_replace_profile(
    payload: UserProfileCreate,
    db: AsyncSession = Depends(get_db),
) -> UserProfileResponse:
    """Create or fully replace the user profile."""
    repo = ProfileRepository(db)
    profile = await repo.create_or_update(payload, "default")
    return UserProfileResponse.model_validate(profile)


@router.patch("/profile", response_model=UserProfileResponse)
async def update_profile(
    payload: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
) -> UserProfileResponse:
    """Partially update the user profile (only send fields to change)."""
    repo = ProfileRepository(db)
    profile = await repo.patch(payload, "default")
    if not profile:
        raise HTTPException(status_code=404, detail="No user profile found. Use PUT to create.")
    return UserProfileResponse.model_validate(profile)


@router.delete("/profile", status_code=204)
async def delete_profile(db: AsyncSession = Depends(get_db)) -> None:
    """Delete the user profile."""
    repo = ProfileRepository(db)
    deleted = await repo.delete("default")
    if not deleted:
        raise HTTPException(status_code=404, detail="No user profile found.")