from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.models.database import get_db
from app.models.models import AdminUser
from app.models.schemas import AdminLogin, Token
from app.core.security import verify_password, create_access_token, get_hashed_password
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(credentials: AdminLogin, db: Session = Depends(get_db)):
    """
    Admin login endpoint
    Returns JWT access token
    """
    user = db.query(AdminUser).filter(AdminUser.username == credentials.username).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/init-admin")
def init_admin(credentials: AdminLogin, db: Session = Depends(get_db)):
    """
    Initialize first admin user (only if no admin exists)
    This endpoint is only for initial setup
    """
    # Check if any admin exists
    existing_admin = db.query(AdminUser).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    # Create first admin
    hashed_password = get_hashed_password(credentials.password)
    admin = AdminUser(
        username=credentials.username,
        hashed_password=hashed_password
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return {"message": "Admin user created successfully", "username": admin.username}