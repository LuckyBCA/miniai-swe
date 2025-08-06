# MiniAI - Full Stack Agentic AI Website Builder

> **Transform ideas into working applications with nothing more than a sentence.**

MiniAI is a production-ready AI application builder that generates fully functional Next.js applications from natural language prompts. Built with modern technologies and a beautiful glassmorphism UI.

## ✨ Features

### 🤖 AI-Powered App Generation
- **Natural Language Prompts**: Describe your app in plain English
- **Multi-Model Support**: Vibe-S (Speed), Vibe-M (Balanced), Vibe-L (Quality) + OpenAI & Anthropic
- **Intelligent Code Generation**: AI agents with context-aware development
- **Real-time Chat Interface**: Interactive AI assistant for guidance

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful backdrop-blur effects and translucent interfaces
- **Gradient Themes**: Purple/blue gradient design throughout
- **Responsive Layout**: Perfect on all devices with mobile-first design
- **Animated Elements**: Smooth transitions and interactive components
- **Message Interface**: Real-time chat with typing indicators and status updates

### 🔒 Secure Architecture
- **E2B Cloud Sandboxes**: Isolated, secure containers for code execution
- **Live Preview URLs**: Instantly shareable, functional applications
- **Clerk Authentication**: Seamless OAuth with Google integration
- **Protected Routes**: Secure access to user data and projects

### 📊 Advanced Features
- **Project Analytics**: Track completion rates and usage statistics
- **Background Processing**: Inngest-powered job queue for AI generation
- **Credit System**: Usage-based billing with Free and Pro tiers
- **Code Explorer**: Browse generated files with syntax highlighting
- **Live Demo Links**: Direct access to running applications

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with **React 19** and **TypeScript**
- **Tailwind CSS 4** with **Shadcn/ui** components
- **tRPC** with **TanStack Query** for type-safe APIs
- **Clerk** for authentication and user management

### Backend & Infrastructure
- **PostgreSQL** with **Prisma ORM**
- **Inngest** for background job orchestration
- **E2B Sandboxes** for secure code execution
- **Multi-provider AI** (Gemini, OpenAI, Anthropic)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account
- E2B account
- AI provider API keys

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd miniai-swe
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Add your API keys (see DEPLOYMENT.md)
   ```

3. **Database setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development**
   ```bash
   npm run dev
   npx inngest-cli@latest dev
   ```

## 📖 Usage

1. **Sign up** with Google OAuth
2. **Enter a prompt** describing your application
3. **Select AI model** (Vibe-S for speed, Vibe-L for quality)
4. **Watch real-time generation** in the chat interface
5. **Preview your app** in live sandbox environment
6. **Explore the code** and download if needed

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app router
├── components/             # React components
│   ├── ui/                # Shadcn UI components
│   └── MessageInterface.tsx # Chat interface
├── inngest/               # Background job functions
├── lib/                   # Utilities and configurations
├── server/api/            # tRPC routers
└── actions/               # Server actions
```

## 🎯 Key Improvements Made

### Build & Infrastructure ✅
- Fixed all compilation errors and build issues
- Resolved import paths and missing dependencies
- Updated for Next.js 15 compatibility
- Added proper TypeScript configurations

### UI/UX Transformation ✅
- Complete redesign with glassmorphism effects
- Interactive message interface with AI assistant
- Responsive grid layouts and modern typography
- Animated backgrounds and smooth transitions
- Enhanced forms and navigation components

### Backend Enhancements ✅
- Stable Inngest background job processing
- Enhanced API routers with analytics
- Improved error handling and logging
- Secure sandbox management with E2B

### Developer Experience ✅
- Comprehensive documentation
- Production deployment guide
- Environment configuration templates
- Type-safe APIs throughout

## 🌟 Live Demo Features

- **AI Chat Assistant**: Interactive guidance and help
- **Real-time Generation**: Watch your app being built
- **Live Preview**: Immediately accessible application URLs
- **Code Exploration**: Browse and understand generated code
- **Analytics Dashboard**: Track your application statistics

## 📈 Production Ready

This application is fully production-ready with:
- ✅ Secure authentication and authorization
- ✅ Scalable architecture with background jobs
- ✅ Modern UI/UX with accessibility features
- ✅ Comprehensive error handling
- ✅ Database integration and migrations
- ✅ Deployment configuration for Vercel/Docker

## 🤝 Contributing

The codebase is well-structured for contributions:
- TypeScript for type safety
- ESLint and Prettier for code quality
- Component-based architecture
- Comprehensive API documentation

---

**Ready to build your next startup with just a sentence? Get started with MiniAI today!** 🚀
