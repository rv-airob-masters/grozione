# GroziOne 🛒

**Your Smart Grocery Companion with AI-Powered Receipt Scanning**

GroziOne is a comprehensive grocery management application that helps you track purchases, compare prices across stores, and manage your grocery shopping with intelligent receipt scanning powered by Azure Document Intelligence.

![GroziOne Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=GroziOne+Dashboard)

## ✨ Features

### 🏠 **Core Functionality**
- **Multi-User Support** - Secure user authentication with data isolation
- **Grocery Item Management** - Add, view, edit, and delete grocery items
- **Store Comparison** - Compare prices across different stores
- **Receipt Scanning** - AI-powered receipt processing using Azure Document Intelligence
- **Price Tracking** - Monitor price changes over time
- **Store Analytics** - View spending patterns and store summaries

### 🔐 **Authentication & Security**
- **JWT-based Authentication** - Secure login system
- **User Registration** - Self-service account creation
- **Admin Panel** - Administrative user management
- **Data Isolation** - Each user sees only their own data

### 🎨 **User Experience**
- **Modern UI** - Beautiful, responsive design with Tailwind CSS
- **Dark/Light Mode** - Adaptive theming
- **Mobile Friendly** - Works seamlessly on all devices
- **Intuitive Navigation** - Easy-to-use tile-based interface

### 🤖 **AI Integration**
- **Azure Document Intelligence** - Professional-grade receipt scanning
- **Smart Item Recognition** - Automatic item name and price extraction
- **Store Detection** - Intelligent store name recognition
- **Confidence Scoring** - Quality assessment of scanned data

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
```bash
# Create your first user account
# Go to http://localhost:3000
# Click "Don't have an account? Sign up"
# Create your account with your desired username and password
```

> **🎉 You're all set!** Your GroziOne application is ready to use with your personal account.

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
| **users** | User accounts and authentication | `id`, `username`, `password_hash`, `role` |
| **grocery_items** | Individual grocery purchases | `id`, `user_id`, `item_name`, `price`, `store_name` |
| **receipt_scans** | Receipt processing history | `id`, `user_id`, `scan_date`, `status` |
| **status_checks** | System health monitoring | `id`, `timestamp`, `status` |

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
- `DELETE /api/grocery-items/{id}` - Delete item

#### Receipt Processing
- `POST /api/scan-receipt` - Upload and process receipt
- `POST /api/confirm-receipt-items` - Confirm scanned items

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
- [ ] Admin login works
- [ ] Data isolation between users
- [ ] JWT token expiration handling

#### Grocery Management
- [ ] Add new grocery items
- [ ] View grocery items list
- [ ] Delete grocery items
- [ ] Store comparison functionality
- [ ] Price tracking over time

#### Receipt Scanning
- [ ] Upload receipt image
- [ ] Process with Azure Document Intelligence
- [ ] Review and confirm scanned items
- [ ] Add confirmed items to grocery list

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

- **Azure Document Intelligence** for receipt processing
- **FastAPI** for the robust backend framework
- **React** and **Tailwind CSS** for the beautiful frontend
- **shadcn/ui** for the component library
- All our contributors and users!

---

<div align="center">
  <p>Made with ❤️ by the GroziOne Team</p>
  <p>
    <a href="https://github.com/rv-airob-masters/grozione">⭐ Star us on GitHub</a> •
    <a href="https://twitter.com/grozione">🐦 Follow on Twitter</a> •
    <a href="https://grozione.com">🌐 Visit Website</a>
  </p>
</div>
