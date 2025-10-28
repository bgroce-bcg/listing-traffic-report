# Facebook Posts - Simplified Model

## Overview

This feature provides a simplified way to track Facebook post traffic using a straightforward URL + Views model. Unlike the previous complex facebook_urls + facebook_metrics system, this approach focuses on ease of use with minimal validation.

## Implementation Date

October 28, 2025

## Feature Description

Users can now add Facebook posts to a listing with just two fields:
- **URL**: Simple text field (no URL validation required - accepts any text)
- **Views**: Number field for tracking view count

The system supports:
- Adding new Facebook posts with URL and view count
- Editing existing posts (both URL and views)
- Deleting posts
- Viewing total views across all Facebook posts for a listing

## Database Schema

### Table: `facebook_posts`

```sql
CREATE TABLE facebook_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT facebook_posts_views_non_negative CHECK (views >= 0),
  CONSTRAINT facebook_posts_url_not_empty CHECK (length(trim(url)) > 0)
);
```

**Key Points:**
- URL field accepts any text (no strict URL validation)
- Views must be non-negative
- Automatic created_at and updated_at timestamps
- RLS policies ensure users only see their own listings' posts

## Files Created/Modified

### Section 1: Simplify Facebook Posts Data Model

#### New Files
1. `/supabase/migrations/20251028000000_create_facebook_posts_table.sql`
   - Database migration creating facebook_posts table
   - Includes RLS policies and indexes

2. `/lib/supabase/facebook-posts.ts`
   - Server-side helper functions for CRUD operations
   - Exports: getFacebookPosts, addFacebookPost, updateFacebookPost, deleteFacebookPost, getFacebookPostsTotalViews

3. `/components/listings/facebook-posts-manager.tsx`
   - Client component for managing Facebook posts
   - Features: Add, edit, delete posts with dialogs
   - Displays total views across all posts
   - Shows individual post URLs and view counts

#### Modified Files
1. `/lib/supabase/database.types.ts`
   - Auto-generated TypeScript types updated with facebook_posts table

2. `/app/listings/[id]/page.tsx`
   - Added FacebookPostsManager component
   - Added state management for facebookPosts
   - Added handler functions for add/update/delete operations
   - Legacy FacebookUrlsManager still present for backward compatibility

### Section 2: Update Print Report with Facebook Posts Table

#### Modified Files
1. `/app/reports/[listingId]/print/page.tsx`
   - Added facebook_posts data fetching in getListingData()
   - Added facebookPostsViews field to MetricsSummary interface
   - Added facebookPosts array to MetricsSummary interface
   - Updated calculateMetrics() to include Facebook post views in total calculations
   - Added new Facebook Posts Performance section with table layout showing:
     - Post number, URL, and views for each post
     - Total Facebook views at bottom of table
   - Maintained backward compatibility with legacy facebook_metrics display

## Usage

### Adding a Facebook Post

1. Navigate to a listing detail page
2. Scroll to "Facebook Posts" section
3. Click "Add Facebook Post" button
4. Enter URL (any text) and Views count
5. Click "Add Post"

### Editing a Facebook Post

1. Find the post in the Facebook Posts list
2. Click the edit icon (pencil)
3. Modify URL or Views
4. Click "Update Post"

### Viewing Total Views

The total views across all Facebook posts are displayed at the top of the Facebook Posts section.

## API Reference

### Server Functions

All functions are in `/lib/supabase/facebook-posts.ts`:

```typescript
// Get all posts for a listing
await getFacebookPosts(listingId: string): Promise<FacebookPost[]>

// Add a new post
await addFacebookPost(listingId: string, url: string, views: number = 0): Promise<FacebookPost>

// Update a post
await updateFacebookPost(id: string, updates: { url?: string; views?: number }): Promise<FacebookPost>

// Delete a post
await deleteFacebookPost(id: string): Promise<void>

// Get total views
await getFacebookPostsTotalViews(listingId: string): Promise<number>
```

## Migration Notes

### Relationship to Legacy Tables

This implementation creates a NEW table (`facebook_posts`) that coexists with the existing:
- `facebook_urls` table
- `facebook_metrics` table

**Why both systems exist:**
- Backward compatibility - existing data is preserved
- Gradual migration - users can transition at their own pace
- The old system can be deprecated in a future release

### Future Considerations

To fully migrate from the old system to the new simplified system:
1. Create a data migration script to convert facebook_urls + facebook_metrics → facebook_posts
2. Update print reports and PDFs to use facebook_posts data
3. Remove FacebookUrlsManager component from listing page
4. Drop the old facebook_urls and facebook_metrics tables

## Technical Decisions

### No URL Validation
- **Decision**: Accept any text in the URL field without validation
- **Rationale**: Maximum simplicity and flexibility for users
- **Trade-off**: Users could enter invalid URLs, but this prioritizes ease of use

### Single Views Field
- **Decision**: Track only "views" instead of impressions, reach, reactions, etc.
- **Rationale**: Simplifies data entry and reduces cognitive load
- **Trade-off**: Less granular metrics, but aligns with user feedback for simplicity

### Editable Views
- **Decision**: Allow users to edit view counts after creation
- **Rationale**: Users may need to update counts as they get new data
- **Implementation**: Edit button on each post opens dialog with current values

## Testing

### Manual Testing Performed
- ✅ Database migration applied successfully
- ✅ TypeScript types generated correctly
- ✅ Application builds without errors
- ✅ No type errors in new components
- ✅ Component integrates with listing page

### Test Scenarios
1. Add a Facebook post with URL and views
2. Edit the URL of an existing post
3. Edit the views count of an existing post
4. Delete a Facebook post
5. View total views calculation
6. Verify RLS policies (posts only visible to owner)

## Known Issues

None at this time.

## Implementation Status

### Completed
- ✅ **Section 1**: Simplify Facebook Posts Data Model (October 28, 2025)
  - Created facebook_posts table with simple URL + Views model
  - Built FacebookPostsManager component for data entry
  - Integrated with listing detail page

- ✅ **Section 2**: Update Print Report with Facebook Posts Table (October 28, 2025)
  - Added Facebook posts table display to print report
  - Included Facebook post views in total traffic calculations
  - Maintained backward compatibility with legacy system

### Next Steps

1. Consider deprecating the old facebook_urls + facebook_metrics system
2. Create migration script for existing data (if needed)
3. Update PDF generation to match print report (if separate implementation exists)
