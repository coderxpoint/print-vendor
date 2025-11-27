"""
Simple script to run the FastAPI server
"""

import uvicorn

if __name__ == "__main__":
    print("="*60)
    print("Starting Data Validation Backend Server")
    print("="*60)
    print("\n📡 Server starting...")
    print("   API: http://localhost:8000")
    print("   Docs: http://localhost:8000/docs")
    print("\n🔐 Default Login:")
    print("   Username: admin")
    print("   Password: admin123")
    print("\n⚠️  Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )