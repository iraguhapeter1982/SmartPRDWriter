# Family Command Center

## Overview

Family Command Center is a real-time family coordination platform designed for parents with school-age children (5-12). The application unifies Google Calendar events, manages shared grocery lists and chores, and aggregates school messages into a single glanceable dashboard. Built with a focus on reducing coordination friction for busy families, it provides visual family calendars with member color-coding, real-time sync for lists and chores, and a centralized school communication hub.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router.

**UI Component Library**: Shadcn UI (New York style) with Radix UI primitives for accessible, composable components. Tailwind CSS for styling with custom design tokens following a hybrid design system (Linear + Notion + Apple HIG principles).

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. Local state handled with React hooks.

**Design System**: Custom color palette optimized for family-friendly warmth and glanceability:
- Light/dark mode support with HSL-based theming
- Member color coding (5 distinct colors for family member identification)
- Purposeful animations only for state changes (hover-elevate, active-elevate patterns)
- Focus on visual hierarchy and quick scanning

### Backend Architecture

**Server Framework**: Express.js with TypeScript running in ESM mode.

**Database ORM**: Drizzle ORM configured for PostgreSQL with the Neon serverless driver.

**Authentication**: Supabase Auth for user management and session handling. The backend uses a custom `requireAuth` middleware that validates Supabase JWT tokens from the Authorization header and attaches `userId` to requests.

**API Design**: RESTful endpoints under `/api` namespace with JSON request/response. Authentication tokens passed via Bearer tokens in headers.

**Multi-tenancy**: Family-scoped data isolation using `family_id` foreign keys. Users can belong to multiple families with role-based access (owner/member).

### Data Storage

**Primary Database**: PostgreSQL via Neon serverless connection pool.

**Schema Structure**:
- `families` - Core family entities with creator tracking
- `family_members` - Junction table for family membership with roles
- `family_invites` - Token-based invitation system with expiration

**Migration Strategy**: Drizzle Kit for schema migrations, push-based deployment to keep database in sync with TypeScript schema definitions.

### Authentication & Authorization

**Authentication Provider**: Supabase with both admin (server-side) and client-side SDK integration.

**Session Management**: JWT-based sessions managed by Supabase, validated on the backend via `supabaseAdmin.auth.getUser()`.

**Authorization Model**: Role-based access control at the family level (owner vs member). Protected routes on frontend using `ProtectedRoute` component and `useAuth` context. Backend endpoints protected with `requireAuth` middleware.

**Invite System**: Token-based family invitations stored in database with expiration timestamps. Supports accepting invites before or after user signup.

### External Dependencies

**Supabase**: Primary authentication and user management service. Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for client, `SUPABASE_SERVICE_ROLE_KEY` for server admin operations.

**Neon Database**: PostgreSQL database provider. Requires `DATABASE_URL` environment variable for connection string.

**Google Calendar API**: Planned integration for importing family calendar events (OAuth flow to be implemented).

**Stripe**: Payment processing for premium features. Client-side integration with `@stripe/stripe-js` and `@stripe/react-stripe-js`.

**Email Service**: Planned integration for school message ingestion via forwarded emails.

**Font Resources**: Google Fonts (Inter for UI, JetBrains Mono for code/monospace needs).