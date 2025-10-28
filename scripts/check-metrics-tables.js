#!/usr/bin/env node

/**
 * Quick diagnostic script to check metrics tables in the remote database
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Checking metrics tables...\n')

  // Check platform_metrics table
  console.log('1. Checking platform_metrics table...')
  const { data: platformData, error: platformError } = await supabase
    .from('platform_metrics')
    .select('*')
    .limit(1)

  if (platformError) {
    console.error('❌ platform_metrics table error:', platformError.message)
  } else {
    console.log('✅ platform_metrics table exists')
    console.log(`   Found ${platformData?.length || 0} records (limited to 1)`)
  }

  // Check facebook_metrics table
  console.log('\n2. Checking facebook_metrics table...')
  const { data: facebookData, error: facebookError } = await supabase
    .from('facebook_metrics')
    .select('*')
    .limit(1)

  if (facebookError) {
    console.error('❌ facebook_metrics table error:', facebookError.message)
  } else {
    console.log('✅ facebook_metrics table exists')
    console.log(`   Found ${facebookData?.length || 0} records (limited to 1)`)
  }

  // Check listings table to ensure we have a listing to test with
  console.log('\n3. Checking listings table...')
  const { data: listingsData, error: listingsError } = await supabase
    .from('listings')
    .select('id, name')
    .limit(3)

  if (listingsError) {
    console.error('❌ listings table error:', listingsError.message)
  } else {
    console.log('✅ listings table exists')
    console.log(`   Found ${listingsData?.length || 0} listings (limited to 3)`)
    if (listingsData && listingsData.length > 0) {
      listingsData.forEach((listing) => {
        console.log(`   - ${listing.name} (${listing.id})`)
      })
    }
  }

  // Check facebook_urls table
  console.log('\n4. Checking facebook_urls table...')
  const { data: fbUrlsData, error: fbUrlsError } = await supabase
    .from('facebook_urls')
    .select('id, facebook_url, listing_id')
    .limit(3)

  if (fbUrlsError) {
    console.error('❌ facebook_urls table error:', fbUrlsError.message)
  } else {
    console.log('✅ facebook_urls table exists')
    console.log(`   Found ${fbUrlsData?.length || 0} Facebook URLs (limited to 3)`)
    if (fbUrlsData && fbUrlsData.length > 0) {
      fbUrlsData.forEach((url) => {
        console.log(`   - ${url.facebook_url} (${url.id})`)
      })
    }
  }

  console.log('\n✅ Diagnostic check complete')
}

checkTables().catch(console.error)
