"""
Setup script for Data Validation Backend
Creates database tables and initializes admin user
"""

import sys
import subprocess
import os
import time

def check_python_version():
    """Ensure Python 3.8 or higher"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro} detected")

def install_dependencies():
    """Install required packages"""
    print("\n" + "="*60)
    print("Installing Python packages")
    print("="*60)
    
    try:
        # First install pip packages one by one to handle bcrypt issues
        packages = [
            "fastapi>=0.104.0",
            "uvicorn[standard]>=0.24.0", 
            "sqlalchemy>=2.0.0",
            "psycopg2-binary>=2.9.9",
            "python-jose[cryptography]>=3.3.0",
            "passlib[bcrypt]==1.7.4",
            "bcrypt==4.0.1",  # Specific version to avoid compatibility issues
            "python-multipart>=0.0.6",
            "pydantic>=2.5.0",
            "pydantic-settings>=2.1.0",
            "python-dotenv>=1.0.0"
        ]
        
        for package in packages:
            print(f"Installing {package}...")
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", package],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print(f"  ✓ {package}")
            else:
                print(f"  ⚠️  {package} - may need manual installation")
                
    except Exception as e:
        print(f"⚠️  Installation warning: {e}")

def create_admin_user():
    """Create default admin user"""
    print("\nCreating admin user...")
    
    try:
        # Add the app directory to Python path
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        from app.models.database import SessionLocal, init_db
        from app.models.models import AdminUser
        from app.core.security import get_hashed_password 
        
        # Initialize database tables
        print("Initializing database...")
        init_db()
        print("✓ Database tables created")
        
        # Create admin user
        db = SessionLocal()
        try:
            # Check if admin already exists
            existing_admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
            
            if existing_admin:
                print("✓ Admin user already exists")
                print("  Username: admin")
                # You might want to update the password if needed
                update_password = input("Update admin password? (y/N): ").lower().strip()
                if update_password == 'y':
                    new_password = input("Enter new password: ")
                    existing_admin.hashed_password = get_hashed_password(new_password)
                    db.commit()
                    print("✓ Admin password updated")
            else:
                admin = AdminUser(
                    username="admin",
                    hashed_password=get_hashed_password("admin123")  # Fixed to match model
                )
                db.add(admin)
                db.commit()
                db.refresh(admin)
                print("✓ Admin user created")
                print("  Username: admin")
                print("  Password: admin123")
                print("  ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!")
        
        except Exception as e:
            print(f"❌ Error creating admin: {e}")
            db.rollback()
        finally:
            db.close()
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure all dependencies are installed and app structure is correct")
    except Exception as e:
        print(f"❌ Failed to create admin user: {e}")


def create_uploads_directory():
    """Create uploads directory if it doesn't exist"""
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        print("✓ Uploads directory created")
    else:
        print("✓ Uploads directory exists")
    
    # Create subdirectories for better organization
    subdirs = ["temp", "exports", "backups"]
    for subdir in subdirs:
        subdir_path = os.path.join(upload_dir, subdir)
        if not os.path.exists(subdir_path):
            os.makedirs(subdir_path)
            print(f"✓ {subdir} directory created")

def check_environment():
    """Check if environment file exists"""
    if not os.path.exists(".env"):
        print("\n⚠️  Warning: .env file not found!")
        print("Creating a basic .env template...")
        
        env_template = """# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secret - CHANGE THIS IN PRODUCTION!
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Upload settings
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=524288000

# CORS
FRONTEND_URL=http://localhost:3000
"""
        with open(".env.example", "w") as f:
            f.write(env_template)
        print("✓ Created .env.example file")
        print("⚠️  Please copy .env.example to .env and configure your database settings")

def main():
    print("="*60)
    print("Data Validation Backend - Setup")
    print("="*60)
    
    # Check Python version
    check_python_version()
    
    # Check environment
    check_environment()
    
    # Install dependencies
    print("\n📦 Installing dependencies...")
    install_dependencies()
    
    # Create uploads directory
    print("\n📁 Setting up directories...")
    create_uploads_directory()
    
    # Create admin user
    print("\n👤 Setting up admin user...")
    create_admin_user()
    
    print("\n" + "="*60)
    print("✅ Setup Complete!")
    print("="*60)
    print("\nTo start the server, run:")
    print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("\nOr create a run_server.py file with:")
    print("  from app.main import app")
    print("  import uvicorn")
    print("  uvicorn.run(app, host='0.0.0.0', port=8000)")
    print("\nAPI will be available at:")
    print("  http://localhost:8000")
    print("  http://localhost:8000/docs (API Documentation)")
    print("\nDefault admin login:")
    print("  Username: admin")
    print("  Password: admin123")
    print("\n⚠️  SECURITY NOTES:")
    print("  - Change the default admin password immediately!")
    print("  - Update SECRET_KEY in .env file for production!")
    print("  - Configure proper database credentials!")
    print("="*60)

if __name__ == "__main__":
    main()