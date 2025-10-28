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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Facebook } from 'lucide-react'
import { toast } from 'sonner'
import { addFacebookMetrics } from '@/lib/supabase/manual-data'
import { FacebookUrl } from '@/lib/supabase/listings'
import { facebookMetricsSchema, FacebookMetricsFormValues } from '@/lib/validations/manual-data'

interface FacebookMetricsFormProps {
  facebookUrls: FacebookUrl[]
  onSuccess: () => void
}

export function FacebookMetricsForm({ facebookUrls, onSuccess }: FacebookMetricsFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FacebookMetricsFormValues>({
    resolver: zodResolver(facebookMetricsSchema),
    defaultValues: {
      facebook_url_id: '',
      metric_date: new Date().toISOString().split('T')[0],
      impressions: undefined,
      reach: undefined,
      post_clicks: undefined,
    },
  })

  const selectedFacebookUrlId = watch('facebook_url_id')

  const onSubmit = async (data: FacebookMetricsFormValues) => {
    setIsSubmitting(true)
    try {
      // Convert empty strings to null
      const cleanedData = {
        metric_date: data.metric_date,
        impressions: data.impressions ?? null,
        reach: data.reach ?? null,
        post_clicks: data.post_clicks ?? null,
      }

      console.log('Submitting Facebook metrics:', { facebook_url_id: data.facebook_url_id, cleanedData })
      await addFacebookMetrics(data.facebook_url_id, cleanedData)
      toast.success('Facebook metrics saved successfully')
      setOpen(false)
      reset()
      onSuccess()
    } catch (error) {
      console.error('Facebook metrics submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add Facebook metrics'
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

  const selectedUrl = facebookUrls.find((url) => url.id === selectedFacebookUrlId)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        disabled={facebookUrls.length === 0}
      >
        <Facebook className="mr-2 h-4 w-4" />
        Log FB Metrics
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Facebook Post Metrics</DialogTitle>
            <DialogDescription>
              Record basic engagement metrics from Facebook for a specific post and date. If metrics already exist for this date, they will be updated.
            </DialogDescription>
          </DialogHeader>

          {facebookUrls.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p className="mb-2">No Facebook URLs added yet.</p>
              <p>Please add a Facebook post URL first before logging metrics.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url_id">Facebook Post</Label>
                <Select
                  value={selectedFacebookUrlId}
                  onValueChange={(value) => setValue('facebook_url_id', value)}
                >
                  <SelectTrigger id="facebook_url_id">
                    <SelectValue placeholder="Select a Facebook post" />
                  </SelectTrigger>
                  <SelectContent>
                    {facebookUrls.map((url) => (
                      <SelectItem key={url.id} value={url.id}>
                        <span className="truncate max-w-[300px] block">
                          {url.facebook_url}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.facebook_url_id && (
                  <p className="text-sm text-destructive">{errors.facebook_url_id.message}</p>
                )}
                {selectedUrl && (
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedUrl.facebook_url}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric_date">Date</Label>
                <Input
                  id="metric_date"
                  type="date"
                  {...register('metric_date')}
                />
                {errors.metric_date && (
                  <p className="text-sm text-destructive">{errors.metric_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="impressions">Impressions</Label>
                <Input
                  id="impressions"
                  type="number"
                  min="0"
                  placeholder="e.g., 500"
                  {...register('impressions', { valueAsNumber: true })}
                />
                {errors.impressions && (
                  <p className="text-sm text-destructive">{errors.impressions.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reach">Reach</Label>
                <Input
                  id="reach"
                  type="number"
                  min="0"
                  placeholder="e.g., 400"
                  {...register('reach', { valueAsNumber: true })}
                />
                {errors.reach && (
                  <p className="text-sm text-destructive">{errors.reach.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="post_clicks">Post Clicks</Label>
                <Input
                  id="post_clicks"
                  type="number"
                  min="0"
                  placeholder="e.g., 25"
                  {...register('post_clicks', { valueAsNumber: true })}
                />
                {errors.post_clicks && (
                  <p className="text-sm text-destructive">{errors.post_clicks.message}</p>
                )}
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                <p>All metric fields are optional. Enter only the metrics you have available.</p>
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
                  Log Metrics
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
