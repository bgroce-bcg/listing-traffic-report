-- Migration: Create Simplified Facebook Posts Table
-- Description: Creates a simple facebook_posts table with URL (text, no validation) and views (number)
-- Date: 2025-10-28

-- Step 1: Create facebook_posts table with simple structure
CREATE TABLE IF NOT EXISTS facebook_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT facebook_posts_views_non_negative CHECK (views >= 0),
  CONSTRAINT facebook_posts_url_not_empty CHECK (length(trim(url)) > 0)
);

-- Create indexes for facebook_posts
CREATE INDEX idx_facebook_posts_listing_id ON facebook_posts(listing_id);
CREATE INDEX idx_facebook_posts_created_at ON facebook_posts(created_at DESC);

-- Add comment to table
COMMENT ON TABLE facebook_posts IS 'Simplified Facebook post tracking with URL (text, no validation) and views';
COMMENT ON COLUMN facebook_posts.url IS 'Facebook post URL - simple text field, no URL validation required';
COMMENT ON COLUMN facebook_posts.views IS 'Number of views for this Facebook post';

-- Step 2: Create updated_at trigger
DROP TRIGGER IF EXISTS set_facebook_posts_updated_at ON facebook_posts;
CREATE TRIGGER set_facebook_posts_updated_at
  BEFORE UPDATE ON facebook_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE facebook_posts ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for facebook_posts
-- Policy: Users can select their own facebook_posts
CREATE POLICY facebook_posts_select_own
  ON facebook_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = facebook_posts.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can insert their own facebook_posts
CREATE POLICY facebook_posts_insert_own
  ON facebook_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = facebook_posts.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can update their own facebook_posts
CREATE POLICY facebook_posts_update_own
  ON facebook_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = facebook_posts.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Policy: Users can delete their own facebook_posts
CREATE POLICY facebook_posts_delete_own
  ON facebook_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = facebook_posts.listing_id
        AND listings.user_id = auth.uid()
        AND listings.deleted_at IS NULL
    )
  );

-- Migration complete
-- Note: This table coexists with existing facebook_urls and facebook_metrics tables
-- The old tables can be deprecated/dropped in a future migration if desired
