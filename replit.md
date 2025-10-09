# Family Command Center

## Overview

The Family Command Center is a real-time family coordination platform designed for parents with school-age children (5-12 years old). It unifies Google Calendar events, manages shared lists and chores, and aggregates school messages into a single glanceable dashboard. The application is built as a multi-tenant SaaS product with family-level isolation and Stripe-based premium subscriptions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens following a hybrid design system (Linear + Notion + Apple HIG)
- **State Management**: TanStack Query (React Query) for server state and caching
- **Forms**: React Hook Form with Zod validation

**Design Philosophy**: 
- Glanceability-first with optimized information hierarchy for busy parents
- Calm clarity with minimal distractions and purposeful animations
- Family-friendly warmth with color-coded family members (purple, orange, teal-green, pink, yellow-gold)
- Real-time confidence with sync state indicators

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with protected routes using middleware
- **Session Management**: Supabase Auth token-based authentication
- **Real-time Updates**: Polling-based with TanStack Query automatic refetching

**Key Architectural Decisions**:
- Single-tenant data isolation via `familyId` scoping on all family-related queries
- Middleware-based auth with JWT token verification on protected routes
- Separation of concerns: auth logic, storage abstraction, route handlers

### Database & Schema Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon serverless PostgreSQL (configured via DATABASE_URL)
- **Schema Pattern**: Multi-tenant with family-level isolation

**Core Tables**:
- `families` - Family groups with invite codes
- `users` - Parent accounts (id synchronized with Supabase auth.users)
- `family_members` - Children and adult personas with color coding
- `events` - Calendar events from Google Calendar
- `lists` & `list_items` - Shared shopping/todo lists
- `chores` & `chore_completions` - Gamified chore system with points
- `messages` - Aggregated school messages
- `calendar_connections` - OAuth tokens for Google Calendar
- `subscriptions` - Stripe subscription tracking

**Data Flow**:
- All family data queries include `familyId` filter for tenant isolation
- User profile created after Supabase signup, then linked to family
- Calendar events synced one-way from Google (no write-back in MVP)

### Authentication & Authorization
- **Primary Auth**: Supabase Authentication for user management
- **Token Flow**: JWT tokens passed via Authorization header on all protected requests
- **Middleware**: `requireAuth` middleware verifies tokens and attaches user to request
- **Session**: Token stored client-side and retrieved from Supabase session

**User Journey**:
1. Sign up via Supabase → Create user profile
2. Onboarding → Create or join family via invite code
3. Access control → All routes check `user.familyId` exists

### External Dependencies

**Third-Party Services**:
- **Supabase**: Authentication provider (auth.users, JWT tokens)
- **Google Calendar API**: OAuth-based calendar event import (one-way sync)
- **Stripe**: Subscription billing with webhook integration for payment events
- **Neon Database**: Serverless PostgreSQL hosting

**Key Integrations**:
- Google Calendar Connector (Replit Connector service) for OAuth flow and token management
- Stripe webhook endpoint (`/api/webhooks/stripe`) with raw body parsing for signature verification
- Email forwarding system for school message ingestion (webhook-based)

**External Libraries**:
- `@supabase/supabase-js` - Supabase client SDK
- `stripe` - Stripe server SDK for payment processing
- `googleapis` - Google Calendar API client
- `@neondatabase/serverless` - Neon PostgreSQL driver with WebSocket support

**Environment Requirements**:
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` - Supabase project credentials
- `DATABASE_URL` - Neon PostgreSQL connection string
- `STRIPE_SECRET_KEY` & `STRIPE_PRICE_ID` - Stripe payment configuration
- `REPLIT_CONNECTORS_HOSTNAME` - Replit connector service endpoint
- `REPL_IDENTITY` or `WEB_REPL_RENEWAL` - Replit authentication tokens