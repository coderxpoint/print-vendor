from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    DATABASE_URL: str = "sqlite:///./data.db"  # Default value
    SECRET_KEY: str = "dev-secret-key-change-in-production-12345678"  # Default value
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 524288000  # 500MB
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()