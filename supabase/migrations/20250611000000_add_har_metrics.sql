-- Migration: Add HAR Metrics Snapshot Fields
-- Description: Adds columns to store HAR.com metrics snapshot data
-- Date: 2025-06-11

-- Add HAR metrics columns to listings table
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS har_desktop_views INTEGER,
  ADD COLUMN IF NOT EXISTS har_mobile_views INTEGER,
  ADD COLUMN IF NOT EXISTS har_photo_views INTEGER,
  ADD COLUMN IF NOT EXISTS har_days_on_market INTEGER,
  ADD COLUMN IF NOT EXISTS har_status TEXT;

-- Add constraints for HAR metrics
ALTER TABLE listings
  ADD CONSTRAINT listings_har_desktop_views_non_negative
    CHECK (har_desktop_views IS NULL OR har_desktop_views >= 0),
  ADD CONSTRAINT listings_har_mobile_views_non_negative
    CHECK (har_mobile_views IS NULL OR har_mobile_views >= 0),
  ADD CONSTRAINT listings_har_photo_views_non_negative
    CHECK (har_photo_views IS NULL OR har_photo_views >= 0),
  ADD CONSTRAINT listings_har_days_on_market_non_negative
    CHECK (har_days_on_market IS NULL OR har_days_on_market >= 0),
  ADD CONSTRAINT listings_har_status_values
    CHECK (har_status IS NULL OR har_status IN ('Active', 'Pending', 'Under Contract', 'Closed', 'Expired'));

COMMENT ON COLUMN listings.har_desktop_views IS 'Snapshot of desktop views from HAR.com';
COMMENT ON COLUMN listings.har_mobile_views IS 'Snapshot of mobile views from HAR.com';
COMMENT ON COLUMN listings.har_photo_views IS 'Snapshot of photo gallery views from HAR.com';
COMMENT ON COLUMN listings.har_days_on_market IS 'Snapshot of days on market from HAR.com';
COMMENT ON COLUMN listings.har_status IS 'Snapshot of listing status from HAR.com';
