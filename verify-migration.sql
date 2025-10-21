-- Verify migration: Check table structures

-- 1. Check listings table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'listings'
ORDER BY ordinal_position;

-- 1a. Ensure MLS index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'listings' AND indexname = 'idx_listings_mls_number';

-- 2. Check facebook_urls table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'facebook_urls'
ORDER BY ordinal_position;

-- 3. Check analytics table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'analytics'
ORDER BY ordinal_position;

-- 4. Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('listings', 'facebook_urls', 'analytics');

-- 5. Check RLS policies count
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
