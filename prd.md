Here is a Product Requirements Document (PRD) for the Vibe application, based on the information provided in the video transcript. This document outlines the core aspects of the application, its features, and the underlying technologies, presented in a structure that should be easy for an AI agent to comprehend.

---

### **Product Requirements Document: Vibe**

**1. Product Name:**
*   **Vibe**

**2. Product Vision & Goal:**
*   To enable users to **build their next startup with nothing more than a sentence**.
*   To create an **AI-powered application builder** that generates fully functional Next.js applications, tailored to a user's prompt.
*   To provide an intuitive and efficient platform for transforming natural language into functional web applications, complete with live previews, accessible code, and robust backend infrastructure.

**3. Target Audience:**
*   Individuals and entrepreneurs looking to **rapidly prototype or build web applications without extensive coding knowledge**.
*   Developers seeking to **learn and implement AI-powered application development** using modern web technologies.

**4. Core Features & Functionality:**

*   **AI-Powered App Generation**:
    *   Users can **input a natural language prompt** (e.g., "Netflix-style homepage", "Kanban board", "admin dashboard") to generate a complete Next.js application.
    *   The generation process is handled by an **AI coding agent**.
    *   Support for various **AI models** (OpenAI GPT-4.1 recommended, Anthropic, Grock, Gemini with caveats).

*   **Project Lifecycle Management**:
    *   **Project Creation**: A new project is created upon user prompt submission, automatically assigned a unique slug name.
    *   **Project Storage**: All generated projects ("vibes") are **saved to a PostgreSQL database** (Neon + Prisma) for persistence and retrieval.
    *   **Project Listing**: Users can **view all their previously generated projects** on a dedicated "Previous Vibes" section of the homepage.
    *   **Project Access**: Dedicated project pages where users can interact with their generated apps and view conversation history.

*   **Interactive Application Preview**:
    *   **Live Web Preview**: Displays the **fully functional generated application within an interactive iframe**.
    *   **External URL**: Provides a **live URL** for the generated application, allowing users to open, share, or test it in a real browser environment.
    *   **Preview Controls**: Includes options to **refresh the preview** (to see latest changes) and **copy the URL to clipboard**.
    *   **Sandbox Expiration Management**: Sandboxes will remain active for a configurable duration (default 5 mins, increased to 30-60 mins for better UX, up to 24 hours for Pro users).

*   **Code Transparency & Exploration**:
    *   **Code Explorer**: Allows users to **explore every component, utility, and file** that was created by the AI agent.
    *   **File Tree View**: Organised **file system navigation** to easily locate specific files.
    *   **Code Syntax Highlighting**: Displays code with **syntax highlighting** for readability.
    *   **Code Copying**: Ability to **copy the content of any displayed file to the clipboard**.
    *   **Tabbed Interface**: Users can **switch between the live demo preview and the code view** within the project interface.

*   **User Management & Monetisation**:
    *   **Authentication (Clerk)**: Seamless **sign-in and sign-up** functionality, including Google authentication.
    *   **Protected Routes**: **All critical API routes (TRPC procedures) are protected**, ensuring only authenticated users can access their data.
    *   **Billing (Clerk Billing)**: Integrates with Clerk's billing system for **subscription plan management** (Free and Pro plans).
        *   **Free Plan**: Offers a limited number of credits (e.g., 5 monthly credits).
        *   **Pro Plan**: Offers a higher number of credits (e.g., 100 monthly credits) and potentially other features like "private projects" or "custom domains".
        *   **No Webhooks Required**: Clerk Billing handles subscriptions directly without custom webhook implementation.
    *   **Credit System**:
        *   Each AI generation consumes a **credit**.
        *   Users are **notified of their remaining credits** and the reset time.
        *   If credits are exhausted, users are **redirected to the pricing page**.
        *   **Atomic credit deduction** to prevent race conditions.

