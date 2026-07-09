from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MOTU"
    app_version: str = "1.0.0"
    debug: bool = False

    database_url: str = "sqlite:///./motu.db"

    ollama_base_url: str = "http://localhost:11434"
    default_model: str = "llama3.1"

    class Config:
        env_file = ".env"


settings = Settings()
