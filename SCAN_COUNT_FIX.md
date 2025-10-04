# Scan Count Fix - Admin Dashboard

## Problem

Admin dashboard's "User Activity Details" table was showing 0 in the "Scans" column even after users uploaded and confirmed receipts.

## Root Cause

The `/confirm-receipt-items` endpoint was adding grocery items to the database but **not** creating a record in the `receipt_scans` table. The scan count query was looking for records in `receipt_scans`, so it always returned 0.

## Solution

Updated the receipt confirmation flow to save a receipt scan record when items are confirmed.

---

## Changes Made

### 1. Backend - Save Receipt Scan Record

**File: `backend/server.py`**

Updated `/confirm-receipt-items` endpoint to save receipt scan:

**Before:**
```python
@api_router.post("/confirm-receipt-items")
async def confirm_receipt_items(items_data: dict, current_user: dict = Depends(get_current_user)):
    # ... extract items and store
    
    # Add items to database
    for item in items:
        saved_item = await db.add_grocery_item(grocery_item_data, user_id)
        added_items.append(saved_item)
    
    return {
        "success": True,
        "message": f"Added {len(added_items)} items",
        "added_items": added_items
    }
```

**After:**
```python
@api_router.post("/confirm-receipt-items")
async def confirm_receipt_items(items_data: dict, current_user: dict = Depends(get_current_user)):
    # ... extract items and store
    
    # Add items to database
    total_amount = 0.0
    for item in items:
        saved_item = await db.add_grocery_item(grocery_item_data, user_id)
        added_items.append(saved_item)
        total_amount += float(item.get('total_price', 0))
    
    # Save receipt scan record
    scan_data = {
        "filename": items_data.get('filename', 'receipt.jpg'),
        "file_size": items_data.get('file_size', 0),
        "processing_status": "success",
        "confidence_score": items_data.get('confidence', 0.9),
        "store_name": store_name,
        "total_amount": total_amount,
        "items_count": len(items),
        "scan_result": items_data
    }
    
    scan_id = await db.save_receipt_scan(scan_data, user_id)
    
    return {
        "success": True,
        "message": f"Added {len(added_items)} items",
        "added_items": added_items,
        "scan_id": scan_id  # Return scan ID
    }
```

**What Changed:**
- ✅ Calculate `total_amount` from all items
- ✅ Create `scan_data` object with metadata
- ✅ Call `db.save_receipt_scan()` with user_id
- ✅ Return `scan_id` in response

---

### 2. Frontend - Pass Scan Metadata

**File: `frontend/src/components/ReceiptScanner.jsx`**

Updated to send scan metadata to backend:

**Before:**
```javascript
body: JSON.stringify({
  items: transformedItems,
  store_name: confirmedStore,
})
```

**After:**
```javascript
body: JSON.stringify({
  items: transformedItems,
  store_name: confirmedStore,
  filename: scanResult.file_info?.original_filename || 'receipt.jpg',
  file_size: scanResult.file_info?.file_size || 0,
  confidence: scanResult.confidence || scanResult.confidence_score || 0.9,
})
```

**What Changed:**
- ✅ Pass `filename` from scan result
- ✅ Pass `file_size` from scan result
- ✅ Pass `confidence` score from scan result

---

## How It Works

### Complete Flow:

1. **User Uploads Receipt:**
   - POST `/scan-receipt` with image file
   - Backend processes with Azure Document Intelligence
   - Returns extracted data (items, store, confidence)
   - Frontend displays results

2. **User Confirms Items:**
   - User reviews/edits items
   - User selects store from dropdown
   - Clicks "Add to Grocery List"

3. **Frontend Sends Data:**
   - Transforms items to backend format
   - Includes scan metadata (filename, file_size, confidence)
   - POST `/confirm-receipt-items`

4. **Backend Saves Data:**
   - Adds each item to `grocery_items` table (with user_id)
   - Calculates total amount
   - Creates scan record in `receipt_scans` table (with user_id)
   - Returns success with scan_id

5. **Admin Dashboard Shows:**
   - Scan count increments for the user
   - Activity timeline includes the scan
   - User activity details show correct scan count

---

## Database Records

### grocery_items Table:
```sql
INSERT INTO grocery_items (id, item_name, store, quantity, price, date, created_at, user_id)
VALUES ('uuid', 'Milk', 'Tesco', '1 L', 2.50, '2025-01-15', '2025-01-15T10:30:00', 1);
```

### receipt_scans Table:
```sql
INSERT INTO receipt_scans (
    id, filename, file_size, processing_status, confidence_score,
    store_name, total_amount, items_count, scan_result, created_at, user_id
)
VALUES (
    'uuid', 'receipt.jpg', 45678, 'success', 0.95,
    'Tesco', 15.50, 5, '{"items": [...]}', '2025-01-15T10:30:00', 1
);
```

