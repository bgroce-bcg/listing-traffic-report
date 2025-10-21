import { createClient } from './client'
import { Tables, TablesInsert, TablesUpdate } from './database.types'

export type Listing = Tables<'listings'>
export type ListingInsert = TablesInsert<'listings'>
export type ListingUpdate = TablesUpdate<'listings'>

export type FacebookUrl = Tables<'facebook_urls'>
export type FacebookUrlInsert = TablesInsert<'facebook_urls'>

export type Analytics = Tables<'analytics'>
export type AnalyticsInsert = TablesInsert<'analytics'>
export type AnalyticsUpdate = TablesUpdate<'analytics'>

// Extended listing type with aggregated analytics
export interface ListingWithStats extends Listing {
  total_views?: number
  total_clicks?: number
  facebook_url_count?: number
}

/**
 * Get all listings for the current user
 */
export async function getListings(): Promise<ListingWithStats[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      analytics(views, clicks),
      facebook_urls(id)
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Aggregate analytics data
  return (data || []).map(listing => {
    const listingWithRelations = listing as typeof listing & {
      analytics?: Array<{ views: number; clicks: number }>
      facebook_urls?: unknown[]
    }
    const analytics = listingWithRelations.analytics || []
    const facebookUrls = listingWithRelations.facebook_urls || []

    return {
      ...listing,
      total_views: analytics.reduce((sum, a) => sum + (a.views || 0), 0),
      total_clicks: analytics.reduce((sum, a) => sum + (a.clicks || 0), 0),
      facebook_url_count: facebookUrls.length,
    }
  })
}

/**
 * Get a single listing by ID
 */
export async function getListing(id: string): Promise<Listing | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

/**
 * Create a new listing
 */
export async function createListing(listing: Omit<ListingInsert, 'user_id' | 'id'>): Promise<Listing> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('listings')
    .insert({
      ...listing,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing listing
 */
export async function updateListing(id: string, updates: ListingUpdate): Promise<Listing> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete a listing
 */
export async function deleteListing(id: string): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('listings')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Get all Facebook URLs for a listing
 */
export async function getFacebookUrls(listingId: string): Promise<FacebookUrl[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('facebook_urls')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Add a Facebook URL to a listing
 */
export async function addFacebookUrl(listingId: string, facebookUrl: string): Promise<FacebookUrl> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('facebook_urls')
    .insert({
      listing_id: listingId,
      facebook_url: facebookUrl,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a Facebook URL
 */
export async function deleteFacebookUrl(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('facebook_urls')
    .delete()
    .eq('id', id)

  if (error) throw error
}
