"""Application configuration."""

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import List


@dataclass(frozen=True)
class Settings:
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    OLLAMA_URL: str = "http://localhost:11434"
    MODEL_NAME: str = "qwen2.5:1.5b"
    DATABASE_PATH: Path = Path("./motu.db")
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: List[str] = field(default_factory=list)

    # Module system settings
    ENABLE_MEMORY: bool = True
    ENABLE_KNOWLEDGE: bool = True
    ENABLE_REASONING: bool = True
    MAX_MODULE_LATENCY_MS: float = 500.0  # Timeout budget per module

    def __post_init__(self):
        # CORS_ORIGINS must be mutable, so we handle it after frozen dataclass init
        origins = os.getenv(
            "MOTU_CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000"
        ).split(",")
        object.__setattr__(self, "CORS_ORIGINS", [o.strip() for o in origins])

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            HOST=os.getenv("MOTU_HOST", cls.HOST),
            PORT=int(os.getenv("MOTU_PORT", cls.PORT)),
            OLLAMA_URL=os.getenv("MOTU_OLLAMA_URL", cls.OLLAMA_URL),
            MODEL_NAME=os.getenv("MOTU_MODEL_NAME", cls.MODEL_NAME),
            DATABASE_PATH=Path(os.getenv("MOTU_DATABASE_PATH", str(cls.DATABASE_PATH))),
            LOG_LEVEL=os.getenv("MOTU_LOG_LEVEL", cls.LOG_LEVEL),
            ENABLE_MEMORY=os.getenv("MOTU_ENABLE_MEMORY", "true").lower() == "true",
            ENABLE_KNOWLEDGE=os.getenv("MOTU_ENABLE_KNOWLEDGE", "true").lower() == "true",
            ENABLE_REASONING=os.getenv("MOTU_ENABLE_REASONING", "true").lower() == "true",
        )


settings = Settings.from_env()