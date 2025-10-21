'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/database.types'

type PlatformMetricsInsert = Omit<Database['public']['Tables']['platform_metrics']['Insert'], 'listing_id'>
type FacebookMetricsInsert = Omit<Database['public']['Tables']['facebook_metrics']['Insert'], 'facebook_url_id'>

// Platform Metrics Actions
export async function addPlatformMetric(listingId: string, data: PlatformMetricsInsert) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('platform_metrics')
    .insert({
      listing_id: listingId,
      ...data,
    })

  if (error) {
    console.error('Error adding platform metric:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

export async function deletePlatformMetric(metricId: string, listingId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('platform_metrics')
    .delete()
    .eq('id', metricId)

  if (error) {
    console.error('Error deleting platform metric:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

export async function getPlatformMetrics(listingId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_metrics')
    .select('*')
    .eq('listing_id', listingId)
    .order('metric_date', { ascending: false })

  if (error) {
    console.error('Error fetching platform metrics:', error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

// Facebook Metrics Actions
export async function addFacebookMetric(facebookUrlId: string, listingId: string, data: FacebookMetricsInsert) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('facebook_metrics')
    .insert({
      facebook_url_id: facebookUrlId,
      ...data,
    })

  if (error) {
    console.error('Error adding Facebook metric:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

export async function deleteFacebookMetric(metricId: string, listingId: string) {
  const supabase = await createClient()

  const { error} = await supabase
    .from('facebook_metrics')
    .delete()
    .eq('id', metricId)

  if (error) {
    console.error('Error deleting Facebook metric:', error)
    return { error: error.message }
  }

  revalidatePath(`/listings/${listingId}`)
  return { success: true }
}

export async function getFacebookMetrics(listingId: string) {
  const supabase = await createClient()

  // Get all Facebook URLs for this listing
  const { data: fbUrls } = await supabase
    .from('facebook_urls')
    .select('id')
    .eq('listing_id', listingId)

  if (!fbUrls || fbUrls.length === 0) {
    return { data: [] }
  }

  const urlIds = fbUrls.map(url => url.id)

  const { data, error } = await supabase
    .from('facebook_metrics')
    .select(`
      *,
      facebook_url:facebook_urls(*)
    `)
    .in('facebook_url_id', urlIds)
    .order('metric_date', { ascending: false })

  if (error) {
    console.error('Error fetching Facebook metrics:', error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}
