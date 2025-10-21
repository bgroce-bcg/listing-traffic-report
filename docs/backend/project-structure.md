# Backend Infrastructure

## Supabase Project Details

**Project Name:** Real Estate Traffic Report
**Project ID:** wuoxgzglvnhoxrgaukft
**Region:** us-east-2
**Database Version:** PostgreSQL 17.6.1.009
**Organization:** BCG Ventures

## Client Configuration

### Client-Side Client (`/lib/supabase/client.ts`)
- Use in Client Components (components with 'use client')
- Automatically handles session management via browser cookies
- Import: `import { createClient } from '@/lib/supabase/client'`

### Server-Side Client (`/lib/supabase/server.ts`)
- Use in Server Components, Server Actions, and Route Handlers
- Two functions available:
  - `createClient()` - Standard client with RLS enabled (use this by default)
  - `createAdminClient()` - Admin client that bypasses RLS (use with caution)
- Import: `import { createClient } from '@/lib/supabase/server'`

### Middleware (`/middleware.ts`)
- Automatically refreshes user sessions
- Runs on all routes except static assets
- Can be extended to protect routes (see commented code in `/lib/supabase/middleware.ts`)

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wuoxgzglvnhoxrgaukft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key] # Only for admin operations
```

## Testing Connection

Visit `/api/test-connection` or call the `testConnection()` function from `/lib/supabase/test-connection.ts`

## Important Notes

1. Always use RLS policies on all tables unless explicitly public
2. The `createAdminClient()` bypasses RLS - only use for admin operations
3. Middleware automatically refreshes sessions - no manual token refresh needed
4. Next.js 15 requires `await cookies()` - already implemented in server client
5. All client utilities use `@supabase/ssr` for proper session handling

## Authentication Implementation (Sprint 004 - Completed)

### Auth Context (`/contexts/auth-context.tsx`)
- Global auth state management using React Context
- Provides: `user`, `session`, `isLoading`, `signIn`, `signUp`, `signOut`, `resetPassword`
- Automatically listens for auth state changes via `onAuthStateChange`
- Sessions persist across page refreshes

### Protected Routes (`/components/auth/protected-route.tsx`)
- Wrapper component for pages requiring authentication
- Shows loading state while checking auth
- Redirects to `/auth/login` if not authenticated

### User Navigation (`/components/auth/user-nav.tsx`)
- Dropdown menu with user info and sign out button
- Displays user's full name and email
- Used in dashboard header

### Auth Pages
- **Login** (`/app/auth/login/page.tsx`): Sign in with email/password
- **Signup** (`/app/auth/signup/page.tsx`): Create account with email, password, and full name
- **Reset Password** (`/app/auth/reset-password/page.tsx`): Send password reset email
- **Dashboard** (`/app/dashboard/page.tsx`): Protected route example

### Usage Example
```tsx
// Protect a page
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  )
}

// Use auth in a component
import { useAuth } from '@/contexts/auth-context'

