"""Core domain types used across the backend."""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


@dataclass
class UserProfile:
    name: Optional[str] = None
    education: Optional[str] = None
    projects: List[str] = field(default_factory=list)
    interests: List[str] = field(default_factory=list)
    goals: List[str] = field(default_factory=list)
    additional: Dict[str, Any] = field(default_factory=dict)


@dataclass
class EnrichedContext:
    reasoning_notes: Optional[str] = None
    user_profile_context: Optional[str] = None
    memory_snippets: List[Dict[str, Any]] = field(default_factory=list)
    knowledge_facts: List[str] = field(default_factory=list)
    conversation_history: List[Dict[str, str]] = field(default_factory=list)