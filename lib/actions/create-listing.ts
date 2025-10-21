'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createListing(name: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Create listing
  const { data, error } = await supabase
    .from('listings')
    .insert({
      name,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating listing:', error)
    return { error: error.message }
  }

  revalidatePath('/listings')
  return { data }
}
