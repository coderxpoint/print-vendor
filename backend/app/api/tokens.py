from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
from app.models.database import get_db
from app.models.models import APIToken
from app.models.schemas import APITokenCreate, APITokenResponse
from pydantic import BaseModel

router = APIRouter(prefix="/tokens", tags=["API Tokens"])

# Validation schema for public token generation
class PublicTokenCreate(BaseModel):
    name: str
    validation_string: str

REQUIRED_VALIDATION_STRING = "lotdata"

def generate_token() -> str:
    """Generate a secure random token"""
    return f"tok_{secrets.token_urlsafe(32)}"

@router.post("/generate", response_model=APITokenResponse)
def create_api_token(
    token_data: PublicTokenCreate,
    db: Session = Depends(get_db)
):
    """
    Generate a new API token for merchant access
    PUBLIC ENDPOINT - Requires validation string
    """
    # Validate the secret string
    if token_data.validation_string != REQUIRED_VALIDATION_STRING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid validation string. Required: '{REQUIRED_VALIDATION_STRING}'"
        )
    
    # Generate unique token
    token = generate_token()
    
    # Create token record
    api_token = APIToken(
        token=token,
        name=token_data.name,
        is_active=True
    )
    db.add(api_token)
    db.commit()
    db.refresh(api_token)
    
    return api_token

@router.get("", response_model=List[APITokenResponse])
def list_api_tokens(
    db: Session = Depends(get_db)
):
    """
    Get all API tokens
    PUBLIC ENDPOINT - No authentication required
    """
    tokens = db.query(APIToken).order_by(APIToken.created_at.desc()).all()
    return tokens

@router.delete("/{token_id}")
def delete_api_token(
    token_id: int,
    validation_string: str,
    db: Session = Depends(get_db)
):
    """
    Delete an API token
    PUBLIC ENDPOINT - Requires validation string as query parameter
    """
    # Validate the secret string
    if validation_string != REQUIRED_VALIDATION_STRING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid validation string"
        )
    
    token = db.query(APIToken).filter(APIToken.id == token_id).first()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    
    db.delete(token)
    db.commit()
    
    return {"message": "Token deleted successfully"}

@router.patch("/{token_id}/toggle")
def toggle_api_token(
    token_id: int,
    validation_string: str,
    db: Session = Depends(get_db)
):
    """
    Toggle API token active status
    PUBLIC ENDPOINT - Requires validation string as query parameter
    """
    # Validate the secret string
    if validation_string != REQUIRED_VALIDATION_STRING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid validation string"
        )
    
    token = db.query(APIToken).filter(APIToken.id == token_id).first()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    
    # Get current value and toggle it
    current_status = bool(token.is_active)
    token.is_active = not current_status
    
    db.commit()
    db.refresh(token)
    
    return {"message": "Token status updated", "is_active": bool(token.is_active)}