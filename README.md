# GroziOne 🛒

**Your Smart Grocery Companion with AI-Powered Receipt Scanning**

GroziOne is a comprehensive grocery management application that helps you track purchases, compare prices across stores, and manage your grocery shopping with intelligent receipt scanning powered by Azure Document Intelligence.


## ✨ Features

### 🏠 **Core Functionality**
- **Multi-User Support** - Secure user authentication with data isolation
- **Grocery Item Management** - Add, view, **edit**, and delete grocery items with inline editing
- **Store Comparison** - Compare prices across different stores (shows only items with price differences)
- **Receipt Scanning** - AI-powered receipt processing using Azure Document Intelligence
- **Price Tracking** - Monitor price changes over time
- **Store Analytics** - View spending patterns and store summaries with drill-down capabilities
- **Interactive Store Summary** - Click store names to view, edit, and delete all items from that store

### 🔐 **Authentication & Security**
- **JWT-based Authentication** - Secure login system with proper error messaging
- **Email-Based Registration** - Users sign up with email address (required)
- **Password Reset** - Forgot password functionality with secure token system
- **Email Validation** - Format validation and duplicate prevention
- **Secure Token System** - Cryptographically secure reset tokens with 1-hour expiration
- **Role-Based Access Control** - Admin and regular user roles
- **Admin Dashboard** - Comprehensive user management and activity monitoring
- **Data Isolation** - Each user sees only their own data
- **Session Management** - Automatic home page navigation on login

### 👨‍💼 **Admin Features**
- **Admin Dashboard** - Real-time statistics and user activity monitoring
  - Total users, active users, admin/regular user counts
  - Activity timeline (last 30 days)
  - User activity details with item and scan counts
- **User Management** - Complete CRUD operations for user accounts
  - Add new users with role selection
  - Edit existing users (username, password, role)
  - Delete users with confirmation (prevents self-deletion)
- **Activity Tracking** - Monitor user engagement and receipt scanning activity
- **Admin-Specific UI** - Different home screen with additional management tiles

### 🎨 **User Experience**
- **Modern UI** - Beautiful, responsive design with Tailwind CSS and shadcn/ui
- **Inline Editing** - Edit items directly without modals or popups
- **Smart Validation** - Form validation with helpful error messages
- **Toast Notifications** - Clear feedback for all user actions
- **Mobile Friendly** - Works seamlessly on all devices
- **Intuitive Navigation** - Easy-to-use tile-based interface
- **Expandable Cards** - Click to expand and see detailed information
- **Visual Feedback** - Icons, colors, and animations for better UX

### 🤖 **AI Integration**
- **Azure Document Intelligence** - Professional-grade receipt scanning
- **Smart Item Recognition** - Automatic item name and price extraction
- **Fuzzy Store Matching** - Intelligent store name recognition
  - Matches "TESCO SUPERSTORE" → "Tesco"
  - Matches "tesco extra" → "Tesco"
  - Handles case-insensitive variations
- **Confidence Scoring** - Quality assessment of scanned data
- **Automatic Store Selection** - Auto-populates store dropdown after scanning

## 🆕 Recent Updates

### Version 2.0 - Enhanced User Experience & Admin Features

**🎯 Major Improvements:**

1. **Inline Item Editing** - Edit grocery items directly without popups
   - Edit from "My Items" page
   - Edit from "Store Summary" expanded view
   - All fields editable: name, store, quantity, price
   - Save/Cancel buttons with visual feedback

2. **Enhanced Store Summary** - Interactive store management
   - Removed confusing "Average" value
   - Shows clear "Total Spend" label
   - Click store names to expand and view all items
   - Edit and delete items directly from store view
   - Smooth expand/collapse animations

3. **Improved Receipt Scanning** - Smarter and more user-friendly
   - Fuzzy store name matching (handles variations like "TESCO SUPERSTORE")
   - Auto-populates store dropdown after scanning
   - Add button disabled until store is selected
   - Clear warning messages for missing information
   - Receipt scans now properly tracked in database

4. **Better Price Comparison** - More meaningful insights
   - Only shows items with actual price differences
   - Hides items with same price across stores
   - Clearer best deal and most expensive indicators

5. **Enhanced Admin Dashboard** - Comprehensive user management
   - Real-time user statistics (total, active, admin, regular)
   - Activity timeline for last 30 days
   - User activity details with item and scan counts
   - Scan count now tracks correctly
   - Add, edit, delete users with full CRUD operations

6. **Improved Authentication** - Better user feedback
   - Clear error messages for invalid login (red error box)
   - Always redirects to home page on login
   - Prevents unauthorized page access

7. **Email and Password Reset** - Complete account recovery system
   - Email required during sign up
   - Forgot password functionality
   - Secure token-based password reset
   - Token expiration (1 hour)
   - One-time use tokens
   - Email validation and duplicate prevention
   - Session management improvements

