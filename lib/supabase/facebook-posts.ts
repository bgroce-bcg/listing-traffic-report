'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'

export type FacebookPost = Database['public']['Tables']['facebook_posts']['Row']
export type FacebookPostInsert = Database['public']['Tables']['facebook_posts']['Insert']
export type FacebookPostUpdate = Database['public']['Tables']['facebook_posts']['Update']

/**
 * Get all Facebook posts for a listing
 */
export async function getFacebookPosts(listingId: string): Promise<FacebookPost[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('facebook_posts')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching Facebook posts:', error)
    throw new Error('Failed to fetch Facebook posts')
  }

  return data || []
}

/**
 * Add a new Facebook post
 */
export async function addFacebookPost(
  listingId: string,
  url: string,
  views: number = 0
): Promise<FacebookPost> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('facebook_posts')
    .insert({
      listing_id: listingId,
      url: url.trim(),
      views,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding Facebook post:', error)
    throw new Error('Failed to add Facebook post')
  }

  return data
}

/**
 * Update a Facebook post (typically to change views count)
 */
export async function updateFacebookPost(
  id: string,
  updates: { url?: string; views?: number }
): Promise<FacebookPost> {
  const supabase = await createClient()

  const updateData: FacebookPostUpdate = {}
  if (updates.url !== undefined) {
    updateData.url = updates.url.trim()
  }
  if (updates.views !== undefined) {
    updateData.views = updates.views
  }

  const { data, error } = await supabase
    .from('facebook_posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating Facebook post:', error)
    throw new Error('Failed to update Facebook post')
  }

  return data
}

/**
 * Delete a Facebook post
 */
export async function deleteFacebookPost(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('facebook_posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting Facebook post:', error)
    throw new Error('Failed to delete Facebook post')
  }
}

/**
 * Get total views from all Facebook posts for a listing
 */
export async function getFacebookPostsTotalViews(listingId: string): Promise<number> {
  const posts = await getFacebookPosts(listingId)
  return posts.reduce((total, post) => total + (post.views || 0), 0)
}
