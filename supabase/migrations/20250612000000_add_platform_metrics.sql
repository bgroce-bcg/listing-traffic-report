-- Migration: Add Platform Metrics Tables
-- Description: Adds tables for tracking daily metrics from each platform (Zillow, Realtor, HAR) and Facebook engagement
-- Date: 2025-06-12

-- Platform daily metrics table (for Zillow, Realtor, HAR daily stats)
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('zillow', 'realtor', 'har')),
  metric_date DATE NOT NULL,
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  saves INTEGER DEFAULT 0 CHECK (saves >= 0),
  shares INTEGER DEFAULT 0 CHECK (shares >= 0),
  leads INTEGER DEFAULT 0 CHECK (leads >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, platform, metric_date)
);

-- Facebook post engagement metrics
CREATE TABLE IF NOT EXISTS facebook_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facebook_url_id UUID NOT NULL REFERENCES facebook_urls(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  reach INTEGER DEFAULT 0 CHECK (reach >= 0),
  impressions INTEGER DEFAULT 0 CHECK (impressions >= 0),
  post_clicks INTEGER DEFAULT 0 CHECK (post_clicks >= 0),
  reactions INTEGER DEFAULT 0 CHECK (reactions >= 0),
  comments INTEGER DEFAULT 0 CHECK (comments >= 0),
  shares INTEGER DEFAULT 0 CHECK (shares >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(facebook_url_id, metric_date)
);

-- Indexes for performance
CREATE INDEX idx_platform_metrics_listing_id ON platform_metrics(listing_id);
CREATE INDEX idx_platform_metrics_date ON platform_metrics(metric_date DESC);
CREATE INDEX idx_platform_metrics_listing_date ON platform_metrics(listing_id, metric_date DESC);

CREATE INDEX idx_facebook_metrics_url_id ON facebook_metrics(facebook_url_id);
CREATE INDEX idx_facebook_metrics_date ON facebook_metrics(metric_date DESC);

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated at triggers
CREATE TRIGGER set_platform_metrics_updated_at
  BEFORE UPDATE ON platform_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_facebook_metrics_updated_at
  BEFORE UPDATE ON facebook_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for platform_metrics
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own platform metrics"
  ON platform_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = platform_metrics.listing_id
      AND listings.user_id = auth.uid()
      AND listings.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert their own platform metrics"
  ON platform_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = platform_metrics.listing_id
      AND listings.user_id = auth.uid()
      AND listings.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can update their own platform metrics"
  ON platform_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = platform_metrics.listing_id
      AND listings.user_id = auth.uid()
      AND listings.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can delete their own platform metrics"
  ON platform_metrics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = platform_metrics.listing_id
      AND listings.user_id = auth.uid()
      AND listings.deleted_at IS NULL
    )
  );

-- RLS Policies for facebook_metrics
ALTER TABLE facebook_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own facebook metrics"
  ON facebook_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM facebook_urls
      JOIN listings ON listings.id = facebook_urls.listing_id
      WHERE facebook_urls.id = facebook_metrics.facebook_url_id
      AND listings.user_id = auth.uid()
      AND listings.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert their own facebook metrics"
  ON facebook_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM facebook_urls
      JOIN listings ON listings.id = facebook_urls.listing_id
      WHERE facebook_urls.id = facebook_metrics.facebook_url_id
      AND listings.user_id = auth.uid()
      AND listings.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can update their own facebook metrics"
  ON facebook_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM facebook_urls
      JOIN listings ON listings.id = facebook_urls.listing_id
      WHERE facebook_urls.id = facebook_metrics.facebook_url_id
      AND listings.user_id = auth.uid()
      AND listings.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can delete their own facebook metrics"
  ON facebook_metrics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM facebook_urls
      JOIN listings ON listings.id = facebook_urls.listing_id
      WHERE facebook_urls.id = facebook_metrics.facebook_url_id
      AND listings.user_id = auth.uid()
      AND listings.deleted_at IS NULL
    )
  );

-- Comments for documentation
COMMENT ON TABLE platform_metrics IS 'Daily metrics from listing platforms (Zillow, Realtor.com, HAR)';
COMMENT ON TABLE facebook_metrics IS 'Daily engagement metrics for Facebook posts';