7. **Database Enhancements** - Automatic migrations
   - Auto-migration on server startup
   - Adds missing columns to existing tables
   - Backward compatible with old databases
   - Manual migration script available

**📚 Documentation:**
- `ENHANCEMENTS_ROUND3.md` - Detailed feature documentation
- `ADMIN_DASHBOARD_FIX.md` - Admin dashboard fix details
- `SCAN_COUNT_FIX.md` - Receipt scan tracking fix
- `BUGFIXES_ROUND2.md` - Bug fixes documentation

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Azure Document Intelligence** (optional, for receipt scanning)

### 1. Clone the Repository
```bash
git clone https://github.com/rv-airob-masters/grozione.git
cd grozione
```

> **🔒 Privacy Note:** The repository is configured to exclude sensitive files:
> - Database files (*.db) - Contains user data
> - Environment files (.env) - Contains API keys
> - Test files and batch scripts - Development artifacts

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv grozi
grozi\Scripts\activate  # Windows
# source grozi/bin/activate  # macOS/Linux

# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings (see Configuration section below)

# Initialize database (creates grozione.db automatically)
python -c "from database import db; print('Database initialized successfully!')"

# Start backend server
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install --legacy-peer-deps
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 5. First-Time Setup

**Default Admin Account:**
- Username: `admin`
- Password: `admin123`

> ⚠️ **Important:** Change the default admin password after first login!

**Create Regular User Account:**
```bash
# Go to http://localhost:3000
# Click "Don't have an account? Sign up"
# Create your account with your desired username and password
```

> **🎉 You're all set!** Your GroziOne application is ready to use with your personal account.

## 📸 Feature Showcase

### 🏠 User Dashboard
- **Tile-based Navigation** - Easy access to all features
- **Role-based UI** - Different views for admin and regular users
- **Quick Actions** - Scan receipt, view items, compare prices

### 📝 My Items Page
- **Inline Editing** - Click edit icon to modify any field
- **Quick Delete** - Remove items with one click
- **Visual Feedback** - Toast notifications for all actions
- **Responsive Design** - Works on mobile and desktop

### 🏪 Store Summary
- **Expandable Cards** - Click store name to see all items
- **Total Spend** - Clear financial information per store
- **Item Management** - Edit and delete items from store view
- **Recent Items** - Quick preview of latest purchases

### 🧾 Receipt Scanner
- **Drag & Drop** - Easy file upload
- **AI Processing** - Automatic item extraction
- **Smart Matching** - Fuzzy store name recognition
- **Review & Edit** - Confirm items before adding
- **Validation** - Ensures all required fields are filled

### 📊 Compare Prices
- **Smart Filtering** - Only shows items with price differences
- **Best Deal Highlight** - Green badge for lowest price
- **Most Expensive** - Red badge for highest price
- **Savings Calculator** - Shows potential savings

### 👨‍💼 Admin Dashboard
- **User Statistics** - Total, active, admin, regular user counts
- **Activity Timeline** - Visual chart of last 30 days
- **User Details** - Item count, scan count, last activity
- **User Management** - Full CRUD operations
- **Role Management** - Assign admin or user roles

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_PATH="grozione.db"

# CORS Settings
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

# JWT Configuration
JWT_SECRET_KEY="your-secret-key-change-in-production"

# Azure Document Intelligence (Optional)
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="https://your-resource.cognitiveservices.azure.com/"
AZURE_DOCUMENT_INTELLIGENCE_KEY="your-api-key-here"
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=3000
```

## 📊 Database Setup & Schema

### 🔧 Database Initialization

GroziOne uses SQLite for local development. The database is automatically created when you first run the backend:

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
grozi\Scripts\activate  # Windows
# source grozi/bin/activate  # macOS/Linux

# Initialize database (creates grozione.db)
python -c "from database import db; print('Database initialized successfully!')"
```

### 🗃️ Database Schema

The application creates the following tables automatically:

| Table | Description | Key Fields |
|-------|-------------|------------|
| **users** | User accounts and authentication | `id`, `username`, `password_hash`, `role`, `created_at` |
| **grocery_items** | Individual grocery purchases | `id`, `user_id`, `item_name`, `price`, `store`, `quantity`, `date` |
| **receipt_scans** | Receipt processing history | `id`, `user_id`, `filename`, `store_name`, `total_amount`, `items_count`, `created_at` |

### 🔄 Database Migrations

The application includes automatic database migration support:

- **Automatic Migration** - Runs on server startup
- **Schema Updates** - Adds missing columns to existing tables
- **Backward Compatible** - Works with both old and new databases
- **Manual Migration** - Run `python backend/migrate_database.py` if needed

