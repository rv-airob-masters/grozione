# Testing Guide - Round 2 Bug Fixes

## Quick Test Checklist

### ✅ Test 1: Store Name Fuzzy Matching

**Objective:** Verify that receipt scanner can match store name variations to dropdown options.

**Steps:**
1. Login to the application
2. Navigate to "Scan Receipt" tile
3. Upload a receipt with store name variation (e.g., "TESCO SUPERSTORE", "tesco extra")
4. Wait for processing to complete

**Expected Results:**
- ✅ Store dropdown should auto-populate with "Tesco"
- ✅ Success message should say "Found X items from Tesco"
- ✅ No manual store selection needed

**Test Cases:**
| Extracted Store Name | Expected Match |
|---------------------|----------------|
| TESCO SUPERSTORE | Tesco |
| tesco extra | Tesco |
| Tesco Express | Tesco |
| TESCO METRO | Tesco |
| Asda Supermarket | Asda |
| ASDA SUPERSTORE | Asda |
| Aldi Stores | Aldi |
| ALDI SUPERMARKET | Aldi |
| Lidl UK | Lidl |

**If No Match Found:**
- ✅ Message should say "Found X items. Please select the store from dropdown."
- ✅ Store dropdown should be empty
- ✅ User can manually select store

---

### ✅ Test 2: Login Error Message Visibility

**Objective:** Verify that login errors are clearly visible to users.

**Steps:**
1. Go to login page
2. Enter invalid username: "wronguser"
3. Enter invalid password: "wrongpass"
4. Click "Sign In"

**Expected Results:**
- ✅ Red error box appears at top of form
- ✅ Error message: "Invalid username or password"
- ✅ Toast notification also appears
- ✅ Error box has red background and border

**Additional Tests:**

**Test 2a: Error Clears on Typing**
1. See error message from previous test
2. Start typing in username field
3. **Expected:** Error message disappears

**Test 2b: Empty Fields Error**
1. Leave username and password empty
2. Click "Sign In"
3. **Expected:** Error message "Please fill in all fields"

**Test 2c: Dark Mode**
1. Switch to dark mode
2. Try invalid login
3. **Expected:** Error message visible with dark mode styling

---

### ✅ Test 3: Disable Add Button Without Store

**Objective:** Verify that "Add to Grocery List" button is properly disabled and shows clear guidance.

**Steps:**
1. Login to the application
2. Navigate to "Scan Receipt" tile
3. Upload a receipt
4. Wait for processing
5. Clear the store dropdown (if auto-populated)

**Expected Results:**
- ✅ Amber warning box appears above buttons
- ✅ Warning message: "Please select a store name to add items to your grocery list"
- ✅ "Add to Grocery List" button is disabled (grayed out)
- ✅ Hover over button shows tooltip: "Please select a store first"

**Test 3a: Enable Button with Store**
1. Select a store from dropdown
2. **Expected:** 
   - Warning box disappears
   - Button becomes enabled (colored)
   - Can click to add items

**Test 3b: Button During Processing**
1. Select store and click "Add to Grocery List"
2. **Expected:**
   - Button shows "Adding Items..." with spinner
   - Button remains disabled during processing

---

### ✅ Test 4: Compare Prices Filtering

**Objective:** Verify that Compare Prices only shows items with actual price differences.

**Setup:**
1. Add test items to grocery list:
   - Milk: £2.50 at Tesco
   - Milk: £2.50 at Asda (same price)
   - Bread: £1.20 at Aldi
   - Bread: £1.80 at Tesco (different price)
   - Eggs: £2.00 at Asda
   - Eggs: £2.00 at Lidl (same price)

**Steps:**
1. Navigate to "Compare Prices" tile
2. View the comparison results

**Expected Results:**
- ✅ Bread comparison is shown (£0.60 savings)
- ✅ Milk comparison is NOT shown (£0.00 savings)
- ✅ Eggs comparison is NOT shown (£0.00 savings)
- ✅ Only items with savings > 0 are displayed

**Test 4a: No Comparable Items**
1. Delete all items
2. Add items from only one store
3. Navigate to "Compare Prices"
4. **Expected:** Message "No items to compare"

**Test 4b: All Same Prices**
1. Add same item at same price from multiple stores
2. Navigate to "Compare Prices"
3. **Expected:** Message "No items to compare"

**Test 4c: Multiple Items with Differences**
1. Add 5 items with price differences
2. Navigate to "Compare Prices"
3. **Expected:**
   - All 5 items shown
   - Sorted by highest savings first
   - Total Potential Savings calculated correctly

---

## Detailed Test Scenarios

### Scenario 1: Complete Receipt Scanning Flow

**Steps:**
1. Login as regular user
2. Click "Scan Receipt" tile
3. Upload receipt image (e.g., Tesco receipt)
4. Wait for processing
5. Verify extracted data:
   - Items list populated
   - Store name matched (e.g., "TESCO SUPERSTORE" → "Tesco")
   - Prices displayed correctly
