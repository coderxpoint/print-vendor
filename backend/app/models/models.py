from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, List
from app.models.database import Base

class AdminUser(Base):
    """Admin user model for authentication"""
    __tablename__ = "admin_users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class APIToken(Base):
    """API tokens for merchant access"""
    __tablename__ = "api_tokens"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationship
    upload_sessions: Mapped[List["UploadSession"]] = relationship("UploadSession", back_populates="token")

class UploadSession(Base):
    """Upload session tracking"""
    __tablename__ = "upload_sessions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    token_id: Mapped[int] = mapped_column(Integer, ForeignKey("api_tokens.id"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    total_records: Mapped[int] = mapped_column(Integer, nullable=False)
    valid_records: Mapped[int] = mapped_column(Integer, nullable=False)
    duplicate_records: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Relationships
    token: Mapped["APIToken"] = relationship("APIToken", back_populates="upload_sessions")
    lots: Mapped[List["Lot"]] = relationship("Lot", back_populates="upload_session")

class Lot(Base):
    """Lot metadata and file information"""
    __tablename__ = "lots"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lot_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    record_count: Mapped[int] = mapped_column(Integer, nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    upload_session_id: Mapped[int] = mapped_column(Integer, ForeignKey("upload_sessions.id"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    upload_session: Mapped["UploadSession"] = relationship("UploadSession", back_populates="lots")

class QRIdentifier(Base):
    """QR identifiers for duplicate checking"""
    __tablename__ = "qr_identifiers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    qr_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    qr_text_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    lot_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    upload_session_id: Mapped[int] = mapped_column(Integer, ForeignKey("upload_sessions.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Composite index for faster duplicate checking
    __table_args__ = (
        Index('idx_qr_id_lot', 'qr_id', 'lot_number'),
        Index('idx_qr_text_hash_lot', 'qr_text_hash', 'lot_number'),
    )