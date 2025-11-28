# config.py or settings.py - Fixed version

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./data.db"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-12345678"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Upload settings
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 524288000  # 500MB
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "allow",
        "case_sensitive": False
    }


# Create a single instance to use throughout the app
settings = Settings()