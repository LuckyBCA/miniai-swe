# MiniAI - Full Stack Agentic AI Website Builder

> **Build your next startup with nothing more than a sentence.**

MiniAI is an AI-powered application builder inspired by tools like Lovable, Replit, and Bolt. It generates fully functional Next.js applications from natural language prompts, complete with live previews, accessible code exploration, and robust backend infrastructure.

## ✨ Features

### 🤖 AI-Powered App Generation
- **Natural Language Prompts**: Describe your app in plain English (e.g., "Netflix-style homepage", "Kanban board", "admin dashboard")
- **Multi-Model Support**: Choose from Vibe-S, Vibe-M, and Vibe-L models powered by Gemini and other advanced LLMs
- **Intelligent Code Generation**: AI agents with access to terminal tools, file operations, and context-aware development

### 🔒 Secure Sandbox Environment
- **E2B Cloud Sandboxes**: Isolated, secure containers for running AI-generated code
- **Live Preview URLs**: Instantly shareable, fully functional applications
- **Custom Docker Templates**: Optimized Next.js runtime environments
- **Configurable Timeouts**: Sandboxes stay alive from 5 minutes to 24 hours (Pro users)

### 👤 User Management & Billing
- **Clerk Authentication**: Seamless sign-in/sign-up with Google OAuth support
- **Credit System**: Usage-based billing with Free (5 credits) and Pro (100 credits) tiers
- **Protected Routes**: Secure access to user-specific projects and data
- **Automatic Billing**: Integrated with Clerk Billing (no webhooks required)

### 📱 Interactive Project Management
- **Project Persistence**: All "vibes" saved to PostgreSQL database (Neon + Prisma)
- **Code Explorer**: Browse every generated file with syntax highlighting
- **Conversation History**: AI agents maintain context for iterative improvements
- **Live/Code Toggle**: Switch between live preview and code exploration
- **Copy & Share**: Copy code snippets and share live URLs

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for all screen sizes
- **Dark/Light Mode**: Custom theming with yellow/orange accent colors
- **Shadcn UI Components**: Accessible, reusable component library
- **Real-time Feedback**: Toast notifications and loading states
- **Keyboard Shortcuts**: Ctrl/Cmd + Enter for quick submissions

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with **React 19**
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Shadcn UI** for components
- **tRPC** with **TanStack Query** for type-safe API calls

### Backend & Infrastructure
- **PostgreSQL** (Neon) with **Prisma ORM**
- **Clerk** for authentication and billing
- **Inngest** for background job orchestration
- **Inngest AgentKit** for AI agent management
- **E2B Sandboxes** for secure code execution

### AI & Models
- **Google Gemini** integration via AgentKit
- **Multi-provider Support** (OpenAI, Anthropic, Grok ready)
- **Custom Model Abstraction** (Vibe-S, Vibe-M, Vibe-L)
- **Agent Memory** for conversation context

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (recommend [Neon](https://neon.tech))
- [Clerk](https://clerk.com) account for authentication
- [E2B](https://e2b.dev) account for sandboxes
- [Inngest](https://inngest.com) account for background jobs
- AI provider API keys (Gemini recommended)

### Environment Variables
Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Inngest
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."

# E2B Sandboxes
E2B_API_KEY="..."

# AI Models
GEMINI_API_KEY="..."
# Optional: XAI_API_KEY for Grok models

# Security
ENCRYPTION_KEY="..."
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd miniai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the Inngest development server** (in a separate terminal)
   ```bash
   npx inngest-cli@latest dev
   ```

6. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Inngest Dashboard: [http://localhost:8288](http://localhost:8288)

## 📖 Usage

1. **Sign up/Sign in** using Clerk authentication
2. **Enter a prompt** describing the app you want to build
3. **Select a model** (Vibe-S for speed, Vibe-L for quality)
4. **Watch the magic happen** as AI agents build your app in real-time
5. **Preview your app** in the live sandbox environment
6. **Explore the code** to understand how it was built
7. **Continue the conversation** to refine and improve your app

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── inngest/       # Inngest webhook endpoint
│   │   ├── trpc/          # tRPC router
│   │   └── webhooks/      # Clerk webhooks
│   ├── sign-in/           # Authentication pages
│   ├── sign-up/
│   └── test-*/            # Development test pages
├── components/            # React components
│   └── ui/               # Shadcn UI components
├── inngest/              # Background job functions
│   ├── client.ts         # Inngest client config
│   ├── functions.ts      # Job definitions
│   └── functions/        # Individual job implementations
├── lib/                  # Utility libraries
│   ├── agent-kit.ts      # AI agent configuration
│   ├── ai-models.ts      # Model mappings
│   ├── db.ts            # Database client
│   └── utils.ts         # General utilities
├── server/               # Backend logic
│   └── api/             # tRPC routers
└── trpc/                # tRPC configuration
```

## 🔧 Development

### Database Management
```bash
# Reset database
npx prisma migrate reset

# Apply migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### E2B Template Management
```bash
# Build and publish template
cd sandbox-templates/nextjs
e2b template build --name miniai-swe
e2b template publish

# Make template private
e2b template unpublish
```

### Testing AI Integration
Visit `/test-ai` for AI model testing
Visit `/test-e2b` for E2B sandbox testing
Visit `/test-trpc-auth` for authentication testing

## 📊 Database Schema

The application uses three main models:

- **User**: Clerk user data with encrypted API keys
- **Vibe**: Generated projects with prompts, code, and metadata
- **GenerationStatus**: Tracks the lifecycle of AI generations

## 🚦 Background Jobs

Inngest orchestrates long-running AI tasks:

1. **Credit Validation**: Ensures user has sufficient credits
2. **Sandbox Creation**: Spins up E2B environment
3. **AI Agent Execution**: Runs coding agents with tools
4. **Code Generation**: Creates and modifies files
5. **URL Generation**: Provides live preview links
6. **Data Persistence**: Saves results to database

## 🛡 Security Features

- **Isolated Sandboxes**: All code runs in secure E2B containers
- **Encrypted Storage**: API keys encrypted at rest
- **Protected Routes**: Authentication required for all operations
- **Rate Limiting**: Credit system prevents abuse
- **Type Safety**: End-to-end TypeScript with tRPC

## 🌟 Roadmap

- [ ] Support for more AI providers (Claude, GPT-4)
- [ ] Custom domain support for generated apps
- [ ] Collaborative editing and sharing
- [ ] Template library and marketplace
- [ ] Advanced debugging and error handling
- [ ] Mobile app support
- [ ] Integration with version control systems

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built following the [Full Stack Agentic AI Website Builder tutorial](https://www.youtube.com/watch?v=tutorial-link)
- Powered by [E2B](https://e2b.dev) for secure code execution
- Authentication by [Clerk](https://clerk.com)
- Background jobs by [Inngest](https://inngest.com)
- AI models by [Google Gemini](https://ai.google.dev)

---

**Ready to build your next startup with just a sentence? Get started with MiniAI today!** 🚀
