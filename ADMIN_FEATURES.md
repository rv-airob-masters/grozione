# Admin Features Implementation

## Overview
This document describes the admin functionality implemented for the GroziOne application.

## Features Implemented

### 1. Admin User Authentication
- Admin users are identified by the `role` field in the user table
- Default admin account: `username: admin`, `password: admin123`
- JWT tokens include role information for authorization

### 2. Admin Dashboard
**Location:** `frontend/src/components/AdminDashboard.jsx`

**Features:**
- **Statistics Cards:**
  - Total Users count
  - Active Users (users with grocery items)
  - Admin Users count
  - Regular Users count

- **Activity Timeline:**
  - Shows last 30 days of user activity
  - Displays date and activity count
  - Includes both grocery items and receipt scans

- **User Activity Details Table:**
  - Lists all users with their statistics
  - Shows username, role, item count, scan count
  - Displays last activity date
  - Color-coded role badges

### 3. User Management
**Location:** `frontend/src/components/UserManagement.jsx`

**Features:**
- **View All Users:** Table displaying all registered users
- **Add New User:** 
  - Form to create new users
  - Set username, password, and role (admin/user)
  - Validation for required fields
- **Edit User:**
  - Inline editing of user details
  - Update username, role, and password
  - Password field is optional (only update if provided)
- **Delete User:**
  - Delete user with confirmation dialog
  - Prevents admin from deleting their own account
  - Cascade deletion of related data

### 4. Admin-Specific UI
**Location:** `frontend/src/App.js`

**Changes:**
- Admin users see different home screen with admin-focused welcome message
- Two additional tiles for admin users:
  - **Admin Dashboard** (cyan/sky gradient)
  - **User Management** (fuchsia/pink gradient)
- Admin tiles appear first in the grid
- Regular user tiles remain unchanged
- Admin badge displayed in header for admin users

## Backend API Endpoints

### User Management Endpoints
All admin endpoints require authentication and admin role.

1. **GET /api/users**
   - Get all users
   - Returns: List of users with id, username, role, created_at

2. **POST /api/admin/register**
   - Create new user (admin only)
   - Body: `{ username, password, role }`
   - Returns: Success message and user details

3. **PUT /api/admin/users/{user_id}**
   - Update user details
   - Body: `{ username?, password?, role? }` (all optional)
   - Returns: Success message

4. **DELETE /api/admin/users/{user_id}**
   - Delete user
   - Prevents self-deletion
   - Returns: Success message

5. **GET /api/admin/dashboard**
   - Get dashboard statistics
   - Returns: Complete stats object with user counts, activity timeline, and user activities

## Database Methods

**Location:** `backend/database.py`

New methods added:
- `update_user(user_id, username?, password?, role?)` - Update user details
- `delete_user(user_id)` - Delete user by ID
- `get_user_activity_stats()` - Get comprehensive activity statistics

## Security Features

1. **Role-Based Access Control:**
   - `get_current_admin_user()` dependency ensures only admins can access admin endpoints
   - Returns 403 Forbidden for non-admin users

2. **Self-Deletion Prevention:**
   - Admin users cannot delete their own account
   - Prevents accidental lockout

3. **Password Hashing:**
   - All passwords are hashed using SHA-256
   - Passwords never stored in plain text

4. **JWT Authentication:**
   - All admin endpoints require valid JWT token
   - Token includes user_id, username, and role

## Testing Instructions

### 1. Login as Admin
```
Username: admin
Password: admin123
```

### 2. Test Admin Dashboard
- Navigate to "Admin Dashboard" tile
- Verify statistics cards display correct counts
- Check activity timeline shows recent activities
- Confirm user activity table displays all users

### 3. Test User Management
- Navigate to "User Management" tile
- **Add User:**
  - Click "Add New User"
  - Fill in username, password, and select role
  - Submit and verify user appears in table
- **Edit User:**
  - Click edit icon on any user
  - Modify username or role
  - Optionally change password
  - Save and verify changes
- **Delete User:**
  - Click delete icon on a non-admin user
  - Confirm deletion in dialog
  - Verify user is removed from table

### 4. Test Regular User View
- Logout from admin account
- Login as regular user (e.g., `username: user1`, `password: summer25`)
- Verify admin tiles are NOT visible
- Verify regular tiles work as expected

### 5. Test Security
- As regular user, try to access admin endpoints directly (should fail)
- As admin, try to delete your own account (should be prevented)

## File Changes Summary

### Backend Files Modified:
1. `backend/database.py` - Added user management methods
2. `backend/server.py` - Added admin API endpoints

### Frontend Files Created:
1. `frontend/src/components/AdminDashboard.jsx` - Admin dashboard component
2. `frontend/src/components/UserManagement.jsx` - User management component

### Frontend Files Modified:
1. `frontend/src/App.js` - Added admin routing and tiles
2. `frontend/src/api.js` - Added admin API methods

## Default Users

The system comes with two default users:

1. **Admin User:**
   - Username: `admin`
   - Password: `admin123`
   - Role: `admin`

2. **Test User:**
   - Username: `user1`
   - Password: `summer25`
   - Role: `user`

## Future Enhancements

Potential improvements for future versions:
1. User activity logs with detailed action history
2. Bulk user operations (import/export)
3. User permissions and custom roles
4. Email notifications for user actions
5. Advanced analytics and reporting
6. User session management
7. Password reset functionality
8. Two-factor authentication for admin users

