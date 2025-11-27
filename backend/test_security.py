# test_security.py
from app.core.security import verify_password, get_hashed_password

# Test password hashing
password = "test123"
hashed = get_hashed_password(password)
print(f"Password: {password}")
print(f"Hash: {hashed}")
print(f"Verify: {verify_password(password, hashed)}")
print(f"Wrong password: {verify_password('wrong', hashed)}")