export function MyComponent() {
  const { user, signOut } = useAuth()
  // ...
}
```

## Database Schema (Updated - Sprint 006)

### Core Tables

#### listings
Primary table storing simplified listing information.

**Columns:**
- `id` (uuid, PK): Unique identifier
- `user_id` (uuid, FK to auth.users): Owner of the listing
- `name` (text): Simple, user-friendly name for the listing
- `realtor_url` (text, nullable): URL to Realtor.com listing
- `har_url` (text, nullable): URL to HAR.com listing
- `zillow_url` (text, nullable): URL to Zillow listing
- `har_desktop_views` (integer, nullable): Latest HAR desktop view count snapshot
- `har_mobile_views` (integer, nullable): Latest HAR mobile view count snapshot
- `har_photo_views` (integer, nullable): Latest HAR photo gallery view count snapshot
- `har_days_on_market` (integer, nullable): Latest HAR days on market snapshot
- `har_status` (text, nullable): Latest HAR status snapshot (e.g. Active, Pending)
- `is_active` (boolean, default true): Whether the listing is currently active
- `created_at`, `updated_at`, `deleted_at` (timestamptz): Timestamps

**Indexes:**
- `idx_listings_user_id` on user_id
- `idx_listings_is_active` on is_active (excluding soft-deleted)

**Constraints:**
- URL format validation for all URL columns (must start with http:// or https://)

**Features:**
- Soft delete via `deleted_at` column
- Automatic `updated_at` timestamp trigger
- RLS policies ensure users only see their own listings
- Simplified structure focusing only on essential listing information

#### facebook_urls
Stores multiple Facebook post URLs for each listing.

**Columns:**
- `id` (uuid, PK): Unique identifier
- `listing_id` (uuid, FK to listings): Associated listing
- `facebook_url` (text): URL to Facebook post
- `created_at` (timestamptz): Creation timestamp

**Constraints:**
- URL format validation (must be a valid Facebook URL)
- URL cannot be empty
- Cascading delete when listing is deleted

**Indexes:**
- `idx_facebook_urls_listing_id` on listing_id
- `idx_facebook_urls_created_at` on created_at DESC

**Features:**
- Allows multiple Facebook URLs per listing
- Each URL can be tracked separately in analytics
- RLS policies ensure users only see URLs for their own listings

#### analytics
Stores daily analytics metrics for listings and Facebook posts.

**Columns:**
- `id` (uuid, PK): Unique identifier
- `listing_id` (uuid, FK to listings): Associated listing
- `facebook_url_id` (uuid, FK to facebook_urls, nullable): Links to specific Facebook post
- `metric_date` (date): Date these metrics were recorded for
- `views` (integer, default 0): Number of views
- `clicks` (integer, default 0): Number of clicks
- `created_at`, `updated_at` (timestamptz): Timestamps

**Constraints:**
- Views and clicks must be non-negative
- Unique constraint on (listing_id, facebook_url_id, metric_date)
- Cascading delete when listing is deleted
- SET NULL when facebook_url is deleted

**Indexes:**
- `idx_analytics_listing_id` on listing_id
- `idx_analytics_facebook_url_id` on facebook_url_id
- `idx_analytics_metric_date` on metric_date DESC
- `idx_analytics_listing_date` composite index on (listing_id, metric_date DESC)

**Features:**
- Tracks daily metrics for listings
- Can optionally link to specific Facebook posts
- Allows general listing analytics when facebook_url_id is NULL
- Automatic `updated_at` timestamp trigger
- RLS policies ensure users only see analytics for their own listings

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Users can only SELECT their own data (via user_id in listings table)
- Users can only INSERT/UPDATE/DELETE their own data
- Related tables (facebook_urls, analytics) inherit permissions via JOIN with listings table
- Soft-deleted listings are excluded from SELECT queries
- Each table has separate policies for SELECT, INSERT, UPDATE, and DELETE operations

### Database Types

TypeScript types are auto-generated and available at `/lib/supabase/database.types.ts`.

**Usage Examples:**
```typescript
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

// Type helpers
type Listing = Database['public']['Tables']['listings']['Row']
type ListingInsert = Database['public']['Tables']['listings']['Insert']
type ListingUpdate = Database['public']['Tables']['listings']['Update']

type FacebookUrl = Database['public']['Tables']['facebook_urls']['Row']
type Analytics = Database['public']['Tables']['analytics']['Row']

// Type-safe queries - Get active listings
const supabase = createClient()
const { data: listings } = await supabase
  .from('listings')
  .select('*')
  .eq('is_active', true)

// Get listing with Facebook URLs
const { data } = await supabase
  .from('listings')
  .select(`
    *,
    facebook_urls (*)
  `)
  .eq('id', listingId)

// Get analytics with Facebook URL details
const { data: analytics } = await supabase
  .from('analytics')
  .select(`
    *,
    listing:listings (*),
    facebook_url:facebook_urls (*)
  `)
  .eq('listing_id', listingId)
  .order('metric_date', { ascending: false })
