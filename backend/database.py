import sqlite3
import json
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class SQLiteDatabase:
    def __init__(self, db_path: str = "grozione.db"):
        self.db_path = Path(db_path)
        self.init_database()
        self.migrate_db()
    
    def init_database(self):
        """Initialize the SQLite database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Create users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at TEXT NOT NULL,
                    last_login TEXT,
                    is_active INTEGER DEFAULT 1
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

            # Create password reset tokens table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token TEXT UNIQUE NOT NULL,
                    expires_at TEXT NOT NULL,
                    used INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
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

    def migrate_db(self):
        """Run database migrations to update schema"""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Migration 1: Add user_id to receipt_scans
            cursor.execute("PRAGMA table_info(receipt_scans)")
            rs_columns = [column[1] for column in cursor.fetchall()]

            if 'user_id' not in rs_columns:
                logger.info("Migrating receipt_scans table to add user_id column...")
                try:
                    cursor.execute('''
                        ALTER TABLE receipt_scans
                        ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1
                    ''')
                    conn.commit()
                    logger.info("✅ Migration completed: Added user_id to receipt_scans")
                except Exception as e:
                    logger.error(f"Migration failed: {e}")

            # Migration 2: Add email, last_login, is_active to users
            cursor.execute("PRAGMA table_info(users)")
            user_columns = [column[1] for column in cursor.fetchall()]

            migrations_needed = []
            if 'email' not in user_columns:
                migrations_needed.append(('email', 'ALTER TABLE users ADD COLUMN email TEXT UNIQUE'))
            if 'last_login' not in user_columns:
                migrations_needed.append(('last_login', 'ALTER TABLE users ADD COLUMN last_login TEXT'))
            if 'is_active' not in user_columns:
                migrations_needed.append(('is_active', 'ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1'))

            if migrations_needed:
                logger.info(f"Migrating users table to add {len(migrations_needed)} columns...")
                try:
                    for col_name, sql in migrations_needed:
                        cursor.execute(sql)
                        logger.info(f"✅ Added {col_name} column to users table")
                    conn.commit()
                    logger.info("✅ Migration completed: Updated users table")
                except Exception as e:
                    logger.error(f"Migration failed: {e}")
            else:
                logger.info("Database schema is up to date")

    def get_connection(self):
        """Get a database connection"""
        return sqlite3.connect(self.db_path)

    # User Authentication operations
    async def create_user(self, username: str, password: str, role: str = 'user', email: str = None) -> Dict:
        """Create a new user"""
        import hashlib

        password_hash = hashlib.sha256(password.encode()).hexdigest()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute('''
                    INSERT INTO users (username, email, password_hash, role, created_at)
                    VALUES (?, ?, ?, ?, ?)
                ''', (username, email, password_hash, role, datetime.utcnow().isoformat()))
                conn.commit()

                return {
                    "success": True,
                    "message": "User created successfully",
                    "user": {
                        "username": username,
                        "email": email,
                        "role": role
                    }
                }
            except sqlite3.IntegrityError as e:
                error_msg = str(e).lower()
                if 'email' in error_msg:
                    return {
                        "success": False,
                        "message": "Email already exists"
                    }
                else:
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

    async def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, email, role FROM users
                WHERE email = ? AND is_active = 1
            ''', (email,))

            user = cursor.fetchone()
            if user:
                return {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "role": user[3]
                }
            return None

    async def create_password_reset_token(self, user_id: int) -> str:
        """Create a password reset token for a user"""
        import secrets

        # Generate a secure random token
        token = secrets.token_urlsafe(32)

        # Token expires in 1 hour
        expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
                VALUES (?, ?, ?, ?)
            ''', (user_id, token, expires_at, datetime.utcnow().isoformat()))
            conn.commit()

        return token

    async def verify_reset_token(self, token: str) -> Optional[int]:
        """Verify password reset token and return user_id if valid"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT user_id, expires_at, used FROM password_reset_tokens
                WHERE token = ?
            ''', (token,))

            result = cursor.fetchone()
            if not result:
                return None

            user_id, expires_at, used = result

            # Check if token is already used
            if used:
                return None

            # Check if token is expired
            if datetime.fromisoformat(expires_at) < datetime.utcnow():
                return None

            return user_id

    async def reset_password(self, token: str, new_password: str) -> Dict:
        """Reset user password using token"""
        import hashlib

        user_id = await self.verify_reset_token(token)
        if not user_id:
            return {
                "success": False,
                "message": "Invalid or expired reset token"
            }

        password_hash = hashlib.sha256(new_password.encode()).hexdigest()

        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Update password
            cursor.execute('''
                UPDATE users SET password_hash = ? WHERE id = ?
            ''', (password_hash, user_id))

            # Mark token as used
            cursor.execute('''
                UPDATE password_reset_tokens SET used = 1 WHERE token = ?
            ''', (token,))

            conn.commit()

        return {
            "success": True,
            "message": "Password reset successfully"
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

    async def update_user(self, user_id: int, username: Optional[str] = None,
                         password: Optional[str] = None, role: Optional[str] = None) -> Dict:
        """Update user details (admin only)"""
        import hashlib

        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Build dynamic update query based on provided fields
            update_fields = []
            params = []

            if username is not None:
                update_fields.append("username = ?")
                params.append(username)

            if password is not None:
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                update_fields.append("password_hash = ?")
                params.append(password_hash)

            if role is not None:
                update_fields.append("role = ?")
                params.append(role)

            if not update_fields:
                return {
                    "success": False,
                    "message": "No fields to update"
                }

            params.append(user_id)
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"

            try:
                cursor.execute(query, params)
                conn.commit()

                if cursor.rowcount == 0:
                    return {
                        "success": False,
                        "message": "User not found"
                    }

                return {
                    "success": True,
                    "message": "User updated successfully"
                }
            except sqlite3.IntegrityError:
                return {
                    "success": False,
                    "message": "Username already exists"
                }

    async def delete_user(self, user_id: int) -> Dict:
        """Delete a user (admin only)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Check if user exists
            cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()

            if not user:
                return {
                    "success": False,
                    "message": "User not found"
                }

            # Delete user (cascade will handle related records if configured)
            cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
            conn.commit()

            return {
                "success": True,
                "message": f"User '{user[0]}' deleted successfully"
            }

    async def get_user_activity_stats(self) -> Dict:
        """Get user activity statistics for admin dashboard"""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Get total users count
            cursor.execute('SELECT COUNT(*) FROM users')
            total_users = cursor.fetchone()[0]

            # Get users by role
            cursor.execute('SELECT role, COUNT(*) FROM users GROUP BY role')
            users_by_role = dict(cursor.fetchall())

            # Get user activity (users with grocery items)
            cursor.execute('''
                SELECT COUNT(DISTINCT user_id) FROM grocery_items
            ''')
            active_users = cursor.fetchone()[0]

            # Get per-user statistics
            # First check if receipt_scans has user_id column
            cursor.execute("PRAGMA table_info(receipt_scans)")
            rs_columns = [column[1] for column in cursor.fetchall()]
            has_user_id = 'user_id' in rs_columns

            if has_user_id:
                cursor.execute('''
                    SELECT
                        u.id,
                        u.username,
                        u.role,
                        u.created_at,
                        COUNT(DISTINCT gi.id) as item_count,
                        COUNT(DISTINCT rs.id) as scan_count,
                        MAX(gi.created_at) as last_activity
                    FROM users u
                    LEFT JOIN grocery_items gi ON u.id = gi.user_id
                    LEFT JOIN receipt_scans rs ON u.id = rs.user_id
                    GROUP BY u.id, u.username, u.role, u.created_at
                    ORDER BY last_activity DESC
                ''')
            else:
                # Fallback query without receipt_scans join
                cursor.execute('''
                    SELECT
                        u.id,
                        u.username,
                        u.role,
                        u.created_at,
                        COUNT(DISTINCT gi.id) as item_count,
                        0 as scan_count,
                        MAX(gi.created_at) as last_activity
                    FROM users u
                    LEFT JOIN grocery_items gi ON u.id = gi.user_id
                    GROUP BY u.id, u.username, u.role, u.created_at
                    ORDER BY last_activity DESC
                ''')

            user_activities = []
            for row in cursor.fetchall():
                user_activities.append({
                    "id": row[0],
                    "username": row[1],
                    "role": row[2],
                    "created_at": row[3],
                    "item_count": row[4],
                    "scan_count": row[5],
                    "last_activity": row[6]
                })

            # Get recent activity timeline (last 30 days)
            cursor.execute('''
                SELECT
                    DATE(created_at) as activity_date,
                    COUNT(*) as count
                FROM (
                    SELECT created_at FROM grocery_items
                    UNION ALL
                    SELECT created_at FROM receipt_scans
                )
                WHERE created_at >= datetime('now', '-30 days')
                GROUP BY DATE(created_at)
                ORDER BY activity_date DESC
            ''')

            activity_timeline = [
                {
                    "date": row[0],
                    "count": row[1]
                }
                for row in cursor.fetchall()
            ]

            return {
                "total_users": total_users,
                "active_users": active_users,
                "users_by_role": users_by_role,
                "user_activities": user_activities,
                "activity_timeline": activity_timeline
            }

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
    
    async def update_grocery_item(self, item_id: str, item_data: Dict, user_id: int = 1) -> Dict:
        """Update a grocery item"""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # First check if item exists and belongs to user
            cursor.execute("SELECT * FROM grocery_items WHERE id = ? AND user_id = ?", (item_id, user_id))
            existing_item = cursor.fetchone()

            if not existing_item:
                return None

            # Update the item
            item_name = item_data.get("itemName", existing_item[1])
            store = item_data.get("store", existing_item[2])
            quantity = item_data.get("quantity", existing_item[3])
            price = float(item_data.get("price", existing_item[4]))

            cursor.execute('''
                UPDATE grocery_items
                SET item_name = ?, store = ?, quantity = ?, price = ?
                WHERE id = ? AND user_id = ?
            ''', (item_name, store, quantity, price, item_id, user_id))
            conn.commit()

            # Return updated item
            return {
                "id": item_id,
                "itemName": item_name,
                "store": store,
                "quantity": quantity,
                "price": price,
                "date": existing_item[5],
                "created_at": existing_item[6]
            }

    async def delete_grocery_item(self, item_id: str, user_id: int = 1) -> bool:
        """Delete a grocery item by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM grocery_items WHERE id = ? AND user_id = ?", (item_id, user_id))
            conn.commit()
            return cursor.rowcount > 0
    
    # Receipt Scan operations
    async def save_receipt_scan(self, scan_data: Dict, user_id: int = 1) -> str:
        """Save receipt scan results"""
        scan_id = str(uuid.uuid4())

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO receipt_scans
                (id, filename, file_size, processing_status, confidence_score,
                 store_name, total_amount, items_count, scan_result, created_at, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                datetime.utcnow().isoformat(),
                user_id
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
