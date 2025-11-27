from fastapi import Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import AdminUser, APIToken
from app.core.security import decode_access_token
from datetime import datetime

security = HTTPBearer()

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AdminUser:
    """
    Dependency to get current authenticated admin user
    Validates JWT token
    """
    token = credentials.credentials
    username = decode_access_token(token)
    
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

def validate_api_token(
    token: str = Query(..., description="API token for authentication"),
    db: Session = Depends(get_db)
) -> APIToken:
    """
    Dependency to validate API token for merchant uploads
    Updates token usage statistics
    """
    api_token = db.query(APIToken).filter(
        APIToken.token == token,
        APIToken.is_active == True
    ).first()
    
    if not api_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API token"
        )
    
    # Update token usage
    api_token.usage_count += 1
    api_token.last_used_at = datetime.utcnow()
    db.commit()
    
    return api_token