*   **AI Agent Orchestration & Execution**:
    *   **Background Jobs (Ingest)**: Long-running AI tasks (e.g., app generation) are **offloaded to background jobs** to prevent network timeouts and ensure completion regardless of user connection.
    *   **Ingest Agent Kit**: Facilitates the creation and management of **autonomous AI coding agents**.
    *   **Agent Tools**: AI agents are equipped with **tools to interact with the sandbox environment**:
        *   **Terminal Tool**: To run shell commands (e.g., `npm install`).
        *   **Create/Update Files Tool**: To write and modify application files.
        *   **Read Files Tool**: To read existing files for context.
    *   **Agent Memory/Conversation History**: The AI agent maintains a **limited history of previous messages and generated outputs** (e.g., last 5 messages) to understand context for iterative refinements.
    *   **Agent Output Processing**: AI-generated responses are processed to create **concise summaries and descriptive fragment titles**.
    *   **Agent Network/Execution Loop**: Agents operate in an **execution loop** until a task is completed (signaled by a "task summary" in the output), with a maximum iteration limit to prevent excessive resource consumption.
    *   **Secure Sandboxes (E2B)**: AI-generated code runs in **isolated cloud sandboxes** to ensure security and expose live URLs. Custom Docker templates are used for Next.js environments.

*   **User Interface & Experience**:
    *   **Responsive Design**: The application UI adapts to different screen sizes.
    *   **Custom Theming**: Supports **light and dark modes** with a custom color palette (e.g., yellow/orange theme).
    *   **Shadcn UI**: Utilises a collection of **reusable and accessible UI components** for consistent design.
    *   **User Feedback**: **Toast notifications** for background job initiation and success, and **loading shimmer messages** during AI generation.
    *   **Intuitive Form Input**: Auto-resizing text area for prompts, with keyboard shortcuts for submission (Ctrl/Cmd + Enter).
    *   **Predefined Project Templates**: Quick-start templates with descriptive prompts to demonstrate capabilities.
    *   **Scroll-to-Bottom**: Automatically scrolls message view to the latest message.
    *   **Tooltips (Hints)**: Provides contextual hints for icons and buttons.

*   **Robustness & Error Handling**:
    *   **Type Safety (tRPC)**: Ensures **end-to-end type safety** between frontend and backend, catching errors during development.
    *   **Automatic Retries**: Ingest automatically retries failed steps in background jobs, with context-aware adjustments (e.g., adding ` --legacy-peer-deps` on retry).
    *   **Error Boundaries (React Error Boundary)**: Implements **segment-level UI error handling** to prevent entire page crashes from isolated component errors.
    *   **Global Error Page**: A fallback error page for unhandled errors.
    *   **Input Validation**: Zod-based schema validation for user inputs (e.g., prompt length).

**5. Technical Stack & Infrastructure:**
*   **Frontend Framework**: **Next.js 15** with **React 19**.
*   **Database**: **PostgreSQL** hosted on **Neon**.
*   **Object-Relational Mapper (ORM)**: **Prisma OM**.
*   **API Layer**: **tRPC** for full-stack type safety and **Tanstack Query** for data fetching, caching, and state management.
*   **Authentication & User Management**: **Clerk**.
*   **Billing & Subscriptions**: **Clerk Billing**.
*   **Background Jobs & AI Agent Orchestration**: **Ingest** (including Ingest Agent Kit).
*   **AI Code Execution Environments**: **E2B Sandboxes** (using **Docker** for custom Next.js templates).
*   **AI Models**: Configurable, with **OpenAI (GPT-4.1)** as the primary choice.
*   **Styling**: **Tailwind CSS 4** and **Shadcn UI** for components.
*   **Deployment**: **Vercel**.
*   **Code Review (Development Tool)**: **Code Rabbit** (AI-powered code reviewer).
*   **Other Libraries**:
    *   **Zod**: For schema validation.
    *   **Date-fns**: For date formatting and duration calculations.
    *   **SuperJSON**: For data serialization/deserialization between server and client components.
    *   **React Textarea Autosize**: For dynamic text area sizing in forms.
    *   **PrismJS**: For code syntax highlighting in the code explorer.
    *   **Random Words Slugs**: For generating project names.
    *   **Rate Limiter Flexible**: For credit tracking and usage limits.
    *   **React Error Boundary**: For UI segment-level error handling.

**6. High-Level User Flow:**

