"""Settings, CORS, env vars."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "qwen2.5"
    TEMPERATURE: float = 0.7
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
