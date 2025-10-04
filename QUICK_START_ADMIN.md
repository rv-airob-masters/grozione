# Quick Start Guide - Admin Features

## 🚀 Getting Started

### Step 1: Login as Admin
1. Open the application in your browser
2. Enter credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Click "Sign In"

### Step 2: Explore Admin Features
After login, you'll see two additional tiles:
- **Admin Dashboard** (cyan/sky colored)
- **User Management** (fuchsia/pink colored)

---

## 📊 Admin Dashboard

### What You'll See:
1. **Statistics Cards** (top row):
   - Total Users
   - Active Users
   - Admin Users
   - Regular Users

2. **Recent Activity Timeline**:
   - Shows last 30 days of activity
   - Displays date and activity count
   - Includes grocery items and receipt scans

3. **User Activity Details Table**:
   - Username
   - Role (with colored badges)
   - Item count
   - Scan count
   - Last activity date

### How to Use:
- Simply click the "Admin Dashboard" tile from home
- Data refreshes automatically when you navigate to it
- Scroll down to see all user activities

---

## 👥 User Management

### View All Users
- Click "User Management" tile from home
- See all users in a table format
- Information displayed:
  - Username
  - Role (admin/user)
  - Created date
  - Action buttons

### Add New User
1. Click "Add New User" button (top right)
2. Fill in the form:
   - Username (required)
   - Password (required)
   - Role (select admin or user)
3. Click "Create User"
4. User appears in the table immediately

### Edit User
1. Click the edit icon (pencil) next to any user
2. Modify fields:
   - Username
   - Role (dropdown)
   - Password (optional - leave blank to keep current)
3. Click the save icon (checkmark)
4. Changes are saved immediately

### Delete User
1. Click the delete icon (trash) next to any user
2. Confirm deletion in the dialog
3. User is removed immediately
4. **Note:** You cannot delete your own account

---

## 🔒 Security Notes

### What Admins Can Do:
✅ View all users
✅ Create new users (admin or regular)
✅ Edit any user's details
✅ Delete other users
✅ View system statistics
✅ Access all regular user features

### What Admins Cannot Do:
❌ Delete their own account
❌ See other users' passwords
❌ Access without authentication

### What Regular Users Cannot Do:
❌ See admin tiles
❌ Access admin dashboard
❌ Access user management
❌ View other users' data

---

## 🐛 Troubleshooting

### Issue: Admin Dashboard Shows No Data
**Solution:** 
- Make sure users have added grocery items or scanned receipts
- Check that the backend is running
- Refresh the page

### Issue: Cannot Delete a User
**Possible Causes:**
- You're trying to delete your own account (not allowed)
- User doesn't exist
- Network error

**Solution:**
- Check console for error messages
- Verify you're not deleting yourself
- Try refreshing the page

### Issue: Login Error Not Showing
**Solution:**
- Check browser console for errors
- Verify backend is running
- Clear browser cache

### Issue: Receipt Scanner Not Working
**Solution:**
- Ensure you're logged in
- Check that Azure Document Intelligence is configured
- Verify image is in correct format (JPG, PNG)
- Check file size (must be under 10MB)

---

## 📝 Common Tasks

### Task: Create Multiple Users
1. Navigate to User Management
2. Click "Add New User"
3. Fill form and submit
4. Repeat for each user
5. All users appear in the table

### Task: Change User Role
1. Navigate to User Management
2. Find the user in the table
3. Click edit icon
4. Change role in dropdown
5. Click save icon

### Task: Reset User Password
1. Navigate to User Management
2. Find the user in the table
3. Click edit icon
4. Enter new password
5. Click save icon

### Task: Monitor User Activity
1. Navigate to Admin Dashboard
2. Scroll to "User Activity Details" table
3. Check "Last Activity" column
4. View item and scan counts

---

## 💡 Tips & Best Practices

### User Management
- ✅ Use descriptive usernames
- ✅ Create strong passwords
- ✅ Assign appropriate roles
- ✅ Regularly review user list
- ✅ Remove inactive users

### Dashboard Monitoring
- ✅ Check dashboard daily
- ✅ Monitor active users count
- ✅ Review activity timeline
- ✅ Identify inactive users
- ✅ Track system usage trends

### Security
- ✅ Change default admin password
- ✅ Create separate admin accounts for each administrator
- ✅ Don't share admin credentials
- ✅ Regularly audit user accounts
- ✅ Remove users who no longer need access

---

## 🎯 Quick Reference

### Admin Credentials
```
Username: admin
Password: admin123
```

### Test User Credentials
```
Username: user1
Password: summer25
```

### Admin Tiles
- **Admin Dashboard** - View statistics and activity
- **User Management** - Manage user accounts

### Regular User Tiles
- **Add New Item** - Add grocery items manually
- **Scan Receipt** - Upload receipt for automatic extraction
- **My Items** - View your grocery list
- **Store Summary** - View spending by store
- **Compare Prices** - Compare prices across stores

---

## 📞 Need Help?

### Documentation Files
- `ADMIN_FEATURES.md` - Detailed feature documentation
- `BUGFIXES.md` - Bug fixes and solutions
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation details

### Debugging
1. Open browser console (F12)
2. Check for error messages
3. Verify backend is running
4. Check network tab for failed requests

### Common Error Messages
- "Invalid username or password" - Check credentials
- "Not enough permissions" - You need admin role
- "Cannot delete your own account" - Self-deletion prevented
- "Username already exists" - Choose different username

---

## ✅ Checklist for New Admins

- [ ] Login with admin credentials
- [ ] Change default admin password
- [ ] Explore admin dashboard
- [ ] View user activity statistics
- [ ] Create a test user
- [ ] Edit the test user
- [ ] Delete the test user
- [ ] Review all existing users
- [ ] Check activity timeline
- [ ] Test regular user features
- [ ] Logout and login as regular user
- [ ] Verify admin features are hidden for regular users

---

## 🎉 You're Ready!

You now have everything you need to manage users and monitor the GroziOne application. Enjoy your admin powers! 🚀

