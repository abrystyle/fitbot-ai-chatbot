# Contributing to FitBot AI Chatbot

Thank you for your interest in contributing to FitBot! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Setup Development Environment
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/fitbot-ai-chatbot.git`
3. Install dependencies: `npm install`
4. Copy environment file: `cp .env.example .env.local`
5. Start Docker services: `docker-compose up -d`
6. Initialize database: `npm run db:push`
7. Start development server: `npm run dev`

## 📋 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Architecture Principles
- Server Components for data fetching
- Client Components for interactivity
- Server Actions for mutations
- Type safety throughout the stack

### Testing
- Write unit tests for new features
- Test AI streaming functionality
- Verify database operations
- Check authentication flows

## 🔄 Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm run build
   npm run lint
   npm run test
   ```

4. **Commit Changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🐛 Bug Reports

When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: OS, Node.js version, browser
- **Screenshots**: If applicable

## 💡 Feature Requests

For new features, please include:
- **Use Case**: Why this feature would be valuable
- **Description**: Detailed description of the feature
- **Implementation Ideas**: Any thoughts on how it could be implemented
- **Alternatives**: Other solutions you've considered

## 🏗️ Architecture Overview

### Key Technologies
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Server Actions, Prisma, PostgreSQL
- **AI**: Vercel AI SDK, OpenAI, Anthropic
- **Authentication**: NextAuth.js 5.0
- **Styling**: Tailwind CSS, shadcn/ui

### Important Files
- `app/actions/chat.ts` - AI streaming implementation
- `app/components/chat/` - Chat interface components
- `lib/ai.ts` - AI configuration
- `lib/auth.ts` - Authentication setup
- `prisma/schema.prisma` - Database schema

## 📝 Commit Convention

Use conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Maintenance tasks

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Focus on constructive feedback
- Follow the code of conduct

## 📞 Getting Help

- **Issues**: Create GitHub issues for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Check the README and inline documentation

Thank you for contributing to FitBot! 🙏