#!/usr/bin/env node

/**
 * Setup script to create the listing-images storage bucket
 * Run this with: node scripts/setup-storage-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupStorageBucket() {
  // Get credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nMake sure these are set in your .env.local file');
    process.exit(1);
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Setting up listing-images storage bucket...\n');

  try {
    // Check if bucket already exists
    const { data: existingBuckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      throw listError;
    }

    const bucketExists = existingBuckets?.some(b => b.id === 'listing-images');

    if (bucketExists) {
      console.log('✅ Bucket "listing-images" already exists');
    } else {
      // Create the bucket
      const { data: bucket, error: createError } = await supabase
        .storage
        .createBucket('listing-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif'
          ]
        });

      if (createError) {
        throw createError;
      }

      console.log('✅ Created bucket "listing-images"');
    }

    // List all buckets to confirm
    const { data: allBuckets } = await supabase.storage.listBuckets();
    console.log('\n📦 All storage buckets:');
    allBuckets?.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    console.log('\n✨ Storage bucket setup complete!');
    console.log('\nYou can now:');
    console.log('1. Upload images from the listing detail pages');
    console.log('2. View images in the print report');
    console.log('3. Check the bucket at: https://supabase.com/dashboard/project/wuoxgzglvnhoxrgaukft/storage/buckets\n');

  } catch (error) {
    console.error('❌ Error setting up storage bucket:', error.message);
    process.exit(1);
  }
}

setupStorageBucket();
