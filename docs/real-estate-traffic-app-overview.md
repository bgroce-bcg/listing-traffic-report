# Real Estate Traffic Report App - Overview

## Tech Stack
- **Frontend**: React with shadcn/ui components
- **Backend**: Supabase
- **Data Collection**: External API (scraping handled separately)

## App Structure

### Page 1: Listings List
- Display all property listings in a table/card view
- Show key summary stats for each listing
- Add new listing button
- Click listing to navigate to detail page

### Page 2: Listing Detail
- Property information header
- Manual data entry section
- Listing URLs management (Realtor.com, Zillow)
  - Add/remove URLs
  - Display scraped data for each URL
- Facebook posts management
  - Add/remove post links
  - Display engagement metrics for each post
- **Gather Data Button**: Triggers API call to scrape all URLs/links for this listing
- **Download PDF Button**: Generates and downloads formatted report for this listing

## Core Features

### 1. Listings Management
- Create, edit, delete listings
- Basic property info (address, MLS#, price, etc.)
- Listing status tracking

### 2. Manual Data Entry (per listing)
- Form inputs for traffic metrics that need manual entry
- Save and edit capability
- Date range selection for reporting period

### 3. URL & Link Management (per listing)
- Add/remove Realtor.com listing URLs
- Add/remove Zillow listing URLs
- Add/remove Facebook post links
- Store all URLs in Supabase

### 4. Data Collection
- "Gather Data" button sends all URLs/links to external API
- Receive and store scraped metrics from API
- Display metrics next to corresponding URLs/links
- Track last updated timestamp

### 5. PDF Report Generation (per listing)
- Professional formatted layout
- Combine manual entries and scraped data
- Include charts/graphs
- Property information header
- Date range and generation timestamp

## Key Data Points to Track

**Listing Metrics** (from scraping):
- Page views
- Saves/favorites
- Time on page
- Lead inquiries

**Facebook Metrics** (from scraping):
- Post views/reach
- Reactions
- Comments
- Shares
- Click-throughs

**Manual Metrics**:
- Phone inquiries
- Email inquiries
- In-person showings
- Other custom metrics

## API Integration Requirements
- Endpoint to send URLs/links for scraping
- Webhook or polling to receive scraped data
- Authentication for API requests
- Error handling for failed scrapes