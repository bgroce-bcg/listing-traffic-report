# add-data - PLANNING

## Summary
Create user-friendly forms for manually entering traffic data from HAR, Realtor.com, and Zillow, as well as Facebook posts with their metrics. This provides a temporary solution for data collection until proper scraping and API integrations are built.

## Requirements
- Form to bulk-update HAR traffic metrics on a listing (desktop views, mobile views, photo views, days on market, status)
- Form to add/edit Realtor.com traffic metrics (views, saves, shares, leads) with dates
- Form to add/edit Zillow traffic metrics (views, saves, shares, leads) with dates
- UI to add Facebook post URLs to a listing
- Form to log Facebook post metrics (impressions, reach, reactions, comments, shares, post clicks) with dates
- All forms should be accessible from the listing detail page
- Simple, intuitive UX optimized for quick data entry
- Proper validation and error handling
- Toast notifications for success/error feedback

## UI / UX
- Add a "Manual Data Entry" section to the listing detail page
- Use tabs or expandable sections to organize different data entry forms
- Quick action buttons: "Update HAR Data", "Add Platform Metrics", "Add Facebook Post", "Log FB Metrics"
- Forms use dialogs/modals to keep the user in context
- Date pickers for metric dates
- Number inputs with proper validation
- Clear labels and help text
- Loading states during submission

## Sections

### manual-data-forms
**Description:** Create all manual data entry forms and integrate them into the listing page
**Objectives:**
- Create HAR data update form component (updates listing fields directly)
- Create platform metrics form component for Realtor.com and Zillow (uses platform_metrics table)
- Create Facebook URL management component (add/edit facebook_urls)
- Create Facebook metrics logging form (uses facebook_metrics table)
- Integrate all forms into listing detail page with clear organization
- Add proper validation schemas with zod
- Implement error handling and success notifications
**Verification:**
- Can update HAR traffic data and see it reflected in listing details
- Can add platform metrics for Realtor.com and Zillow with dates
- Can add Facebook post URLs to a listing
- Can log Facebook metrics for specific posts and dates
- All forms validate input properly
- Success/error toasts appear for all operations
- Forms are easy to use and visually consistent with existing UI

## Notes
- Uses existing `platform_metrics` table for Realtor.com/Zillow data (platform field: 'realtor', 'zillow')
- HAR data updates listing fields directly (har_desktop_views, har_mobile_views, etc.)
- Facebook metrics use the existing `facebook_metrics` table
- All forms should follow the same patterns as existing UI (dark mode, shadcn/ui components)
- This is a temporary solution - remind user that automation is the long-term goal
