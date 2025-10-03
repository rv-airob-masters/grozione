# Contributing to GroziOne 🤝

Thank you for your interest in contributing to GroziOne! We welcome contributions from everyone.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git
- Basic knowledge of FastAPI and React

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/grozione.git`
3. Follow the setup instructions in [README.md](README.md)

## 📋 How to Contribute

### 🐛 Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Provide system information (OS, Python/Node versions)
- Include error messages and logs

### 💡 Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Provide mockups or examples if applicable

### 🔧 Code Contributions

#### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Commit Messages
Follow conventional commits:
- `feat: add receipt scanning feature`
- `fix: resolve database connection issue`
- `docs: update API documentation`
- `style: format code with black`

#### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation if needed
6. Submit a pull request

## 🧪 Testing Guidelines

### Backend Testing
```bash
cd backend
python -m pytest tests/ -v --cov=.
```

### Frontend Testing
```bash
cd frontend
npm test -- --coverage
```

### Code Quality
```bash
# Backend
flake8 .
black .
mypy .

# Frontend
npm run lint
npm run format
```

## 📝 Code Style

### Python (Backend)
- Follow PEP 8
- Use Black for formatting
- Use type hints
- Maximum line length: 88 characters

### JavaScript/React (Frontend)
- Use ESLint configuration
- Use Prettier for formatting
- Use functional components with hooks
- Follow React best practices

## 🏗️ Project Structure

### Backend Architecture
- `server.py` - FastAPI application and routes
- `database.py` - Database operations and models
- `services/` - Business logic and external integrations
- `tests/` - Test files

### Frontend Architecture
- `src/components/` - React components
- `src/contexts/` - React contexts for state management
- `src/api.js` - API client functions
- `src/utils/` - Utility functions

## 🔍 Review Process

### What We Look For
- Code quality and readability
- Test coverage for new features
- Documentation updates
- Performance considerations
- Security best practices

### Review Timeline
- Initial review within 48 hours
- Follow-up reviews within 24 hours
- Merge after approval from maintainers

## 🎯 Areas for Contribution

### High Priority
- [ ] Mobile app development (React Native)
- [ ] Advanced analytics and reporting
- [ ] Bulk import/export functionality
- [ ] API rate limiting and caching

### Medium Priority
- [ ] Dark mode improvements
- [ ] Accessibility enhancements
- [ ] Performance optimizations
- [ ] Additional receipt formats support

### Good First Issues
- [ ] UI/UX improvements
- [ ] Documentation updates
- [ ] Test coverage improvements
- [ ] Bug fixes

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/grozione)
- **Email**: developers@grozione.com
- **GitHub Discussions**: Use for questions and ideas

## 📜 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a professional environment

### Enforcement
Violations of the code of conduct should be reported to the maintainers.

## 🏆 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Invited to the contributors' Discord channel
- Eligible for contributor swag

Thank you for contributing to GroziOne! 🎉
