"""Application configuration."""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    OLLAMA_URL: str = "http://localhost:11434"
    MODEL_NAME: str = "qwen2.5:1.5b"
    DATABASE_PATH: Path = Path("./motu.db")
    LOG_LEVEL: str = "INFO"

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            HOST=os.getenv("MOTU_HOST", cls.HOST),
            PORT=int(os.getenv("MOTU_PORT", cls.PORT)),
            OLLAMA_URL=os.getenv("MOTU_OLLAMA_URL", cls.OLLAMA_URL),
            MODEL_NAME=os.getenv("MOTU_MODEL_NAME", cls.MODEL_NAME),
            DATABASE_PATH=Path(os.getenv("MOTU_DATABASE_PATH", str(cls.DATABASE_PATH))),
            LOG_LEVEL=os.getenv("MOTU_LOG_LEVEL", cls.LOG_LEVEL),
        )


settings = Settings.from_env()
