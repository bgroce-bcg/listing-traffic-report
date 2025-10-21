-- Migration: Simplify Schema
-- Description: Simplifies the listings table structure and creates facebook_urls and analytics tables
-- Date: 2025-06-10

-- Step 1: Drop existing tables that will be replaced
-- Note: This will delete all existing data in these tables
DROP TABLE IF EXISTS manual_metrics CASCADE;
DROP TABLE IF EXISTS listing_urls CASCADE;

-- Step 2: Modify listings table to new simplified structure
-- First, drop columns we don't need anymore
ALTER TABLE listings
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS zip_code,
  DROP COLUMN IF EXISTS listing_price,
  DROP COLUMN IF EXISTS listing_status,
  DROP COLUMN IF EXISTS list_date,
  DROP COLUMN IF EXISTS sold_date,
  DROP COLUMN IF EXISTS notes;

-- Add new columns to listings table
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Unnamed Listing',
  ADD COLUMN IF NOT EXISTS mls_number TEXT,
  ADD COLUMN IF NOT EXISTS realtor_url TEXT,
  ADD COLUMN IF NOT EXISTS har_url TEXT,
  ADD COLUMN IF NOT EXISTS zillow_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Remove the default after adding the column
ALTER TABLE listings ALTER COLUMN name DROP DEFAULT;

-- Add URL validation constraints
ALTER TABLE listings
  ADD CONSTRAINT listings_realtor_url_format
    CHECK (realtor_url IS NULL OR realtor_url ~* '^https?://'),
  ADD CONSTRAINT listings_har_url_format
    CHECK (har_url IS NULL OR har_url ~* '^https?://'),
  ADD CONSTRAINT listings_zillow_url_format
    CHECK (zillow_url IS NULL OR zillow_url ~* '^https?://'),
  ADD CONSTRAINT listings_mls_number_format
    CHECK (mls_number IS NULL OR mls_number ~ '^\\d{6,}$');

-- Add unique index on MLS number for rapid lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_mls_number
  ON listings(mls_number)
  WHERE mls_number IS NOT NULL AND deleted_at IS NULL;

-- Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_is_active
  ON listings(is_active)
  WHERE deleted_at IS NULL;

-- Step 3: Create facebook_urls table
CREATE TABLE IF NOT EXISTS facebook_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  facebook_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT facebook_urls_url_format CHECK (facebook_url ~* '^https?://(www\.)?facebook\.com/'),
  CONSTRAINT facebook_urls_url_not_empty CHECK (length(trim(facebook_url)) > 0)
);

-- Create indexes for facebook_urls
CREATE INDEX idx_facebook_urls_listing_id ON facebook_urls(listing_id);
CREATE INDEX idx_facebook_urls_created_at ON facebook_urls(created_at DESC);

-- Add comment to table
COMMENT ON TABLE facebook_urls IS 'Stores multiple Facebook post URLs for each listing';

-- Step 4: Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  facebook_url_id UUID REFERENCES facebook_urls(id) ON DELETE SET NULL,
  metric_date DATE NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT analytics_views_non_negative CHECK (views >= 0),
  CONSTRAINT analytics_clicks_non_negative CHECK (clicks >= 0),
  CONSTRAINT analytics_unique_listing_fb_date UNIQUE (listing_id, facebook_url_id, metric_date)
);

-- Create indexes for analytics
CREATE INDEX idx_analytics_listing_id ON analytics(listing_id);
CREATE INDEX idx_analytics_facebook_url_id ON analytics(facebook_url_id);
CREATE INDEX idx_analytics_metric_date ON analytics(metric_date DESC);
CREATE INDEX idx_analytics_listing_date ON analytics(listing_id, metric_date DESC);

-- Add comment to table
COMMENT ON TABLE analytics IS 'Stores daily analytics metrics for listings and Facebook posts';

-- Step 5: Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to analytics table
DROP TRIGGER IF EXISTS set_analytics_updated_at ON analytics;
CREATE TRIGGER set_analytics_updated_at
  BEFORE UPDATE ON analytics
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Step 6: Enable Row Level Security (RLS) on new tables
ALTER TABLE facebook_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for facebook_urls
-- Policy: Users can select their own facebook_urls
CREATE POLICY facebook_urls_select_own
  ON facebook_urls
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = facebook_urls.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can insert their own facebook_urls
CREATE POLICY facebook_urls_insert_own
  ON facebook_urls
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = facebook_urls.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can update their own facebook_urls
CREATE POLICY facebook_urls_update_own
  ON facebook_urls
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = facebook_urls.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can delete their own facebook_urls
CREATE POLICY facebook_urls_delete_own
  ON facebook_urls
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = facebook_urls.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Step 8: Create RLS policies for analytics
-- Policy: Users can select their own analytics
CREATE POLICY analytics_select_own
  ON analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = analytics.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can insert their own analytics
CREATE POLICY analytics_insert_own
  ON analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = analytics.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can update their own analytics
CREATE POLICY analytics_update_own
  ON analytics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = analytics.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can delete their own analytics
CREATE POLICY analytics_delete_own
  ON analytics
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = analytics.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Step 9: Update existing RLS policies for listings table to account for new columns
-- Drop old policies related to old columns
DROP POLICY IF EXISTS listings_select_own ON listings;
DROP POLICY IF EXISTS listings_insert_own ON listings;
DROP POLICY IF EXISTS listings_update_own ON listings;
DROP POLICY IF EXISTS listings_delete_own ON listings;

-- Recreate listings RLS policies
CREATE POLICY listings_select_own
  ON listings
  FOR SELECT
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY listings_insert_own
  ON listings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY listings_update_own
  ON listings
  FOR UPDATE
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY listings_delete_own
  ON listings
  FOR DELETE
  USING (user_id = auth.uid());

-- Step 10: Add helpful comments
COMMENT ON COLUMN listings.name IS 'Simple, user-friendly name for the listing';
COMMENT ON COLUMN listings.realtor_url IS 'URL to the listing on Realtor.com';
COMMENT ON COLUMN listings.har_url IS 'URL to the listing on HAR.com';
COMMENT ON COLUMN listings.zillow_url IS 'URL to the listing on Zillow';
COMMENT ON COLUMN listings.is_active IS 'Whether the listing is currently active';
COMMENT ON COLUMN facebook_urls.facebook_url IS 'URL to a Facebook post about this listing';
COMMENT ON COLUMN analytics.facebook_url_id IS 'Optional link to specific Facebook post for this analytics record';
COMMENT ON COLUMN analytics.metric_date IS 'Date these metrics were recorded for';
COMMENT ON COLUMN analytics.views IS 'Number of views on this date';
COMMENT ON COLUMN analytics.clicks IS 'Number of clicks on this date';

-- Migration complete
