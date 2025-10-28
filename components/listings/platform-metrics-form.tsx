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
import { Loader2, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import { addPlatformMetrics } from '@/lib/supabase/manual-data'
import { platformMetricsSchema, PlatformMetricsFormValues } from '@/lib/validations/manual-data'

interface PlatformMetricsFormProps {
  listingId: string
  onSuccess: () => void
}

export function PlatformMetricsForm({ listingId, onSuccess }: PlatformMetricsFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PlatformMetricsFormValues>({
    resolver: zodResolver(platformMetricsSchema),
    defaultValues: {
      platform: 'realtor',
      metric_date: new Date().toISOString().split('T')[0],
      views: undefined,
    },
  })

  const selectedPlatform = watch('platform')

  const onSubmit = async (data: PlatformMetricsFormValues) => {
    setIsSubmitting(true)
    try {
      // Convert empty strings to null
      const cleanedData = {
        ...data,
        views: data.views ?? null,
      }

      console.log('Submitting platform metrics:', { listingId, cleanedData })
      await addPlatformMetrics(listingId, cleanedData)
      toast.success(`${data.platform === 'realtor' ? 'Realtor.com' : 'Zillow'} metrics saved successfully`)
      setOpen(false)
      reset()
      onSuccess()
    } catch (error) {
      console.error('Platform metrics submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add platform metrics'
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

  const platformLabel = selectedPlatform === 'realtor' ? 'Realtor.com' : 'Zillow'

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <BarChart2 className="mr-2 h-4 w-4" />
        Log Platform Metrics
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Platform Metrics</DialogTitle>
            <DialogDescription>
              Record views from Realtor.com or Zillow for a specific date. If metrics already exist for this date, they will be updated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={selectedPlatform}
                onValueChange={(value) => setValue('platform', value as 'realtor' | 'zillow')}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtor">Realtor.com</SelectItem>
                  <SelectItem value="zillow">Zillow</SelectItem>
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-sm text-destructive">{errors.platform.message}</p>
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
              <Label htmlFor="views">Views</Label>
              <Input
                id="views"
                type="number"
                min="0"
                placeholder="e.g., 150"
                {...register('views', { valueAsNumber: true })}
              />
              {errors.views && (
                <p className="text-sm text-destructive">{errors.views.message}</p>
              )}
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p>Recording views for <strong>{platformLabel}</strong>. Views field is optional.</p>
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
                Save Metrics
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