**Migration Features:**
- ✅ Adds `user_id` column to `receipt_scans` table
- ✅ Preserves existing data
- ✅ Logs migration status
- ✅ Idempotent (safe to run multiple times)

### 🔒 Data Privacy & Security

**Important:** Database files contain sensitive user data and are automatically excluded from Git:

- ✅ **Database files** (*.db, *.sqlite) are in `.gitignore`
- ✅ **Environment files** (.env) with API keys are protected
- ✅ **Test files** and temporary scripts are excluded
- ✅ **User data isolation** - each user sees only their own data

### 🔄 Database Management

```bash
# Create a fresh database (removes all data)
rm backend/grozione.db
python -c "from database import db; print('Fresh database created!')"

# Backup your database
cp backend/grozione.db backend/grozione_backup_$(date +%Y%m%d).db

# Check database status
python -c "from database import db; print(f'Database path: {db.db_path}')"
```

## 🛠️ Development

### Project Structure
```
grozione/
├── backend/                 # FastAPI backend
│   ├── services/           # Business logic
│   ├── database.py         # Database operations
│   ├── server.py          # API endpoints
│   └── requirements.txt   # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── api.js        # API client
│   └── package.json      # Node dependencies
└── grozi/                 # Python virtual environment
```

### API Endpoints

#### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/me` - Current user info

#### Grocery Management
- `GET /api/grocery-items` - List user's items
- `POST /api/grocery-items` - Add new item
- `PUT /api/grocery-items/{id}` - **Update existing item** ✨ NEW
- `DELETE /api/grocery-items/{id}` - Delete item

#### Receipt Processing
- `POST /api/scan-receipt` - Upload and process receipt
- `POST /api/confirm-receipt-items` - Confirm scanned items (creates receipt scan record)

#### Admin Endpoints (Admin Role Required)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/activity` - Get user activity data

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
flake8 .
black .

# Frontend linting
cd frontend
npm run lint
```

## 🚀 Deployment

### Production Environment Variables

```env
# Security
JWT_SECRET_KEY="your-production-secret-key"
CORS_ORIGINS="https://yourdomain.com"

# Database (for production, consider PostgreSQL)
DATABASE_PATH="/path/to/production/database.db"

# Azure Services
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="https://your-prod-resource.cognitiveservices.azure.com/"
AZURE_DOCUMENT_INTELLIGENCE_KEY="your-production-api-key"
```

### Docker Deployment (Coming Soon)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🧪 Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] User registration works
- [ ] User login/logout works
- [ ] Admin login works (admin/admin123)
- [ ] Invalid login shows error message in red
- [ ] Data isolation between users
- [ ] JWT token expiration handling
- [ ] Always redirects to home page on login

#### Grocery Management
- [ ] Add new grocery items
- [ ] View grocery items list
- [ ] **Edit grocery items inline** ✨ NEW
- [ ] Delete grocery items
- [ ] Store comparison functionality (only shows items with price differences)
- [ ] Price tracking over time

#### Receipt Scanning
- [ ] Upload receipt image
- [ ] Process with Azure Document Intelligence
- [ ] Fuzzy store name matching works (e.g., "TESCO SUPERSTORE" → "Tesco")
- [ ] Store dropdown auto-populates after scan
- [ ] Review and confirm scanned items
- [ ] Add button disabled without store selection
- [ ] Add confirmed items to grocery list
- [ ] Receipt scan recorded in database

#### Store Summary
- [ ] View store summaries with total spend
- [ ] Click store name to expand
- [ ] View all items from expanded store
- [ ] Edit items from store summary
- [ ] Delete items from store summary

#### Admin Features
- [ ] Admin sees different home screen
- [ ] Admin Dashboard shows user statistics
- [ ] Admin Dashboard shows activity timeline
- [ ] Admin Dashboard shows user activity details
- [ ] Scan count increments correctly
- [ ] User Management: Add new users
- [ ] User Management: Edit existing users
- [ ] User Management: Delete users (with confirmation)
- [ ] Cannot delete self as admin

### Automated Testing

```bash
# Run all backend tests
cd backend
python -m pytest tests/ -v

# Run frontend tests
cd frontend
npm test -- --coverage

# Run integration tests
npm run test:integration
```

## 🔍 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check if database file exists
ls -la backend/grozione.db  # Linux/macOS
dir backend\grozione.db     # Windows

# Recreate database if needed
cd backend
grozi\Scripts\activate      # Windows
# source grozi/bin/activate # Linux/macOS
python -c "from database import db; print('Database initialized')"
```

**Database File Missing:**
```bash
# The database file is not in Git (for privacy)
# Initialize a fresh database:
cd backend
python -c "from database import db; print('Fresh database created!')"

# This creates grozione.db with all required tables
# Default admin user will be created automatically
```

