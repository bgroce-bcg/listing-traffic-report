-- Add image_url column to listings table for property images
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN listings.image_url IS 'URL to the property image for reports';
