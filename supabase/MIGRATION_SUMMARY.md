# Database Schema Simplification - Migration Summary

## Overview

Successfully created a comprehensive database migration to simplify the Listing Traffic Report schema. This migration streamlines the data structure and makes it more intuitive for tracking real estate listing analytics.

## Files Created

### 1. Migration SQL File
**Location:** `/home/blgroce/web-apps/listing-traffic-report/supabase/migrations/20250610000000_simplify_schema.sql`

**Size:** 8.5 KB

**Contents:**
- Drops deprecated `listing_urls` and `manual_metrics` tables
- Modifies `listings` table to simplified structure
- Creates new `facebook_urls` table
- Creates new `analytics` table
- Implements comprehensive RLS policies
- Adds URL validation constraints
- Creates necessary indexes for performance

### 2. Updated Database Types
**Location:** `/home/blgroce/web-apps/listing-traffic-report/lib/supabase/database.types.ts`

**Changes:**
- Removed types for `listing_urls` and `manual_metrics` tables
- Added types for `listings` table with new simplified structure
- Added types for `facebook_urls` table
- Added types for `analytics` table
- All relationships properly defined

### 3. Updated Documentation
**Location:** `/home/blgroce/web-apps/listing-traffic-report/docs/backend/backend-infrastructure.md`

**Updates:**
- Complete schema documentation for all three tables
- Updated RLS policy descriptions
- Added usage examples with new table structure
- Migration history with deprecation notes
- Step-by-step migration instructions

### 4. Migration Guide
**Location:** `/home/blgroce/web-apps/listing-traffic-report/supabase/migrations/README.md`

**Contents:**
- Comprehensive migration instructions
- Multiple application methods (Dashboard, CLI, Direct)
- Verification procedures
- Rollback instructions
- Troubleshooting guide

## Schema Changes Summary

### Listings Table
**Before:**
- Complex structure with address, city, state, zip_code
- listing_price, listing_status, list_date, sold_date
- Required separate table for URLs

**After:**
- Simplified to: `id`, `user_id`, `name`, `realtor_url`, `har_url`, `zillow_url`, `is_active`
- URLs integrated directly into listings table
- Focus on essential tracking information
- Soft delete still supported via `deleted_at`

### Facebook URLs Table (NEW)
- Supports multiple Facebook post URLs per listing
- Simple structure: `id`, `listing_id`, `facebook_url`, `created_at`
- Each URL can be tracked independently in analytics
- Cascading delete when listing is removed

### Analytics Table (NEW)
- Replaces `manual_metrics` with more flexible structure
- Tracks: `views`, `clicks` (instead of phone_calls, showings, inquiries)
- Can link to specific Facebook posts via `facebook_url_id`
- Supports general listing analytics when `facebook_url_id` is NULL
- Unique constraint prevents duplicate entries per listing/date/FB URL combination

## RLS Policies Implemented

All tables have comprehensive Row Level Security:

### Listings Table
- `listings_select_own` - Users can only view their own active listings
- `listings_insert_own` - Users can only create listings for themselves
- `listings_update_own` - Users can only update their own listings
- `listings_delete_own` - Users can only delete their own listings

### Facebook URLs Table
- `facebook_urls_select_own` - Users can only view URLs for their listings
- `facebook_urls_insert_own` - Users can only add URLs to their listings
- `facebook_urls_update_own` - Users can only update their own URLs
- `facebook_urls_delete_own` - Users can only delete their own URLs

### Analytics Table
- `analytics_select_own` - Users can only view analytics for their listings
- `analytics_insert_own` - Users can only add analytics for their listings
- `analytics_update_own` - Users can only update their own analytics
- `analytics_delete_own` - Users can only delete their own analytics

All related table policies use `EXISTS` subqueries to verify ownership through the `listings` table.

## Indexes Created

### Performance Optimizations

**Listings:**
- `idx_listings_user_id` - Fast user-based queries
- `idx_listings_is_active` - Fast filtering of active listings

