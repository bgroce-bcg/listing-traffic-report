# Manual Data Entry Feature

## Overview

This feature provides user-friendly forms for manually entering traffic data from HAR.com, Realtor.com, Zillow, and Facebook posts. This serves as a temporary solution for data collection until proper scraping and API integrations are implemented.

## Components Implemented

### 1. HAR Data Update Form
**Location:** `/components/listings/har-data-form.tsx`

Updates listing fields directly with HAR.com traffic snapshot data:
- Desktop views
- Mobile views
- Photo gallery views
- Days on market
- Listing status

**Usage:** Click "Update HAR Data" button in the Manual Data Entry section on listing detail page.

### 2. Platform Metrics Form
**Location:** `/components/listings/platform-metrics-form.tsx`

Adds daily traffic metrics from Realtor.com or Zillow to the `platform_metrics` table:
- Platform selection (Realtor.com or Zillow)
- Date
- Views, Saves, Shares, Leads

**Usage:** Click "Add Platform Metrics" button in the Manual Data Entry section.

### 3. Facebook URL Management
**Location:** `/components/listings/facebook-urls-manager.tsx` (pre-existing, reused)

Manages Facebook post URLs associated with a listing:
- Add Facebook post URL
- View all Facebook URLs
- Copy URL to clipboard
- Delete Facebook URL

**Usage:** Located in separate card below Manual Data Entry section.

### 4. Facebook Metrics Form
**Location:** `/components/listings/facebook-metrics-form.tsx`

Logs engagement metrics for specific Facebook posts to the `facebook_metrics` table:
- Facebook post selection (from existing URLs)
- Date
- Impressions, Reach, Reactions, Comments, Shares, Post Clicks

**Usage:** Click "Log FB Metrics" button in the Manual Data Entry section.

### 5. Manual Data Entry Container
**Location:** `/components/listings/manual-data-entry.tsx`

Organizes all manual data entry forms in a single card with clear sections and descriptions.

## Database Tables Used

### Tables Modified
- **listings**: HAR data fields updated directly (har_desktop_views, har_mobile_views, har_photo_views, har_days_on_market, har_status)

### Tables with New Records
- **platform_metrics**: Stores Realtor.com and Zillow metrics with dates
- **facebook_urls**: Stores Facebook post URLs (managed by pre-existing component)
- **facebook_metrics**: Stores Facebook post engagement metrics with dates

## Validation

All forms use Zod schemas for validation:
- **Location:** `/lib/validations/manual-data.ts`
- Schemas: `harDataSchema`, `platformMetricsSchema`, `facebookUrlSchema`, `facebookMetricsSchema`
- All numeric fields validated as non-negative integers
- Date fields required
- URLs validated for proper format and Facebook domain

## API Functions

Database operations handled by functions in `/lib/supabase/manual-data.ts`:
- `addPlatformMetrics()`: Add platform metrics record
- `getPlatformMetrics()`: Retrieve platform metrics for a listing
- `updatePlatformMetrics()`: Update existing platform metrics
- `deletePlatformMetrics()`: Delete platform metrics record
- `addFacebookMetrics()`: Add Facebook metrics record
- `getFacebookMetrics()`: Retrieve Facebook metrics for a post
- `getListingFacebookMetrics()`: Get all Facebook metrics for a listing
- `updateFacebookMetrics()`: Update existing Facebook metrics
- `deleteFacebookMetrics()`: Delete Facebook metrics record

## User Experience

### Form Flow
1. Navigate to listing detail page
2. Scroll to "Manual Data Entry" card
3. Select desired form action button
4. Fill out form in dialog/modal
5. Submit to save data
6. Receive success/error toast notification
7. Page data refreshes automatically

### Features
- All forms use dialogs/modals to keep user in context
- Loading states during submission
- Clear validation error messages
- Toast notifications for success/error feedback
- Cancel buttons to close without saving
- Date pickers for date fields
- Number inputs with min validation
- All metric fields are optional

## Files Created/Modified

### New Files
- `/lib/validations/manual-data.ts` - Zod validation schemas
- `/lib/supabase/manual-data.ts` - Database helper functions
- `/components/listings/har-data-form.tsx` - HAR data update form
- `/components/listings/platform-metrics-form.tsx` - Platform metrics form
- `/components/listings/facebook-metrics-form.tsx` - Facebook metrics form
- `/components/listings/manual-data-entry.tsx` - Container component

### Modified Files
- `/app/listings/[id]/page.tsx` - Added ManualDataEntry component

## UI Components Used

All forms use shadcn/ui components:
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- Button, Input, Label, Select, Card, Alert, Separator
- Loading indicators (Loader2 icon)
- Form icons (TrendingUp, BarChart2, Facebook)

## Dark Mode Support

All components fully support dark mode through Tailwind CSS classes and shadcn/ui theming.

## Error Handling

- Form validation errors displayed inline below fields
- Database errors caught and displayed via toast notifications
- Network errors handled gracefully
- All async operations wrapped in try/catch blocks

## Future Improvements

This manual data entry system is temporary. Future enhancements:
1. **Automated HAR.com Scraping**: Replace HAR form with automated scraper
2. **Realtor.com API Integration**: Replace manual platform metrics with API
3. **Zillow API Integration**: Replace manual platform metrics with API
4. **Facebook Graph API**: Replace manual Facebook metrics with API integration
5. **Bulk Import**: CSV/Excel import for historical data
6. **Scheduled Updates**: Automated daily data collection
7. **Data Validation**: Cross-reference and validate data from multiple sources

## Testing

- All forms pass ESLint validation with no errors
- Forms use TypeScript for type safety
- Validation schemas ensure data integrity
- Toast notifications provide user feedback
- Manual testing required for UI/UX verification

## Notes

- Remember to remind users this is a temporary solution
- All forms are accessible from listing detail page only
- Facebook metrics form disabled if no Facebook URLs added
- All date fields default to today's date
- Empty/undefined numeric fields saved as NULL in database
