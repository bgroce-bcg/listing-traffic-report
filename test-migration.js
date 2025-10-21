// Test migration by checking table structure
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  // Test 1: Check listings table
  console.log('1. Testing listings table structure:');
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .limit(0);

  if (listingsError) {
    console.log('   ❌ Error:', listingsError.message);
  } else {
    console.log('   ✅ listings table exists');
  }

  // Test 2: Check facebook_urls table
  console.log('\n2. Testing facebook_urls table:');
  const { data: fbUrls, error: fbError } = await supabase
    .from('facebook_urls')
    .select('*')
    .limit(0);

  if (fbError) {
    console.log('   ❌ Error:', fbError.message);
  } else {
    console.log('   ✅ facebook_urls table exists');
  }

  // Test 3: Check analytics table
  console.log('\n3. Testing analytics table:');
  const { data: analytics, error: analyticsError } = await supabase
    .from('analytics')
    .select('*')
    .limit(0);

  if (analyticsError) {
    console.log('   ❌ Error:', analyticsError.message);
  } else {
    console.log('   ✅ analytics table exists');
  }

  console.log('\n✨ Migration verification complete!');
}

verifyMigration().catch(console.error);
