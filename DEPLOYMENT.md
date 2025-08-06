# MiniAI-SWE - Production Deployment Guide

## 🚀 Environment Variables Setup

### Required Environment Variables

```bash
# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://username:password@host:5432/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
CLERK_WEBHOOK_SECRET="whsec_..."

# Inngest Background Jobs
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."

# E2B Sandboxes
E2B_API_KEY="..."

# AI Model APIs
GEMINI_API_KEY="..."
OPENAI_API_KEY="sk-..." # Optional
ANTHROPIC_API_KEY="sk-ant-..." # Optional

# Security
ENCRYPTION_KEY="your-32-character-encryption-key"
```

## 📦 Database Setup

1. **Create PostgreSQL Database** (recommend Neon.tech)
2. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## 🔧 Service Configuration

### Clerk Setup
1. Create Clerk application
2. Configure OAuth providers (Google recommended)
3. Set up billing products
4. Add webhook endpoints for user events

### Inngest Setup
1. Create Inngest account
2. Deploy functions: `npx inngest deploy`
3. Configure event triggers

### E2B Setup
1. Create E2B account
2. Build custom template: `e2b template build --name miniai-swe`
3. Configure sandbox settings

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t miniai-swe .
docker run -p 3000:3000 miniai-swe
```

## 🔍 Monitoring

- Check Inngest dashboard for background jobs
- Monitor E2B sandbox usage
- Track Clerk authentication metrics
- Database query performance via Prisma

## 🎯 Post-Deployment Checklist

- [ ] Test user registration/login
- [ ] Verify AI model generation
- [ ] Check sandbox creation
- [ ] Test live preview URLs
- [ ] Validate webhook endpoints
- [ ] Monitor error logs
- [ ] Performance testing