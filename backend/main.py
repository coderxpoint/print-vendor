from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.database import init_db
from app.api import auth, tokens, upload, lots

# Initialize database tables
init_db()

# Create FastAPI app
app = FastAPI(
    title="Data Validation API",
    description="API for validating and managing QR data uploads",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(tokens.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(lots.router, prefix="/api")

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Data Validation API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}