Always try to use your agents when you can

# Project Documentation Map

## High-Level Overview
- **App Overview & Features**: `/docs/project-overview.md`
- **Backend Infrastructure**: `/docs/backend/project-structure.md`

## Quick Reference

### Project Info
- **Tech Stack**: React, Next.js 15, shadcn/ui, Supabase (PostgreSQL)
- **Supabase Project ID**: wuoxgzglvnhoxrgaukft
- **Region**: us-east-2

### Database
- **Schema Details**: `/docs/backend/project-structure.md` (lines 96-232)
- **Tables**: listings, facebook_urls, analytics
- **Type Definitions**: `/lib/supabase/database.types.ts`
- **Migrations**: `/supabase/migrations/`

### Authentication
- **Auth Setup**: `/docs/backend/project-structure.md` (lines 50-94)
- **Auth Context**: `/contexts/auth-context.tsx`
- **Protected Routes**: `/components/auth/protected-route.tsx`
- **Auth Pages**: `/app/auth/`

### Supabase Clients
- **Client-Side**: `/lib/supabase/client.ts` (use in 'use client' components)
- **Server-Side**: `/lib/supabase/server.ts` (use in Server Components/Actions)
- **Middleware**: `/middleware.ts` (auto session refresh)

### Key Features
- **Listings Management**: Create/edit/delete listings with URLs
- **Facebook URL Tracking**: Multiple FB posts per listing
- **Analytics**: Daily metrics (views/clicks) per listing/FB post
- **Data Collection**: External API integration for scraping
- **PDF Reports**: Generate formatted reports per listing