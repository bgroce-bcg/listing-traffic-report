import { createClient } from './client'
import { Tables, TablesInsert } from './database.types'

export type PlatformMetrics = Tables<'platform_metrics'>
export type PlatformMetricsInsert = TablesInsert<'platform_metrics'>

export type FacebookMetrics = Tables<'facebook_metrics'>
export type FacebookMetricsInsert = TablesInsert<'facebook_metrics'>

/**
 * Add platform metrics (Realtor.com or Zillow) for a listing
 */
export async function addPlatformMetrics(
  listingId: string,
  metrics: Omit<PlatformMetricsInsert, 'listing_id' | 'id'>
): Promise<PlatformMetrics> {
  const supabase = createClient()

  const upsertData = {
    listing_id: listingId,
    ...metrics,
  }

  console.log('[addPlatformMetrics] Upserting:', upsertData)

  const { data, error } = await supabase
    .from('platform_metrics')
    .upsert(upsertData, {
      onConflict: 'listing_id,platform,metric_date',
    })
    .select()
    .single()

  if (error) {
    console.error('[addPlatformMetrics] Error:', error)
    throw new Error(`Failed to add platform metrics: ${error.message}`)
  }

  console.log('[addPlatformMetrics] Success:', data)
  return data
}

/**
 * Get platform metrics for a listing
 */
export async function getPlatformMetrics(
  listingId: string,
  platform?: 'realtor' | 'zillow'
): Promise<PlatformMetrics[]> {
  const supabase = createClient()

  let query = supabase
    .from('platform_metrics')
    .select('*')
    .eq('listing_id', listingId)
    .order('metric_date', { ascending: false })

  if (platform) {
    query = query.eq('platform', platform)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Update platform metrics by ID
 */
export async function updatePlatformMetrics(
  id: string,
  metrics: Partial<Omit<PlatformMetricsInsert, 'listing_id' | 'id'>>
): Promise<PlatformMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('platform_metrics')
    .update(metrics)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete platform metrics by ID
 */
export async function deletePlatformMetrics(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('platform_metrics')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Add Facebook metrics for a specific Facebook post
 */
export async function addFacebookMetrics(
  facebookUrlId: string,
  metrics: Omit<FacebookMetricsInsert, 'facebook_url_id' | 'id'>
): Promise<FacebookMetrics> {
  const supabase = createClient()

  const upsertData = {
    facebook_url_id: facebookUrlId,
    ...metrics,
  }

  console.log('[addFacebookMetrics] Upserting:', upsertData)

  const { data, error } = await supabase
    .from('facebook_metrics')
    .upsert(upsertData, {
      onConflict: 'facebook_url_id,metric_date',
    })
    .select()
    .single()

  if (error) {
    console.error('[addFacebookMetrics] Error:', error)
    throw new Error(`Failed to add Facebook metrics: ${error.message}`)
  }

  console.log('[addFacebookMetrics] Success:', data)
  return data
}

/**
 * Get Facebook metrics for a specific Facebook URL
 */
export async function getFacebookMetrics(facebookUrlId: string): Promise<FacebookMetrics[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('facebook_metrics')
    .select('*')
    .eq('facebook_url_id', facebookUrlId)
    .order('metric_date', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all Facebook metrics for a listing (via facebook_urls)
 */
export async function getListingFacebookMetrics(listingId: string): Promise<
  Array<FacebookMetrics & { facebook_url?: { facebook_url: string } }>
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('facebook_metrics')
    .select(`
      *,
      facebook_url:facebook_urls!inner(facebook_url, listing_id)
    `)
    .eq('facebook_url.listing_id', listingId)
    .order('metric_date', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Update Facebook metrics by ID
 */
export async function updateFacebookMetrics(
  id: string,
  metrics: Partial<Omit<FacebookMetricsInsert, 'facebook_url_id' | 'id'>>
): Promise<FacebookMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('facebook_metrics')
    .update(metrics)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete Facebook metrics by ID
 */
export async function deleteFacebookMetrics(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('facebook_metrics')
    .delete()
    .eq('id', id)

  if (error) throw error
}