6. Verify store dropdown auto-selected
7. Click "Add to Grocery List"
8. Verify success message
9. Navigate to "My Items"
10. Verify items added with correct store

**Expected:** Complete flow works smoothly with auto-matched store.

---

### Scenario 2: Login Error Recovery

**Steps:**
1. Go to login page
2. Enter wrong credentials
3. See error message in red box
4. Start typing correct username
5. Error disappears
6. Enter correct password
7. Click "Sign In"
8. Successfully logged in

**Expected:** Error handling is smooth and user-friendly.

---

### Scenario 3: Receipt Without Store Match

**Steps:**
1. Upload receipt from unknown store (e.g., "Local Market")
2. Processing completes
3. Store dropdown is empty
4. Warning message appears: "Please select a store name to add items to your grocery list"
5. "Add to Grocery List" button is disabled
6. Select "Others" from dropdown
7. Warning disappears, button enables
8. Click "Add to Grocery List"
9. Items added successfully

**Expected:** Clear guidance when manual selection needed.

---

### Scenario 4: Price Comparison Analysis

**Steps:**
1. Add multiple items from different stores:
   - Apples: £2.00 at Tesco, £1.50 at Aldi, £2.00 at Asda
   - Bananas: £1.20 at all stores
   - Oranges: £3.00 at Tesco, £2.50 at Asda
2. Navigate to "Compare Prices"
3. Verify results:
   - Apples shown (£0.50 savings, Aldi cheapest)
   - Bananas NOT shown (no savings)
   - Oranges shown (£0.50 savings, Asda cheapest)
4. Check "All Stores" section for Apples
5. Verify all 3 stores listed with prices

**Expected:** Only meaningful comparisons shown with accurate data.

---

## Edge Cases to Test

### Edge Case 1: Very Long Store Names
- Upload receipt with "TESCO SUPERSTORE EXTRA LARGE"
- **Expected:** Matches to "Tesco"

### Edge Case 2: Mixed Case Store Names
- Upload receipt with "TeSCo ExTrA"
- **Expected:** Matches to "Tesco"

### Edge Case 3: Store Name with Special Characters
- Upload receipt with "TESCO - SUPERSTORE"
- **Expected:** Matches to "Tesco"

### Edge Case 4: Multiple Login Failures
- Try wrong password 5 times
- **Expected:** Error message shows each time

### Edge Case 5: Network Error During Login
- Disconnect network
- Try to login
- **Expected:** Error message "Failed to connect to server"

### Edge Case 6: Receipt with No Items
- Upload blank receipt
- **Expected:** Message "Found 0 items"

### Edge Case 7: All Items Same Price
- Add 10 items, all same price across stores
- Navigate to Compare Prices
- **Expected:** "No items to compare" message

---

## Browser Compatibility Testing

Test all fixes in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

---

## Mobile Responsiveness Testing

Test on:
- ✅ Mobile phone (portrait)
- ✅ Mobile phone (landscape)
- ✅ Tablet (portrait)
- ✅ Tablet (landscape)

**Verify:**
- Error messages readable
- Warning boxes fit screen
- Buttons accessible
- Dropdowns work properly

---

## Performance Testing

### Test 1: Large Receipt
- Upload receipt with 50+ items
- **Expected:** Processing completes within 10 seconds

### Test 2: Multiple Store Variations
- Test 20 different store name variations
- **Expected:** All match correctly within 1 second

### Test 3: Large Item List
- Add 100+ items to grocery list
- Navigate to Compare Prices
- **Expected:** Page loads within 2 seconds

---

## Accessibility Testing

### Keyboard Navigation
- Tab through login form
- **Expected:** Error message accessible

### Screen Reader
- Use screen reader on login page
- **Expected:** Error message announced

### Color Contrast
- Check error message contrast
- **Expected:** Meets WCAG AA standards

---

## Regression Testing

Verify previous fixes still work:
- ✅ Admin dashboard shows data
- ✅ User management works
- ✅ Home page reset on login
- ✅ Receipt fields populate correctly

---

## Bug Report Template

If you find issues, report using this format:

```
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser: 
- OS: 
- User Role: 

**Severity:** [Critical/High/Medium/Low]
```

---

## Test Results Log

| Test Case | Status | Notes | Tester | Date |
|-----------|--------|-------|--------|------|
| Store Fuzzy Matching | ⬜ | | | |
| Login Error Visibility | ⬜ | | | |
| Disable Add Button | ⬜ | | | |
| Compare Prices Filter | ⬜ | | | |
| Complete Receipt Flow | ⬜ | | | |
| Login Error Recovery | ⬜ | | | |
| Receipt Without Match | ⬜ | | | |
| Price Comparison | ⬜ | | | |

Legend: ✅ Pass | ❌ Fail | ⬜ Not Tested

---

## Sign-Off

**Tested By:** ___________________

**Date:** ___________________

**Overall Status:** ⬜ All Tests Pass | ⬜ Issues Found

**Notes:**
_______________________________________
_______________________________________
_______________________________________

