#!/usr/bin/env python3
"""
GroziOne Database Initialization Script

This script initializes a fresh database with required tables and default users.
Run this script when setting up GroziOne for the first time.

Usage:
    python init_database.py
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from database import db
    print("✅ Database module imported successfully")
except ImportError as e:
    print(f"❌ Error importing database module: {e}")
    print("Make sure you're running this from the backend directory")
    sys.exit(1)


def initialize_database():
    """Initialize the database with tables and default users."""
    try:
        print("🔧 Initializing GroziOne database...")
        
        # The database connection will automatically create tables
        print(f"📁 Database location: {db.db_path}")
        
        # Check if database file exists
        if os.path.exists(db.db_path):
            print("📊 Database file already exists")
        else:
            print("🆕 Creating new database file")
        
        # Test database connection by creating a simple query
        # This will trigger table creation if they don't exist
        try:
            # Try to get users (this will create tables if they don't exist)
            users = db.get_users()
            print(f"👥 Found {len(users)} existing users")
            
            # Check if admin user exists
            admin_exists = any(user.get('username') == 'admin' for user in users)
            user1_exists = any(user.get('username') == 'user1' for user in users)
            
            if not admin_exists:
                print("👤 Creating default admin user...")
                result = db.create_user("admin", "admin123", "admin")
                if result.get("success"):
                    print("✅ Admin user created successfully")
                else:
                    print(f"❌ Failed to create admin user: {result.get('message')}")
            else:
                print("👤 Admin user already exists")
            
            if not user1_exists:
                print("👤 Creating default test user...")
                result = db.create_user("user1", "summer25", "user")
                if result.get("success"):
                    print("✅ Test user created successfully")
                else:
                    print(f"❌ Failed to create test user: {result.get('message')}")
            else:
                print("👤 Test user already exists")
                
        except Exception as e:
            print(f"❌ Error during database operations: {e}")
            return False
        
        print("\n🎉 Database initialization completed successfully!")
        print("\n📋 Default Users:")
        print("   • Username: admin, Password: admin123 (Admin)")
        print("   • Username: user1, Password: summer25 (User)")
        print("\n⚠️  Remember to change default passwords in production!")
        print("\n🚀 You can now start the backend server:")
        print("   uvicorn server:app --host 0.0.0.0 --port 8000 --reload")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False


def main():
    """Main function."""
    print("=" * 50)
    print("🛒 GroziOne Database Initialization")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("database.py"):
        print("❌ Error: database.py not found!")
        print("Please run this script from the backend directory:")
        print("   cd backend")
        print("   python init_database.py")
        sys.exit(1)
    
    # Check if virtual environment is activated
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Virtual environment not detected")
        print("Consider activating your virtual environment:")
        print("   grozi\\Scripts\\activate  # Windows")
        print("   source grozi/bin/activate  # Linux/macOS")
        print()
    
    success = initialize_database()
    
    if success:
        print("\n✅ Setup complete! Your GroziOne database is ready.")
        sys.exit(0)
    else:
        print("\n❌ Setup failed! Please check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
