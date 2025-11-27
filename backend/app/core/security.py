from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_hashed_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    # Ensure SECRET_KEY is a string
    secret_key = str(settings.SECRET_KEY)
    algorithm = str(settings.ALGORITHM)
    
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    """Decode and verify a JWT access token - returns username if valid"""
    try:
        secret_key = str(settings.SECRET_KEY)
        algorithm = str(settings.ALGORITHM)
        
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        username = payload.get("sub")
        
        # Explicitly check if username exists and is a string
        if username is None or not isinstance(username, str):
            return None
            
        return username
    except JWTError:
        return None