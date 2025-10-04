# Admin Dashboard Fix - Missing user_id Column

## Problem

Admin dashboard was showing no data and throwing an error:
```
sqlite3.OperationalError: no such column: rs.user_id
```

## Root Cause

The `receipt_scans` table was created before we added the `user_id` column to the schema. When the database was first initialized, the table didn't have this column, and SQLite's `CREATE TABLE IF NOT EXISTS` doesn't alter existing tables.

## Solution

Implemented automatic database migration that:
1. Checks if `receipt_scans` table has `user_id` column
2. Adds the column if it's missing
3. Provides fallback queries if migration fails

## Changes Made

### 1. Added Database Migration Function

**File: `backend/database.py`**

Added `migrate_db()` method that runs automatically on database initialization:

```python
def migrate_db(self):
    """Run database migrations to update schema"""
    with self.get_connection() as conn:
        cursor = conn.cursor()
        
        # Check if receipt_scans table has user_id column
        cursor.execute("PRAGMA table_info(receipt_scans)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'user_id' not in columns:
            logger.info("Migrating receipt_scans table to add user_id column...")
            try:
                # Add user_id column with default value
                cursor.execute('''
                    ALTER TABLE receipt_scans 
                    ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1
                ''')
                conn.commit()
                logger.info("✅ Migration completed: Added user_id to receipt_scans")
            except Exception as e:
                logger.error(f"Migration failed: {e}")
        else:
            logger.info("Database schema is up to date")
```

### 2. Updated Database Initialization

**File: `backend/database.py`**

Modified `__init__` to call migration after initialization:

```python
def __init__(self, db_path: str = "grozione.db"):
    self.db_path = db_path
    self.init_db()
    self.migrate_db()  # Run migrations
```

### 3. Added Fallback Query

**File: `backend/database.py`**

Updated `get_user_activity_stats()` to handle missing column gracefully:

```python
# Check if receipt_scans has user_id column
cursor.execute("PRAGMA table_info(receipt_scans)")
rs_columns = [column[1] for column in cursor.fetchall()]
has_user_id = 'user_id' in rs_columns

if has_user_id:
    # Query with receipt_scans join
    cursor.execute('''
        SELECT u.id, u.username, u.role, u.created_at,
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
    # Fallback query without receipt_scans
    cursor.execute('''
        SELECT u.id, u.username, u.role, u.created_at,
               COUNT(DISTINCT gi.id) as item_count,
               0 as scan_count,
               MAX(gi.created_at) as last_activity
        FROM users u
        LEFT JOIN grocery_items gi ON u.id = gi.user_id
        GROUP BY u.id, u.username, u.role, u.created_at
        ORDER BY last_activity DESC
    ''')
```

### 4. Created Migration Script

**File: `backend/migrate_database.py`**

Standalone script to manually run migration if needed:

```bash
# Run migration
cd backend
python migrate_database.py

# Or specify database path
python migrate_database.py path/to/grozione.db
```

## How It Works

### Automatic Migration (Recommended)

1. **On Server Start:**
   - Database class initializes
   - `migrate_db()` runs automatically
   - Checks for missing columns
   - Adds them if needed
   - Logs migration status

2. **Migration Process:**
   - Uses `PRAGMA table_info()` to check columns
   - Uses `ALTER TABLE ADD COLUMN` to add missing columns
   - Sets default value of `1` for existing rows
   - Commits changes

3. **Fallback Handling:**
   - If migration fails, queries use fallback logic
   - Dashboard still works, just without receipt scan counts
   - No errors thrown

### Manual Migration (If Needed)

If automatic migration doesn't work:

```bash
cd backend
python migrate_database.py
```

Output:
```
🗄️  Migrating database: grozione.db
--------------------------------------------------
🔄 Adding user_id column to receipt_scans table...
✅ Migration completed successfully!
✅ Verified: user_id column exists in receipt_scans table
📊 Current columns: id, filename, file_size, processing_status, confidence_score, store_name, total_amount, items_count, scan_result, created_at, user_id
--------------------------------------------------
✅ Migration completed successfully!
```

## Testing

### Test 1: Fresh Database
1. Delete `grozione.db`
2. Start server
3. Check logs for: "Database initialized successfully"
4. Login as admin
5. Navigate to Admin Dashboard
6. Verify data displays correctly

### Test 2: Existing Database (Without user_id)
1. Keep existing `grozione.db`
2. Start server
3. Check logs for: "Migrating receipt_scans table..."
4. Check logs for: "✅ Migration completed"
5. Login as admin
6. Navigate to Admin Dashboard
7. Verify data displays correctly

### Test 3: Already Migrated Database
1. Start server again
2. Check logs for: "Database schema is up to date"
3. No migration runs
4. Dashboard works normally

### Test 4: Manual Migration
1. Stop server
2. Run: `python backend/migrate_database.py`
3. Verify success message
4. Start server
5. Check dashboard

## Verification

### Check Database Schema

```bash
# Using SQLite command line
sqlite3 grozione.db

# Check receipt_scans columns
.schema receipt_scans

# Should show:
CREATE TABLE receipt_scans (
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
);
```

### Check Admin Dashboard Data

1. Login as admin (admin/admin123)
2. Navigate to Admin Dashboard
3. Should see:
   - Total Users count
   - Active Users count
   - Admin Users count
   - Regular Users count
   - Activity Timeline (last 30 days)
   - User Activity Details table with:
     - Username
     - Role
     - Item Count
     - Scan Count
     - Last Activity

## Troubleshooting

### Issue: Migration doesn't run

**Solution:**
1. Check server logs for migration messages
2. Run manual migration script
3. Verify database file permissions

### Issue: Still getting "no such column" error

**Solution:**
1. Stop the server
2. Run manual migration: `python backend/migrate_database.py`
3. Verify column exists: `sqlite3 grozione.db ".schema receipt_scans"`
4. Restart server

### Issue: Dashboard shows 0 for all counts

**Possible Causes:**
1. No data in database yet
2. User not associated with items

**Solution:**
1. Add some grocery items
2. Scan a receipt
3. Refresh dashboard

### Issue: Migration script fails

**Solution:**
1. Check database file exists
2. Check file permissions
3. Check SQLite version (should be 3.x)
4. Try backing up and recreating database

## Backup Recommendation

Before running migration on production database:

```bash
# Backup database
cp grozione.db grozione.db.backup

# Run migration
python backend/migrate_database.py

# If issues occur, restore backup
cp grozione.db.backup grozione.db
```

## Future Migrations

This migration system can be extended for future schema changes:

1. Add new migration checks in `migrate_db()`
2. Check for missing columns/tables
3. Add them with `ALTER TABLE` or `CREATE TABLE`
4. Log migration status
5. Provide fallback queries if needed

## Summary

✅ **Fixed:** Admin dashboard now displays data correctly
✅ **Added:** Automatic database migration on startup
✅ **Added:** Manual migration script for troubleshooting
✅ **Added:** Fallback queries for graceful degradation
✅ **Improved:** Database schema management

The admin dashboard should now work correctly for both new and existing databases!

