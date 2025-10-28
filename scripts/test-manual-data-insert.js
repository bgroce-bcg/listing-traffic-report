#!/usr/bin/env node

/**
 * Test script to simulate manual data insertion with detailed error reporting
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInserts() {
  console.log('🧪 Testing manual data insertion scenarios...\n')

  // Check authentication
  console.log('1. Checking authentication...')
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('❌ Not authenticated or auth error:', authError?.message || 'No user session')
    console.log('   This is likely the issue - you need to be logged in to add data')
    console.log('   The app uses Row Level Security (RLS) policies that require authentication\n')
  } else {
    console.log(`✅ Authenticated as: ${user.email}`)
    console.log(`   User ID: ${user.id}\n`)
  }

  // Get a listing (if any exist)
  console.log('2. Finding a test listing...')
  const { data: listings, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .limit(1)
    .single()

  if (listingError || !listings) {
    console.error('❌ No listings found:', listingError?.message || 'No data')
    console.log('   You need to create a listing first before adding metrics\n')
    return
  }

  console.log(`✅ Found listing: ${listings.name} (${listings.id})`)
  console.log(`   User ID: ${listings.user_id}\n`)

  // Test platform metrics insert
  console.log('3. Testing platform metrics insert...')
  const testPlatformData = {
    listing_id: listings.id,
    platform: 'realtor',
    metric_date: new Date().toISOString().split('T')[0],
    views: 100,
    saves: 10,
    shares: 5,
    leads: 2,
  }

  const { data: platformData, error: platformError } = await supabase
    .from('platform_metrics')
    .insert(testPlatformData)
    .select()
    .single()

  if (platformError) {
    console.error('❌ Platform metrics insert failed:', platformError.message)
    console.error('   Details:', JSON.stringify(platformError, null, 2))
  } else {
    console.log('✅ Platform metrics inserted successfully')
    console.log(`   ID: ${platformData.id}`)

    // Clean up test data
    await supabase.from('platform_metrics').delete().eq('id', platformData.id)
    console.log('   (Test data cleaned up)\n')
  }

  // Get a Facebook URL for testing
  console.log('4. Testing Facebook metrics insert...')
  const { data: fbUrls, error: fbUrlError } = await supabase
    .from('facebook_urls')
    .select('*')
    .eq('listing_id', listings.id)
    .limit(1)
    .single()

  if (fbUrlError || !fbUrls) {
    console.error('❌ No Facebook URLs found for this listing')
    console.log('   Add a Facebook URL first to test Facebook metrics\n')
  } else {
    const testFbData = {
      facebook_url_id: fbUrls.id,
      metric_date: new Date().toISOString().split('T')[0],
      impressions: 500,
      reach: 400,
      reactions: 20,
      comments: 5,
      shares: 3,
      post_clicks: 15,
    }

    const { data: fbData, error: fbError } = await supabase
      .from('facebook_metrics')
      .insert(testFbData)
      .select()
      .single()

    if (fbError) {
      console.error('❌ Facebook metrics insert failed:', fbError.message)
      console.error('   Details:', JSON.stringify(fbError, null, 2))
    } else {
      console.log('✅ Facebook metrics inserted successfully')
      console.log(`   ID: ${fbData.id}`)

      // Clean up test data
      await supabase.from('facebook_metrics').delete().eq('id', fbData.id)
      console.log('   (Test data cleaned up)\n')
    }
  }

  console.log('✅ Test complete')
}

testInserts().catch(console.error)
