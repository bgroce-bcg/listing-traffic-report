'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ListingForm } from '@/components/listings/listing-form'
import { createListing } from '@/lib/supabase/listings'
import { ListingFormData } from '@/lib/validations/listing'
import { Building2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewListingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: ListingFormData) {
    try {
      setIsLoading(true)

      await createListing({
        name: data.name,
        realtor_url: data.realtor_url || null,
        har_url: data.har_url || null,
        zillow_url: data.zillow_url || null,
        is_active: data.is_active,
      })

      toast.success('Listing created successfully!')
      router.push('/listings')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create listing')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link href="/listings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Listings
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create New Listing
            </CardTitle>
            <CardDescription>
              Add a new listing to track its analytics across multiple platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListingForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel="Create Listing"
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}