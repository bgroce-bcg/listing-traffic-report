'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { updateListing, Listing } from '@/lib/supabase/listings'
import { harDataSchema, HarDataFormValues } from '@/lib/validations/manual-data'

interface HarDataFormProps {
  listing: Listing
  onSuccess: () => void
}

export function HarDataForm({ listing, onSuccess }: HarDataFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate current total views
  const currentViews = (listing.har_desktop_views ?? 0) + (listing.har_mobile_views ?? 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HarDataFormValues>({
    resolver: zodResolver(harDataSchema),
    defaultValues: {
      har_views: currentViews || undefined,
    },
  })

  const onSubmit = async (data: HarDataFormValues) => {
    setIsSubmitting(true)
    try {
      // Store views in har_desktop_views, set mobile to 0
      const cleanedData = {
        har_desktop_views: data.har_views ?? null,
        har_mobile_views: 0,
      }

      console.log('Updating HAR data:', { listingId: listing.id, cleanedData })
      await updateListing(listing.id, cleanedData)
      toast.success('HAR data updated successfully')
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error('HAR data update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update HAR data'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      reset()
    }
    setOpen(newOpen)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)} variant="outline" size="sm">
          <TrendingUp className="mr-2 h-4 w-4" />
          Update HAR Data
        </Button>
        {currentViews > 0 && (
          <span className="text-sm text-muted-foreground">
            Current: {currentViews.toLocaleString()} views
          </span>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update HAR Traffic Data</DialogTitle>
            <DialogDescription>
              Update total views from HAR.com for this listing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="har_views">Total Views</Label>
              <Input
                id="har_views"
                type="number"
                min="0"
                placeholder="e.g., 1234"
                {...register('har_views', { valueAsNumber: true })}
              />
              {errors.har_views && (
                <p className="text-sm text-destructive">{errors.har_views.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Data
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
