import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class SQLiteDatabase:
    def __init__(self, db_path: str = "grozione.db"):
        self.db_path = Path(db_path)
        self.init_database()
    
    def init_database(self):
        """Initialize the SQLite database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Create users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at TEXT NOT NULL
                )
            ''')

            # Create status_checks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS status_checks (
                    id TEXT PRIMARY KEY,
                    client_name TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    user_id INTEGER,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Create grocery_items table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS grocery_items (
                    id TEXT PRIMARY KEY,
                    item_name TEXT NOT NULL,
                    store TEXT NOT NULL,
                    quantity TEXT NOT NULL,
                    price REAL NOT NULL,
                    date TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    user_id INTEGER NOT NULL DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Create receipt_scans table for tracking receipt processing
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS receipt_scans (
                    id TEXT PRIMARY KEY,
                    filename TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    processing_status TEXT NOT NULL,
                    confidence_score REAL,
                    store_name TEXT,
                    total_amount REAL,
                    items_count INTEGER,
                    scan_result TEXT,
                    created_at TEXT NOT NULL,
                    user_id INTEGER NOT NULL DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Create default admin user if not exists
            cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('admin',))
            if cursor.fetchone()[0] == 0:
                import hashlib
                from datetime import datetime
                admin_password = hashlib.sha256('admin123'.encode()).hexdigest()
                cursor.execute('''
                    INSERT INTO users (username, password_hash, role, created_at)
                    VALUES (?, ?, ?, ?)
                ''', ('admin', admin_password, 'admin', datetime.now().isoformat()))
                logger.info("✅ Default admin user created (username: admin, password: admin123)")

            conn.commit()
            logger.info("Database initialized successfully")
    
    def get_connection(self):
        """Get a database connection"""
        return sqlite3.connect(self.db_path)

    # User Authentication operations
    async def create_user(self, username: str, password: str, role: str = 'user') -> Dict:
        """Create a new user"""
        import hashlib

        password_hash = hashlib.sha256(password.encode()).hexdigest()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute('''
                    INSERT INTO users (username, password_hash, role, created_at)
                    VALUES (?, ?, ?, ?)
                ''', (username, password_hash, role, datetime.utcnow().isoformat()))
                conn.commit()

                return {
                    "success": True,
                    "message": "User created successfully",
                    "user": {
                        "username": username,
                        "role": role
                    }
                }
            except sqlite3.IntegrityError:
                return {
                    "success": False,
                    "message": "Username already exists"
                }

    async def authenticate_user(self, username: str, password: str) -> Dict:
        """Authenticate user login"""
        import hashlib

        password_hash = hashlib.sha256(password.encode()).hexdigest()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, role FROM users
                WHERE username = ? AND password_hash = ?
            ''', (username, password_hash))

            user = cursor.fetchone()
            if user:
                return {
                    "success": True,
                    "user": {
                        "id": user[0],
                        "username": user[1],
                        "role": user[2]
                    }
                }
            else:
                return {
                    "success": False,
                    "message": "Invalid username or password"
                }

    async def get_users(self) -> List[Dict]:
        """Get all users (admin only)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC')
            users = cursor.fetchall()

            return [
                {
                    "id": user[0],
                    "username": user[1],
                    "role": user[2],
                    "created_at": user[3]
                }
                for user in users
            ]

    # Status Check operations
    async def create_status_check(self, client_name: str) -> Dict:
        """Create a new status check entry"""
        status_check = {
            "id": str(uuid.uuid4()),
            "client_name": client_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO status_checks (id, client_name, timestamp) VALUES (?, ?, ?)",
                (status_check["id"], status_check["client_name"], status_check["timestamp"])
            )
            conn.commit()
        
        return status_check
    
    async def get_status_checks(self, limit: int = 1000) -> List[Dict]:
        """Get all status checks"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, client_name, timestamp FROM status_checks ORDER BY timestamp DESC LIMIT ?",
                (limit,)
            )
            rows = cursor.fetchall()
        
        return [
            {
                "id": row[0],
                "client_name": row[1],
                "timestamp": row[2]
            }
            for row in rows
        ]
    
    # Grocery Items operations
    async def add_grocery_item(self, item_data: Dict, user_id: int = 1) -> Dict:
        """Add a new grocery item"""
        grocery_item = {
            "id": str(uuid.uuid4()),
            "item_name": item_data.get("itemName", "Unknown Item"),
            "store": item_data.get("store", "Unknown Store"),
            "quantity": item_data.get("quantity", "1 kg"),
            "price": float(item_data.get("price", 0)),
            "date": item_data.get("date", datetime.utcnow().strftime('%Y-%m-%d')),
            "created_at": datetime.utcnow().isoformat(),
            "user_id": user_id
        }
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO grocery_items (id, item_name, store, quantity, price, date, created_at, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                grocery_item["id"],
                grocery_item["item_name"],
                grocery_item["store"],
                grocery_item["quantity"],
                grocery_item["price"],
                grocery_item["date"],
                grocery_item["created_at"],
                grocery_item["user_id"]
            ))
            conn.commit()
        
        return grocery_item
    
    async def get_grocery_items(self, limit: int = 1000, user_id: int = 1) -> List[Dict]:
        """Get all grocery items"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, item_name, store, quantity, price, date, created_at
                FROM grocery_items WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
            ''', (user_id, limit))
            rows = cursor.fetchall()
        
        return [
            {
                "id": row[0],
                "itemName": row[1],
                "store": row[2],
                "quantity": row[3],
                "price": row[4],
                "date": row[5],
                "created_at": row[6]
            }
            for row in rows
        ]
    
    async def delete_grocery_item(self, item_id: str, user_id: int = 1) -> bool:
        """Delete a grocery item by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM grocery_items WHERE id = ? AND user_id = ?", (item_id, user_id))
            conn.commit()
            return cursor.rowcount > 0
    
    # Receipt Scan operations
    async def save_receipt_scan(self, scan_data: Dict) -> str:
        """Save receipt scan results"""
        scan_id = str(uuid.uuid4())
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO receipt_scans 
                (id, filename, file_size, processing_status, confidence_score, 
                 store_name, total_amount, items_count, scan_result, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                scan_id,
                scan_data.get("filename", "unknown"),
                scan_data.get("file_size", 0),
                scan_data.get("processing_status", "success"),
                scan_data.get("confidence_score", 0.0),
                scan_data.get("store_name"),
                scan_data.get("total_amount"),
                scan_data.get("items_count", 0),
                json.dumps(scan_data.get("scan_result", {})),
                datetime.utcnow().isoformat()
            ))
            conn.commit()
        
        return scan_id

# Global database instance
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the backend directory
backend_dir = Path(__file__).parent
load_dotenv(backend_dir / '.env')
db_path = os.getenv("DATABASE_PATH", "grozione.db")

# Ensure the database path is relative to the backend directory
if not os.path.isabs(db_path):
    db_path = backend_dir / db_path

db = SQLiteDatabase(str(db_path))
