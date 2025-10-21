# Database Migration Guide

## Overview

This directory contains SQL migration files for the Listing Traffic Report database schema. The migrations handle schema changes, data transformations, and policy updates.

## Migration Files

### `20250610000000_simplify_schema.sql`

**Purpose:** Simplifies the database schema by consolidating tables and creating a more streamlined structure for tracking listing analytics.

**Changes:**
- Drops deprecated `listing_urls` and `manual_metrics` tables
- Simplifies `listings` table to focus on essential information
- Creates `facebook_urls` table for multiple Facebook post tracking
- Creates `analytics` table for unified metrics
- Updates all RLS policies
- Adds URL validation constraints

**⚠️ WARNING:** This migration will delete all existing data in the `listing_urls` and `manual_metrics` tables. Ensure you have backed up any important data before running.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for Production)

1. **Login to Supabase Dashboard:**
   - Navigate to https://supabase.com/dashboard
   - Select your project: "Real Estate Traffic Report"

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Execute Migration:**
   - Open `/supabase/migrations/20250610000000_simplify_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify Success:**
   - Check the execution results for any errors
   - Navigate to "Table Editor" to verify new tables exist
   - Check that old tables (`listing_urls`, `manual_metrics`) are gone

### Option 2: Supabase CLI (Recommended for Development)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Link to Your Project:**
   ```bash
   npx supabase link --project-ref wuoxgzglvnhoxrgaukft
   ```

   You'll be prompted for your database password.

3. **Apply Migration:**
   ```bash
   npx supabase db push
   ```

   This will apply all migrations in the `/supabase/migrations` directory that haven't been applied yet.

4. **Verify Migration:**
   ```bash
   # Check migration history
   npx supabase migration list

   # Inspect tables
   npx supabase db diff
   ```

### Option 3: Direct Database Connection (Advanced)

If you have direct database access:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.wuoxgzglvnhoxrgaukft.supabase.co:5432/postgres" \
  -f supabase/migrations/20250610000000_simplify_schema.sql
```

## Verification Steps

After applying the migration, verify the following:

### 1. Check Table Structure

```sql
-- Verify listings table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Should include: id, user_id, name, realtor_url, har_url, zillow_url,
-- is_active, created_at, updated_at, deleted_at

-- Verify facebook_urls table exists
SELECT * FROM facebook_urls LIMIT 0;

-- Verify analytics table exists
SELECT * FROM analytics LIMIT 0;
```

### 2. Test RLS Policies

```sql
-- Check that RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('listings', 'facebook_urls', 'analytics');

-- List all policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Test Data Operations

Create a test listing to verify everything works:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Create a listing
const { data: listing, error: listingError } = await supabase
  .from('listings')
  .insert({
    name: 'Test Property',
    realtor_url: 'https://www.realtor.com/example',
    is_active: true
  })
  .select()
  .single()

// Add a Facebook URL
const { data: fbUrl, error: fbError } = await supabase
  .from('facebook_urls')
  .insert({
    listing_id: listing.id,
    facebook_url: 'https://www.facebook.com/example'
  })
  .select()
  .single()

// Add analytics
const { data: analytics, error: analyticsError } = await supabase
  .from('analytics')
  .insert({
    listing_id: listing.id,
    facebook_url_id: fbUrl.id,
    metric_date: '2025-06-10',
    views: 100,
    clicks: 10
  })
  .select()
  .single()

console.log('Test data created successfully!')
```

## Rollback Procedure

If you need to rollback this migration, you'll need to:

1. **Recreate Old Tables:**
   - Restore `listing_urls` table structure
   - Restore `manual_metrics` table structure
   - Restore old `listings` table columns

2. **Restore Data:**
   - Restore from backup (if available)
   - Manually recreate RLS policies for old tables

**Note:** Always backup your database before applying major migrations.

## Common Issues

### Issue: Permission Denied

**Solution:** Ensure you're connected as the `postgres` user or a user with sufficient privileges.

### Issue: Column Already Exists

**Solution:** The migration may have been partially applied. Check which steps completed and manually complete the remaining steps.

### Issue: Foreign Key Constraint Violation

**Solution:** Ensure all dependent data is cleaned up before dropping tables. The migration handles cascading deletes, but manual data cleanup may be needed if the migration was interrupted.

### Issue: RLS Policies Not Working

**Solution:**
1. Verify RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'table_name';`
3. Verify `auth.uid()` returns the correct user ID

## Next Steps

After successfully applying the migration:

1. **Update Application Code:**
   - Update any queries referencing old tables
   - Use the new `/lib/supabase/database.types.ts` for type safety
   - Test all listing-related features

2. **Update Documentation:**
   - Review updated schema in `/docs/backend/backend-infrastructure.md`
   - Update any API documentation

3. **Monitor Performance:**
   - Check query performance with new indexes
   - Monitor analytics data collection

## Support

For issues or questions:
- Check Supabase logs in the Dashboard
- Review RLS policies in the Authentication section
- Consult `/docs/backend/backend-infrastructure.md` for schema details
