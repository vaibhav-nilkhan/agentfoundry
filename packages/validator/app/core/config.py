"""Configuration settings for the validator service"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 5000

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:4000",
    ]

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Validation settings
    MAX_FILE_SIZE_MB: int = 10
    VALIDATION_TIMEOUT_SECONDS: int = 60
    SANDBOX_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
