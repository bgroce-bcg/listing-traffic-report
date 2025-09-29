# Backend Overview - Real Estate Traffic Report App

## Tech Stack
- **Database & Backend**: Supabase
  - PostgreSQL database with real-time capabilities
  - Built-in authentication and authorization
  - Row Level Security (RLS) for data protection
  - RESTful API auto-generated from database schema
  - Real-time subscriptions for live data updates

## Application Purpose
This app helps real estate agents track and analyze traffic metrics for their property listings across multiple platforms. It combines manual data entry with automated scraping to generate comprehensive traffic reports.

## Core Backend Responsibilities

### 1. Data Storage
- **Listings**: Property information (address, MLS#, price, status)
- **URLs & Links**: Realtor.com, Zillow URLs and Facebook post links per listing
- **Scraped Metrics**: Automated data collection results (views, saves, engagement)
- **Manual Metrics**: User-entered data (phone calls, showings, inquiries)
- **Reports**: Generated PDF metadata and timestamps

### 2. API Integration
- Handle external scraping API requests
- Store returned metrics data
- Manage API authentication and error handling
- Track last updated timestamps for data freshness

### 3. Data Management
- CRUD operations for listings and associated data
- Data validation and integrity constraints
- Efficient querying for report generation
- Data archival and cleanup processes

## Database Schema Highlights
- **listings** table: Core property information
- **listing_urls** table: Platform-specific URLs (Realtor.com, Zillow)
- **facebook_posts** table: Social media post tracking
- **scraped_metrics** table: Automated data collection results
- **manual_metrics** table: User-entered traffic data
- **reports** table: PDF generation history and metadata

## Key Features
- Real-time data synchronization between frontend and database
- Secure API endpoints with authentication
- Scalable data structure supporting multiple listings per agent
- Integration-ready architecture for external scraping services