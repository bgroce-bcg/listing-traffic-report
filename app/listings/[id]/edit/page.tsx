import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditListingForm } from '@/components/listings/edit-listing-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch listing data
  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !listing) {
    notFound()
  }

  // Verify ownership
  if (listing.user_id !== user.id) {
    notFound()
  }

  return (
    <div className="container max-w-6xl py-8">
      <EditListingForm listingId={id} initialData={listing} />
    </div>
  )
}