1.  **Access Vibe**: User navigates to the Vibe homepage (or is redirected after sign-in/up if protected).
2.  **Sign In/Up**: If not authenticated, user signs in or creates an account via Clerk.
3.  **Homepage Interaction**:
    *   User sees a prompt field and a list of predefined project templates.
    *   User can input a custom prompt or select a template (e.g., "Build a Netflix clone").
    *   User sees their remaining credits.
4.  **Initiate Generation**:
    *   User submits the prompt via button click or keyboard shortcut (Ctrl/Cmd + Enter).
    *   The system performs **credit check**: If credits are insufficient, an error is shown, and the user is redirected to the pricing page.
    *   If credits are sufficient, **one credit is consumed**, and a **background job (via Ingest)** is immediately invoked.
    *   User receives instant feedback ("Background job started") and sees a loading state.
5.  **AI Processing (Backend - Invisible to User)**:
    *   The Ingest background job triggers the **AI coding agent**.
    *   The agent connects to a **secure E2B sandbox**.
    *   The agent uses its **tools (terminal, file R/W)** to interpret the prompt, build the Next.js application, and iteratively refine it within the sandbox.
    *   The agent retains **conversation history** to understand context.
    *   Upon completion, the agent generates a **summary message and a fragment title**.
6.  **View Generated Project**:
    *   The generated application's URL, code files, and AI summary are **saved to the database** (associated with the project and message).
    *   The user is **redirected to their new project page**.
    *   The new project message (including the AI summary) is displayed, and the latest fragment is automatically selected.
7.  **Project Interaction**:
    *   On the project page, the user sees a **resizable layout** with:
        *   A **messages container** displaying the conversation history.
        *   A **preview area** (right panel) for the live application, or a **code explorer** (left panel).
    *   Users can **switch between "Demo" (live preview) and "Code" (file explorer) tabs**.
    *   In the "Demo" tab, the **live preview of the app** is displayed in an iframe, with options to refresh or open in a new tab.
    *   In the "Code" tab, users can **browse the generated files** via a file tree view, see code with syntax highlighting, and copy file contents.
    *   Users can **continue the conversation** in the message form to request modifications or additions to the current project, leveraging the AI agent's memory.
8.  **Account & Billing Management**:
    *   Users can access their account settings via the navigation bar.
    *   Users can view pricing plans, check their remaining credits, and upgrade their subscription.

**7. Data Models (Simplified):**
*   **Project**: `{ id: string, name: string, userId: string, createdAt: DateTime, updatedAt: DateTime }`.
*   **Message**: `{ id: string, projectId: string, content: string, role: MessageRole, type: MessageType, createdAt: DateTime, updatedAt: DateTime, fragment?: Fragment }`.
*   **Fragment**: `{ id: string, messageId: string, sandboxUrl: string, title: string, files: JSON, createdAt: DateTime, updatedAt: DateTime }`.
*   **Usage**: `{ key: string (userId), points: number, expire: DateTime (optional) }`.

**8. Development Stages (High-Level Roadmap from Video Chapters):**
*   **Chapter 01-03: Foundation Setup**: Next.js Project, Database (Neon+Prisma), TRPC.
*   **Chapter 04-07: AI Backend Core**: Background Jobs (Ingest), AI Provider Integration, E2B Sandboxes, Agent Tools.
*   **Chapter 08-09: Data Models & Relations**: Messages & Fragments, Projects & Relations.
*   **Chapter 10-14: Core UI Development**: Messages UI (Container, Card, Form), Project Header, Fragment Preview, Code View (Explorer, Tabs), Homepage (Form, List).
*   **Chapter 15: Theming**: Custom Application Theme.
*   **Chapter 16: Authentication**: Clerk Integration, Protected Routes.
*   **Chapter 17: Billing & Credits**: Clerk Billing, Rate Limiting, Usage Display.
*   **Chapter 18: Agent Memory**: Conversation History for AI Agent.
*   **Chapter 19: Polish & Bug Fixes**: Sandbox Expiration, Template Privacy, Error Handling.
*   **Chapter 20: Deployment**: Vercel Deployment, Ingest Production Connection.

---

e2b template build --name miniai-swe --cmd compile_page.sh