**Facebook URLs:**
- `idx_facebook_urls_listing_id` - Fast listing lookups
- `idx_facebook_urls_created_at` - Chronological sorting

**Analytics:**
- `idx_analytics_listing_id` - Fast listing-based queries
- `idx_analytics_facebook_url_id` - Fast FB URL lookups
- `idx_analytics_metric_date` - Fast date-based queries
- `idx_analytics_listing_date` - Composite index for listing + date queries

## Data Validation

### URL Constraints
- All URL fields validate format (must start with `http://` or `https://`)
- Facebook URLs specifically validated to match Facebook domain patterns
- URLs cannot be empty strings (null is allowed)

### Metric Constraints
- `views` and `clicks` must be non-negative integers
- Both default to 0 if not specified

### Uniqueness Constraints
- Analytics: unique combination of (listing_id, facebook_url_id, metric_date)
- Prevents duplicate metric entries for the same listing/date/FB post

## Migration Instructions

### Quick Start (Supabase Dashboard)

1. Login to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `/supabase/migrations/20250610000000_simplify_schema.sql`
4. Execute the SQL
5. Verify in Table Editor

### Using Supabase CLI

```bash
# Link project (if not already)
npx supabase link --project-ref wuoxgzglvnhoxrgaukft

# Apply migration
npx supabase db push

# Verify
npx supabase migration list
```

## Important Notes

### Data Loss Warning
⚠️ **This migration will permanently delete:**
- All data in `listing_urls` table
- All data in `manual_metrics` table
- The following columns from `listings`: address, city, state, zip_code, listing_price, listing_status, list_date, sold_date, notes

**Backup your database before running this migration if you need to preserve any of this data.**

### Breaking Changes
- Old table names no longer valid (`listing_urls`, `manual_metrics`)
- `listings` table structure significantly changed
- API endpoints querying old tables will need updates
- Type definitions updated - may cause TypeScript errors in existing code

### Migration is Idempotent
- Uses `IF EXISTS` and `IF NOT EXISTS` clauses
- Safe to run multiple times
- Will not error if already applied (though data drops cannot be undone)

## Verification Checklist

After applying the migration, verify:

- [ ] Old tables removed (`listing_urls`, `manual_metrics`)
- [ ] New `listings` columns exist (name, realtor_url, har_url, zillow_url, is_active)
- [ ] `facebook_urls` table created with foreign key to listings
- [ ] `analytics` table created with foreign keys to listings and facebook_urls
- [ ] RLS enabled on all tables
- [ ] All RLS policies created (4 per table = 12 total)
- [ ] Indexes created on all appropriate columns
- [ ] URL validation constraints working
- [ ] Can create, read, update, delete test data as authenticated user
- [ ] Cannot access other users' data

## Next Steps

1. **Apply the Migration:**
   - Choose your preferred method (Dashboard or CLI)
   - Follow instructions in `/supabase/migrations/README.md`

2. **Update Application Code:**
   - Import new types from `/lib/supabase/database.types.ts`
   - Update queries to use new table structure
   - Test all listing-related features

3. **Test RLS Policies:**
   - Create test data as different users
   - Verify data isolation between users
   - Test all CRUD operations

4. **Monitor Performance:**
   - Check query execution times
   - Verify indexes are being used
   - Optimize queries if needed

## Support

- **Migration Guide:** `/supabase/migrations/README.md`
- **Schema Documentation:** `/docs/backend/backend-infrastructure.md`
- **Database Types:** `/lib/supabase/database.types.ts`

## Migration Status

- [x] SQL migration file created
- [x] Database types updated
- [x] Documentation updated
- [x] Migration instructions created
- [ ] Migration applied to database (pending)
- [ ] Application code updated (pending)
- [ ] Testing completed (pending)

---

**Created:** 2025-10-02
**Migration File:** 20250610000000_simplify_schema.sql
**Project:** Listing Traffic Report
**Supabase Project ID:** wuoxgzglvnhoxrgaukft
