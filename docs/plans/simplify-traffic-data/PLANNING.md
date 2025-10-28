# simplify-traffic-data - PLANNING

## Summary
Simplify traffic data collection to show only essential metrics: views only for HAR/Realtor/Zillow, basic Facebook metrics. Update manual data entry forms to collect minimal data. Ensure print report and PDF generation display only simplified traffic data from the database.

## Requirements
- HAR data form: Only collect views (combine desktop/mobile into single field or keep separate but minimal)
- Realtor/Zillow forms: Only collect views (remove saves, shares, leads)
- Facebook form: Keep simple - impressions, reach, and basic engagement
- Print report page: Display simplified traffic data from database
- PDF generation: Include simplified traffic data in generated PDF
- All data must come from database (no hardcoded values)
- Forms should be extremely simple and easy to use

## UI / UX
- Manual data entry interface: Single, streamlined form with tabs for each platform
- Clear labels showing what data is needed (views only for most platforms)
- Print report: Clean table showing traffic data by platform
- PDF: Same simplified data as print report

## Sections

### Section 1: Simplify Manual Data Entry Forms
**Description:** Update HAR, Realtor, Zillow, and Facebook forms to collect only essential metrics (views primarily).

**Objectives:**
- Modify HAR data form to focus on views only (desktop + mobile views)
- Update Platform Metrics form to only collect views for Realtor/Zillow
- Simplify Facebook Metrics form to essential fields (impressions, reach, clicks)
- Update validation schemas to match simplified data structure
- Update database functions to handle simplified data

**Verification:**
- Manual data entry forms show only simplified fields
- Forms validate and submit successfully
- Data saves correctly to database tables

### Section 2: Update Print Report and PDF Generation
**Description:** Modify print report page and PDF generation to display only simplified traffic data from database.

**Objectives:**
- Update print report query to fetch simplified traffic data
- Display only views and essential metrics in print report UI
- Update PDF generation to include simplified traffic data
- Ensure all data comes from database (no hardcoded values)

**Verification:**
- Print report displays simplified traffic data correctly
- PDF includes same simplified traffic data as print report
- All data matches what was entered in manual data entry forms
- No console errors or missing data

## Notes
- Keep backward compatibility with existing data in database
- Focus on simplicity and ease of use for data entry
- Ensure consistent data display between print report and PDF
- Use Supabase MCP for database operations
- Test all changes with Playwright MCP
