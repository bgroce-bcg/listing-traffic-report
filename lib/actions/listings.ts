'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/database.types'

type ListingUpdate = Database['public']['Tables']['listings']['Update']
type AnalyticsInsert = Database['public']['Tables']['analytics']['Insert']

// Get listing with all related data
export async function getListingWithData(listingId: string) {
  const supabase = await createClient()

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single()

  if (listingError) {
    console.error('Error fetching listing:', listingError)
    return { error: listingError.message }
  }

  const { data: facebookUrls, error: fbError } = await supabase
    .from('facebook_urls')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })

  if (fbError) {
    console.error('Error fetching Facebook URLs:', fbError)
  }

  const { data: analytics, error: analyticsError } = await supabase
    .from('analytics')
    .select(`
      *,
      facebook_url:facebook_urls(*)
    `)
    .eq('listing_id', listingId)
    .order('metric_date', { ascending: false })

  if (analyticsError) {
    console.error('Error fetching analytics:', analyticsError)
  }

  return {
    listing,
    facebookUrls: facebookUrls || [],
    analytics: analytics || [],
  }
}

// Update listing basic info and HAR metrics
export async function updateListing(listingId: string, data: ListingUpdate) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('listings')
    .update(data)
    .eq('id', listingId)

  if (error) {
    console.error('Error updating listing:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

// Add Facebook URL
export async function addFacebookUrl(listingId: string, facebookUrl: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('facebook_urls')
    .insert({
      listing_id: listingId,
      facebook_url: facebookUrl,
    })

  if (error) {
    console.error('Error adding Facebook URL:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

// Delete Facebook URL
export async function deleteFacebookUrl(urlId: string, listingId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('facebook_urls')
    .delete()
    .eq('id', urlId)

  if (error) {
    console.error('Error deleting Facebook URL:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

// Add analytics entry
export async function addAnalyticsEntry(
  listingId: string,
  data: Omit<AnalyticsInsert, 'listing_id'>
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('analytics')
    .insert({
      listing_id: listingId,
      ...data,
    })

  if (error) {
    console.error('Error adding analytics entry:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

// Delete analytics entry
export async function deleteAnalyticsEntry(entryId: string, listingId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('analytics')
    .delete()
    .eq('id', entryId)

  if (error) {
    console.error('Error deleting analytics entry:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

// Update analytics entry
export async function updateAnalyticsEntry(
  entryId: string,
  listingId: string,
  data: { views?: number; clicks?: number }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('analytics')
    .update(data)
    .eq('id', entryId)

  if (error) {
    console.error('Error updating analytics entry:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}
