-- Add HAR traffic snapshot fields to listings

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS har_desktop_views INTEGER DEFAULT 0 CHECK (har_desktop_views >= 0),
  ADD COLUMN IF NOT EXISTS har_mobile_views INTEGER DEFAULT 0 CHECK (har_mobile_views >= 0),
  ADD COLUMN IF NOT EXISTS har_photo_views INTEGER DEFAULT 0 CHECK (har_photo_views >= 0),
  ADD COLUMN IF NOT EXISTS har_days_on_market INTEGER CHECK (har_days_on_market IS NULL OR har_days_on_market >= 0),
  ADD COLUMN IF NOT EXISTS har_status TEXT;

COMMENT ON COLUMN listings.har_desktop_views IS 'Latest HAR desktop view count snapshot';
COMMENT ON COLUMN listings.har_mobile_views IS 'Latest HAR mobile view count snapshot';
COMMENT ON COLUMN listings.har_photo_views IS 'Latest HAR photo gallery view count snapshot';
COMMENT ON COLUMN listings.har_days_on_market IS 'Latest HAR days on market value snapshot';
COMMENT ON COLUMN listings.har_status IS 'Latest HAR status snapshot (e.g. Active, Pending)';