---

## Testing

### Test 1: New Receipt Scan

1. **Login as regular user**
   - Username: `user1`
   - Password: `summer25`

2. **Scan a receipt:**
   - Navigate to "Scan Receipt"
   - Upload receipt image
   - Wait for processing
   - Verify items extracted

3. **Confirm items:**
   - Review items
   - Select store
   - Click "Add to Grocery List"
   - Verify success message

4. **Check admin dashboard:**
   - Logout
   - Login as admin (admin/admin123)
   - Navigate to Admin Dashboard
   - Find user1 in "User Activity Details"
   - **Verify:** Scan count = 1 (or incremented)

### Test 2: Multiple Scans

1. **Scan 3 different receipts**
   - Upload receipt 1, confirm items
   - Upload receipt 2, confirm items
   - Upload receipt 3, confirm items

2. **Check admin dashboard:**
   - Login as admin
   - Navigate to Admin Dashboard
   - **Verify:** Scan count = 3

### Test 3: Multiple Users

1. **User1 scans 2 receipts**
2. **User2 scans 3 receipts**
3. **Check admin dashboard:**
   - User1 scan count = 2
   - User2 scan count = 3
   - Total scans in activity timeline = 5

### Test 4: Activity Timeline

1. **Scan receipts on different days**
2. **Check admin dashboard:**
   - Activity timeline shows scans
   - Dates match scan dates
   - Counts are correct

---

## Verification Queries

### Check receipt_scans table:
```sql
-- View all receipt scans
SELECT id, filename, store_name, total_amount, items_count, user_id, created_at
FROM receipt_scans
ORDER BY created_at DESC;

-- Count scans per user
SELECT user_id, COUNT(*) as scan_count
FROM receipt_scans
GROUP BY user_id;
```

### Check user activity:
```sql
-- Get user activity with scan counts
SELECT 
    u.username,
    COUNT(DISTINCT gi.id) as item_count,
    COUNT(DISTINCT rs.id) as scan_count
FROM users u
LEFT JOIN grocery_items gi ON u.id = gi.user_id
LEFT JOIN receipt_scans rs ON u.id = rs.user_id
GROUP BY u.id, u.username;
```

---

## Expected Results

### Admin Dashboard - User Activity Details:

| Username | Role | Items | Scans | Last Activity |
|----------|------|-------|-------|---------------|
| admin | Admin | 0 | 0 | - |
| user1 | User | 15 | 3 | 2025-01-15 |
| testuser | User | 8 | 2 | 2025-01-14 |

### Activity Timeline (Last 30 Days):

| Date | Activity Count |
|------|----------------|
| 2025-01-15 | 5 |
| 2025-01-14 | 3 |
| 2025-01-13 | 2 |

---

## Troubleshooting

### Issue: Scan count still showing 0

**Possible Causes:**
1. Old scans (before this fix) won't have records
2. Database migration didn't run
3. User_id not being passed correctly

**Solutions:**
1. Scan a new receipt after the fix
2. Check server logs for migration messages
3. Verify user_id in receipt_scans table:
   ```sql
   SELECT * FROM receipt_scans WHERE user_id IS NULL;
   ```

### Issue: Scan count increases but items don't appear

**Possible Cause:** Items and scans are saved separately

**Solution:** This is expected behavior. Check:
- Items in "My Items" page
- Scan count in Admin Dashboard
- Both should be correct

### Issue: Error when confirming items

**Possible Cause:** Missing scan metadata

**Solution:** 
- Check browser console for errors
- Verify scanResult has file_info
- Check backend logs

---

## Data Integrity

### Scan Record Includes:
- ✅ Unique scan ID
- ✅ Original filename
- ✅ File size
- ✅ Processing status
- ✅ Confidence score
- ✅ Store name
- ✅ Total amount (calculated)
- ✅ Items count
- ✅ Full scan result (JSON)
- ✅ Timestamp
- ✅ User ID (for tracking)

### Benefits:
1. **Audit Trail** - Track all receipt scans
2. **User Activity** - Monitor user engagement
3. **Analytics** - Analyze scanning patterns
4. **Debugging** - Troubleshoot issues
5. **Reporting** - Generate usage reports

---

## Summary

✅ **Fixed:** Scan count now increments correctly in Admin Dashboard
✅ **Added:** Receipt scan record creation on item confirmation
✅ **Added:** Scan metadata passed from frontend
✅ **Improved:** Complete audit trail for receipt scans
✅ **Improved:** Better user activity tracking

The admin dashboard now accurately reflects user activity including receipt scans! 🎉

