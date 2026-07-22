"""Centralized application configuration loading from environment or defaults."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """System-wide backend configuration settings."""

    # Network
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # Ollama Local Node
    OLLAMA_URL: str = "http://localhost:11434"
    MODEL_NAME: str = "qwen2.5:1.5b"

    # SQLite Database Configuration
    DATABASE_PATH: Path = Path("./motu_system.db")

    # Logging
    LOG_LEVEL: str = "INFO"

    # Engine Feature Flags
    ENABLE_MEMORY: bool = True
    ENABLE_VISION: bool = False
    ENABLE_TOOLS: bool = False
    ENABLE_VOICE: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()