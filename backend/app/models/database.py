from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Get DATABASE_URL and ensure it's a string
database_url = str(settings.DATABASE_URL)

# Fix for postgres:// URL - SQLAlchemy requires postgresql://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Create engine with appropriate connect_args
connect_args = {}
if "sqlite" in database_url.lower():
    connect_args = {"check_same_thread": False}

engine = create_engine(database_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    from app.models import models  # Import here to avoid circular imports
    Base.metadata.create_all(bind=engine)