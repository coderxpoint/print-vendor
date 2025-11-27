from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.database import Base

class AdminUser(Base):
    """Admin user model for authentication"""
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)  # Keep this consistent
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class APIToken(Base):
    """API tokens for merchant access"""
    __tablename__ = "api_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(Integer, default=0)
    
    # Relationship
    upload_sessions = relationship("UploadSession", back_populates="token")

class UploadSession(Base):
    """Upload session tracking"""
    __tablename__ = "upload_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("api_tokens.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    total_records = Column(Integer, nullable=False)
    valid_records = Column(Integer, nullable=False)
    duplicate_records = Column(Integer, nullable=False)
    
    # Relationships
    token = relationship("APIToken", back_populates="upload_sessions")
    lots = relationship("Lot", back_populates="upload_session")

class Lot(Base):
    """Lot metadata and file information"""
    __tablename__ = "lots"
    
    id = Column(Integer, primary_key=True, index=True)
    lot_number = Column(String(50), nullable=False, index=True)
    record_count = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    upload_session_id = Column(Integer, ForeignKey("upload_sessions.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    upload_session = relationship("UploadSession", back_populates="lots")

class QRIdentifier(Base):
    """QR identifiers for duplicate checking"""
    __tablename__ = "qr_identifiers"
    
    id = Column(Integer, primary_key=True, index=True)
    qr_id = Column(String(100), nullable=False, index=True)
    qr_text_hash = Column(String(64), nullable=False, index=True)
    lot_number = Column(String(50), nullable=False, index=True)
    upload_session_id = Column(Integer, ForeignKey("upload_sessions.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Composite index for faster duplicate checking
    __table_args__ = (
        Index('idx_qr_id_lot', 'qr_id', 'lot_number'),
        Index('idx_qr_text_hash_lot', 'qr_text_hash', 'lot_number'),
    )