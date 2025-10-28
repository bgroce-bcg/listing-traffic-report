# facebook-posts-simplified - PLANNING

## Summary
Simplify Facebook post tracking to use a simple URL text field (no validation) and views count. Allow users to create a list of Facebook posts with traffic data, edit the traffic for each post, and display them in a table format on the print report and PDF with traffic totals included in overall metrics.

## Requirements
- Simple Facebook post form: URL (text field, no validation) + Views (number field)
- Ability to add multiple Facebook posts to a listing
- Ability to edit traffic (views) for each Facebook post
- Display Facebook posts in a table/list on print report showing URL and views
- Include Facebook post views in total traffic calculations
- Remove complex Facebook metrics (impressions, reach, reactions, etc.)
- No URL validation required - simple text input

## UI / UX
- Manual data entry: Simple form with URL text field and Views number field
- Listing page: List of Facebook posts with edit capability for each
- Print report: Table showing Facebook post URLs and their view counts
- All Facebook views should be included in the total views metric

## Sections

### Section 1: Simplify Facebook Posts Data Model
**Description:** Update database schema and forms to use simple URL + Views model for Facebook posts.

**Objectives:**
- Remove facebook_urls and facebook_metrics tables dependency
- Create simple facebook_posts table or update existing structure to store URL (text) and views (number)
- Update or create simple form for adding Facebook posts with URL and views
- Add ability to edit views for existing Facebook posts
- Remove validation from URL field

**Verification:**
- Can add Facebook posts with any URL text and view count
- Can edit view count for existing Facebook posts
- Data saves correctly to database
- No URL validation errors

### Section 2: Update Print Report and PDF with Facebook Posts Table
**Description:** Display Facebook posts in a table format on print report and PDF, including views in total calculations.

**Objectives:**
- Add Facebook posts table to print report showing URL and views
- Include Facebook post views in total traffic calculations
- Update PDF generation to include Facebook posts table
- Ensure data comes from database

**Verification:**
- Print report shows Facebook posts in table format
- Facebook views are included in total views
- PDF matches print report
- All data comes from database

## Notes
- Simplify from complex facebook_urls + facebook_metrics model to single simple table
- Focus on ease of use - just URL and views
- May need to migrate or deprecate existing Facebook data structure
- Keep backward compatibility if possible, but simplicity is priority
