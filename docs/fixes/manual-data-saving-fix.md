# Fix: Manual Data Saving Issues

## Date: 2025-10-28

## Problem Summary

When users attempted to add manual data from the `/listings/{id}` page:
1. **Duplicate key error** - "Failed to add platform metrics: duplicate key value violates unique constraint"
2. **Analytics not updating** - The "Analytics Summary" card showing 0 views and 0 clicks even after adding data

## Root Causes

### Issue 1: Duplicate Key Constraint
The `addPlatformMetrics` and `addFacebookMetrics` functions were using `insert()` which would fail if a record already existed for the same listing/platform/date combination. Users couldn't update existing metrics.

### Issue 2: Missing Data in Summary
The listing detail page was only pulling data from the `analytics` table, but manual data was being saved to `platform_metrics` and `facebook_metrics` tables. These are separate tables for different data sources.

## Solution

### 1. Changed Insert to Upsert

**Files Modified:**
- `lib/supabase/manual-data.ts`

**Changes:**
- Changed `insert()` to `upsert()` in `addPlatformMetrics()` function (lines 26-32)
- Changed `insert()` to `upsert()` in `addFacebookMetrics()` function (lines 118-124)
- Added `onConflict` parameter to handle unique constraint conflicts

**Result:** Users can now add metrics for the same date multiple times, and the system will update existing records instead of throwing an error.

### 2. Created Comprehensive Analytics Function

**Files Modified:**
- `lib/supabase/analytics.ts`

**Changes:**
- Added new function `getListingAnalyticsSummary()` (lines 55-117)
- This function pulls data from all three tables:
  - `analytics` (legacy data)
  - `platform_metrics` (Realtor.com, Zillow, HAR data)
  - `facebook_metrics` (Facebook engagement data)
- Returns aggregated totals for views and clicks

### 3. Updated Listing Detail Page

**Files Modified:**
- `app/listings/[id]/page.tsx`

**Changes:**
- Imported `getListingAnalyticsSummary` function (line 11)
- Added `analyticsSummary` state (line 27)
- Updated `loadData()` to fetch comprehensive summary (line 46)
- Changed summary calculations to use new data (lines 176-177)

**Result:** The Analytics Summary card now shows the correct totals from all data sources.

### 4. Improved User Experience

**Files Modified:**
- `components/listings/platform-metrics-form.tsx`
- `components/listings/facebook-metrics-form.tsx`

**Changes:**
- Updated dialog descriptions to inform users that existing data will be updated
- Changed success messages from "added" to "saved"
- Changed button label from "Add Platform Metrics" to "Log Platform Metrics"
- Changed submit button from "Add Metrics" to "Save Metrics"

## Data Flow

### Before Fix
```
User adds manual data → Saved to platform_metrics table
                       ↓
                   Analytics Summary card reads from analytics table
                       ↓
                   Shows 0 (no data in analytics table)
```

### After Fix
```
User adds manual data → Upserted to platform_metrics table
                       ↓
                   Analytics Summary card reads from:
                   - analytics table
                   - platform_metrics table
                   - facebook_metrics table
                       ↓
                   Shows correct totals from all sources
```

## Testing

To test the fix:

1. **Test Upsert Functionality:**
   - Add platform metrics for today's date
   - Add platform metrics for the same date again with different values
   - Verify: No duplicate key error, data is updated

2. **Test Analytics Summary:**
   - Add platform metrics (e.g., 100 views, 5 leads)
   - Add Facebook metrics (e.g., 500 impressions, 20 clicks)
   - Verify: Analytics Summary shows correct totals
   - Formula: `totalViews = analyticsViews + platformViews`
   - Formula: `totalClicks = analyticsClicks + platformLeads + facebookClicks`

3. **Test All Three Forms:**
   - HAR Data Form (updates listing table directly)
   - Platform Metrics Form (upserts to platform_metrics)
   - Facebook Metrics Form (upserts to facebook_metrics)

## Migration Notes

- No database migrations required
- All changes are backward compatible
- Existing data in all three tables is preserved
- The analytics summary function gracefully handles empty tables

## Future Improvements

Consider consolidating the three tables into a single unified metrics table with a `source` column to indicate data origin (analytics, platform, facebook). This would simplify queries and make the data model more maintainable.

However, the current approach works well because:
- Each table has different fields specific to its source
- RLS policies can be more granular
- Historical data is preserved in its original structure