```

### Migrations Applied

1. **Initial Schema (Sprint 005):**
   - `create_listings_table` - Core listings table with constraints
   - `create_listing_urls_table` - URL tracking table (DEPRECATED)
   - `create_manual_metrics_table` - Manual metrics table (DEPRECATED)
   - `enable_rls_and_create_policies` - RLS policies for all tables
   - `create_updated_at_triggers` - Automatic timestamp updates

2. **Schema Simplification (Sprint 006):**
   - `20250610000000_simplify_schema.sql` - Complete schema refactor:
     - Dropped `listing_urls` and `manual_metrics` tables
     - Simplified `listings` table structure
     - Created `facebook_urls` table for multiple Facebook post URLs
     - Created `analytics` table for unified metrics tracking
     - Updated all RLS policies
     - Added URL validation constraints

### Migration Instructions

To apply the schema simplification migration:

1. **Using Supabase Dashboard:**
   - Navigate to SQL Editor in Supabase Dashboard
   - Copy contents of `/supabase/migrations/20250610000000_simplify_schema.sql`
   - Execute the SQL script
   - Verify tables are created correctly in Table Editor

2. **Using Supabase CLI:**
   ```bash
   # Link to your project (if not already linked)
   npx supabase link --project-ref wuoxgzglvnhoxrgaukft

   # Apply migration
   npx supabase db push
   ```

3. **Verify Migration:**
   - Check that `listings` table has new columns: `name`, `realtor_url`, `har_url`, `zillow_url`, `is_active`
   - Verify `facebook_urls` table exists with proper relationships
   - Verify `analytics` table exists with proper relationships
   - Test RLS policies by querying as a regular user

## Important Notes - Sprint 006 Schema Simplification

**Key Changes:**
- Schema simplified from 5+ columns in listings to just: name, URLs, is_active
- `facebook_urls` table allows multiple FB post tracking per listing
- `analytics` table replaces `manual_metrics` with views/clicks instead of calls/showings/inquiries
- All URL fields moved directly into respective tables (no separate junction table)
- RLS policies use EXISTS subqueries for related table access control
- Migration file: `/supabase/migrations/20250610000000_simplify_schema.sql`

**Critical:** This is a breaking change - old `listing_urls` and `manual_metrics` tables are dropped with data loss.


# Supabase Setup Instructions

## Quick Start

1. **Add environment variables to `.env.local`:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wuoxgzglvnhoxrgaukft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1b3hnemdsdm5ob3hyZ2F1a2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzg0NjksImV4cCI6MjA3NDc1NDQ2OX0.RTRso99irYXPaab9ROjhdbMyh13nhCTq9WGcKdTaJqs
```

2. **Test the connection:**

```bash
npm run dev
```

Then visit: http://localhost:3000/api/test-connection

You should see:
```json
{
  "success": true,
  "message": "Connection successful!",
  "details": { ... }
}
```

## Usage Examples

### Client Component (Browser)

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [data, setData] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('listings').select('*')
      setData(data)
    }
    fetchData()
  }, [])

  return <div>{/* render data */}</div>
}
```

### Server Component

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()
  const { data } = await supabase.from('listings').select('*')

  return <div>{/* render data */}</div>
}
```

### Server Action

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createListing(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .insert({
      title: formData.get('title'),
      // ... other fields
    })

  if (error) throw error
  return data
}
```

### API Route

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('listings').select('*')

  return NextResponse.json(data)
}
```

## Authentication Example

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## Important Notes

- Always use `await createClient()` in Server Components/Actions
- Client Components can directly call `createClient()` without await
- Middleware automatically refreshes sessions - no manual refresh needed
- RLS policies will be enforced - set them up before querying data
- Use `createAdminClient()` only for operations that need to bypass RLS

## Troubleshooting

**Error: "supabaseUrl is required"**
- Make sure `.env.local` exists and contains the environment variables
- Restart your Next.js dev server after adding environment variables

**Error: "Invalid API key"**
- Verify the `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check that there are no extra spaces or line breaks in the key

**Connection test fails**
- Verify environment variables are set correctly
- Check that the Supabase project is active (not paused)
- Ensure you have internet connectivity

## Next Steps

1. Set up authentication (Sprint 003)
2. Create database schema (Sprint 005)
3. Add RLS policies (Sprint 005)
4. Generate TypeScript types from your schema