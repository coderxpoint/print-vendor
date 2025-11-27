from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
from app.models.database import get_db
from app.models.models import AdminUser, APIToken
from app.models.schemas import APITokenCreate, APITokenResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/tokens", tags=["API Tokens"])

def generate_token() -> str:
    """Generate a secure random token"""
    return f"tok_{secrets.token_urlsafe(32)}"

@router.post("/generate", response_model=APITokenResponse)
def create_api_token(
    token_data: APITokenCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Generate a new API token for merchant access
    Requires admin authentication
    """
    # Generate unique token
    token = generate_token()
    
    # Create token record using constructor
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
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get all API tokens
    Requires admin authentication
    """
    tokens = db.query(APIToken).order_by(APIToken.created_at.desc()).all()
    return tokens

@router.delete("/{token_id}")
def delete_api_token(
    token_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Delete an API token
    Requires admin authentication
    """
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
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Toggle API token active status
    Requires admin authentication
    """
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