**Import Errors:**
```bash
# Ensure virtual environment is activated
grozi\Scripts\activate  # Windows
source grozi/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

**Dependency Conflicts:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Build Errors:**
```bash
# Check Node.js version
node --version  # Should be 16+

# Clear cache
npm cache clean --force
```

### Receipt Scanning Issues

**Azure Document Intelligence Errors:**
- Verify endpoint URL format
- Check API key validity
- Ensure sufficient quota
- Validate image format (JPEG, PNG, PDF)

**Store Name Not Recognized:**
- The fuzzy matching handles common variations
- If store not matched, select manually from dropdown
- Supported stores: Tesco, Asda, Aldi, Lidl, Best foods, Quality, Freshco, Others

**Add Button Disabled:**
- Ensure store is selected from dropdown
- Amber warning will show if store is missing
- Select store to enable the button

### Admin Dashboard Issues

**Scan Count Showing 0:**
- Old scans (before fix) won't have records
- Scan a new receipt to test
- Check database migration ran successfully
- Run manual migration: `python backend/migrate_database.py`

**No Data in Dashboard:**
- Ensure users have added items or scanned receipts
- Check database has data: `sqlite3 grozione.db "SELECT COUNT(*) FROM users;"`
- Verify migration completed: Check server logs

**Database Migration Errors:**
```bash
# Run manual migration
cd backend
python migrate_database.py

# Check migration status in logs
# Should see: "✅ Migration completed" or "Database schema is up to date"
```

### Edit Functionality Issues

**Edit Button Not Working:**
- Ensure you're logged in
- Check browser console for errors
- Verify backend is running
- Check API endpoint: `PUT /api/grocery-items/{id}`

**Changes Not Saving:**
- Check network tab for API errors
- Verify all required fields are filled
- Check backend logs for errors
- Ensure user owns the item being edited

## 🏪 Supported Stores

GroziOne supports the following stores with intelligent fuzzy matching:

| Store | Variations Recognized |
|-------|----------------------|
| **Tesco** | Tesco, TESCO, Tesco Superstore, TESCO EXTRA, tesco extra |
| **Asda** | Asda, ASDA, Asda Supermarket, ASDA SUPERSTORE |
| **Aldi** | Aldi, ALDI, Aldi Stores |
| **Lidl** | Lidl, LIDL, Lidl GB |
| **Best foods** | Best foods, BEST FOODS, Bestfoods |
| **Quality** | Quality, QUALITY, Quality Foods |
| **Freshco** | Freshco, FRESHCO, Fresh Co |
| **Others** | Any other store not listed above |

**Fuzzy Matching Features:**
- ✅ Case-insensitive matching
- ✅ Handles extra words (e.g., "Superstore", "Extra")
- ✅ Automatic dropdown selection
- ✅ Manual override available

## 📈 Performance Optimization

### Backend Optimization
- Database indexing on frequently queried fields
- Connection pooling for production databases
- Caching frequently accessed data
- API response compression

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization and compression
- Bundle size analysis and reduction
- Service worker for offline functionality

## 🔒 Security Considerations

### Authentication Security
- JWT tokens with appropriate expiration
- Password hashing with secure algorithms
- Rate limiting on authentication endpoints
- CORS configuration for production

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure file upload handling

### Production Security
- HTTPS enforcement
- Security headers configuration
- Environment variable protection
- Regular dependency updates

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Frontend won't start:**
```bash
npm install --legacy-peer-deps
npm start
```

**Backend database error:**
```bash
# Ensure you're in the backend directory
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Receipt scanning not working:**
- Verify Azure Document Intelligence credentials in `.env`
- Check API endpoint and key are correct
- Ensure sufficient API quota

### Getting Help

- 📧 **Email**: support@grozione.com
- 💬 **Discord**: [Join our community](https://discord.gg/grozione)
- 🐛 **Issues**: [GitHub Issues](https://github.com/rv-airob-masters/grozione/issues)
- 📖 **Documentation**: [Full Documentation](https://docs.grozione.com)

## 🙏 Acknowledgments

- **Azure Document Intelligence** for powerful receipt processing capabilities
- **FastAPI** for the robust and fast backend framework
- **React** for the dynamic and responsive frontend
- **Tailwind CSS** for the beautiful utility-first styling
- **shadcn/ui** for the elegant component library
- **SQLite** for the reliable embedded database
- **JWT** for secure authentication
- All our contributors, testers, and users who provided valuable feedback!

---

<div align="center">
  <p>Made with ❤️ by the GroziOne Team</p>
  <p>
    <a href="https://github.com/rv-airob-masters/grozione">⭐ Star us on GitHub</a> •
    <a href="https://twitter.com/grozione">🐦 Follow on Twitter</a> •
    <a href="https://grozione.com">🌐 Visit Website</a>
  </p>
</div>
