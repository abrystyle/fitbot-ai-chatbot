# 🤖 FitBot - AI-Powered Fitness Chatbot

An intelligent fitness and nutrition chatbot built with Next.js 15, React 19, and the Vercel AI SDK. FitBot provides personalized workout routines, nutrition advice, and product recommendations through real-time AI conversations.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)

## ✨ Features

### 🎯 **Core Functionality**
- **Real-time AI Chat**: Streaming responses using Vercel AI SDK with `readStreamableValue`
- **Personalized Recommendations**: Fitness routines, nutrition plans, and product suggestions
- **User Profiles**: Detailed fitness profiles with goals, experience, and preferences
- **Conversation History**: Persistent chat sessions with message history
- **Demo Mode**: Works without API keys for testing and demonstration

### 🔒 **Authentication & Security**
- **NextAuth.js 5.0**: Multiple authentication providers (OAuth + Credentials)
- **Secure Sessions**: JWT-based authentication with secure session management
- **Rate Limiting**: Built-in rate limiting for API protection
- **Input Validation**: Comprehensive input validation with Zod schemas

### 🗄️ **Database & Architecture**
- **PostgreSQL**: Robust relational database with Docker support
- **Prisma ORM**: Type-safe database access with automatic migrations
- **11 Specialized Tables**: Users, fitness profiles, conversations, messages, products, and more
- **Docker Infrastructure**: Complete containerized development environment

### 🚀 **Modern Stack**
- **Next.js 15**: App Router, Server Actions, Turbopack
- **React 19**: Latest React features with Server Components
- **TypeScript 5.6**: Full type safety across the application
- **Tailwind CSS**: Modern, responsive UI design
- **Vercel AI SDK 5.0**: Advanced AI integration with streaming support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### 1. Clone and Install
```bash
git clone https://github.com/abrystyle/fitbot-ai-chatbot.git
cd fitbot-ai-chatbot
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# - Add OpenAI API key for full AI functionality
# - Configure OAuth providers (optional)
# - Database URL is pre-configured for Docker
```

### 3. Start Services
```bash
# Start PostgreSQL, Redis, and Adminer
docker-compose up -d

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### 4. Access Application
- **App**: http://localhost:3000
- **Database Admin**: http://localhost:8080 (Adminer)
- **Credentials**: Username: `postgres`, Password: `postgres`, Database: `fitness_chatbot_dev`

## 🧬 Project Structure

```
fitness-chatbot-nextjs15/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (dashboard)/             # Protected routes
│   │   ├── chat/                # Chat interface
│   │   │   └── [id]/           # Individual conversations
│   │   └── profile/            # User profile management
│   ├── actions/                 # Server Actions
│   │   ├── chat.ts             # Chat functionality with AI streaming
│   │   ├── profile.ts          # Profile management
│   │   ├── recommendations.ts  # Product recommendations
│   │   └── search.ts           # Search functionality
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── chat/               # Chat interface components
│   │   ├── providers/          # Context providers
│   │   └── ui/                 # Reusable UI components
│   └── globals.css             # Global styles
├── lib/                         # Utilities and configuration
│   ├── ai.ts                   # AI SDK configuration
│   ├── auth.ts                 # NextAuth.js configuration
│   ├── prisma.ts               # Database client
│   ├── constants.ts            # Application constants
│   └── validations.ts          # Zod schemas
├── prisma/                      # Database schema and migrations
│   └── schema.prisma           # Prisma schema with 11 tables
├── docker/                      # Docker configuration
├── docker-compose.yml          # Development services
└── package.json                # Dependencies and scripts
```

## 💾 Database Schema

The application uses 11 specialized tables for comprehensive fitness data management:

- **Users**: Authentication and basic user data
- **FitnessProfile**: Detailed fitness information and goals
- **Conversations**: Chat session management
- **Messages**: Individual chat messages with AI responses
- **Products**: Fitness products and supplements database
- **ProductRecommendations**: Personalized product suggestions
- **Workouts**: Exercise routines and plans
- **WorkoutExercises**: Individual exercises within workouts
- **Exercises**: Exercise database with instructions
- **NutritionPlans**: Meal planning and nutrition guidance
- **Sessions**: NextAuth.js session management

## 🤖 AI Integration

### Streaming Chat Implementation
```typescript
// Server Action (app/actions/chat.ts)
import { createStreamableValue } from '@ai-sdk/rsc'
import { streamText } from 'ai'

const stream = createStreamableValue('')
const { textStream } = await streamText({
  model: openai('gpt-4-turbo-preview'),
  messages,
  system: fitnessPrompt,
})

for await (const text of textStream) {
  stream.update(text)
}

return { messageStream: stream.value }
```

```typescript
// Client Component (app/components/chat/chat-interface.tsx)
import { readStreamableValue } from '@ai-sdk/rsc'

for await (const delta of readStreamableValue(result.messageStream)) {
  setCurrentResponse(delta as string)
}
```

### Supported AI Providers
- **OpenAI**: GPT-4 Turbo for conversational responses
- **Anthropic**: Claude 3.5 Sonnet (alternative provider)
- **Demo Mode**: Simulated responses when no API key is configured

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build            # Production build
npm run start            # Production server

# Database
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Docker
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View service logs
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitness_chatbot_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# AI Providers
OPENAI_API_KEY="sk-your-openai-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Redis (Optional - for production rate limiting)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

## 🏗️ Architecture Decisions

### Server Components + Client Components
- **Server Components**: Data fetching, authentication, database queries
- **Client Components**: Interactive UI, real-time chat, form handling
- **Server Actions**: API endpoints with built-in CSRF protection

### Streaming AI Responses
- **Real-time Updates**: `readStreamableValue` for live response streaming
- **Error Handling**: Graceful fallbacks when AI services are unavailable
- **Demo Mode**: Full functionality without requiring API keys

### Type Safety
- **End-to-End TypeScript**: Strict typing across client and server
- **Prisma Integration**: Auto-generated types for database operations
- **Zod Validation**: Runtime type checking for user inputs

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
# Set up PostgreSQL database (Neon, Supabase, or similar)
```

### Docker Production
```bash
# Build production image
docker build -f Dockerfile.prod -t fitbot-ai .

# Run with production database
docker run -p 3000:3000 --env-file .env.production fitbot-ai
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/abrystyle/fitbot-ai-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/abrystyle/fitbot-ai-chatbot/discussions)
- **Documentation**: Check out the `/docs` folder for detailed guides

## 🏆 Acknowledgments

- **Vercel AI SDK**: For excellent AI integration capabilities
- **Next.js Team**: For the amazing App Router and Server Actions
- **Prisma**: For type-safe database operations
- **Tailwind CSS**: For beautiful, responsive design systems

---

**Built with ❤️ for the fitness community**