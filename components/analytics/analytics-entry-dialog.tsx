'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { analyticsFormSchema, AnalyticsFormData } from '@/lib/validations/listing'
import { Loader2 } from 'lucide-react'
import { FacebookUrl } from '@/lib/supabase/listings'

interface AnalyticsEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AnalyticsFormData) => Promise<void>
  listingName: string
  facebookUrls?: FacebookUrl[]
  defaultValues?: Partial<AnalyticsFormData>
}

export function AnalyticsEntryDialog({
  open,
  onOpenChange,
  onSubmit,
  listingName,
  facebookUrls = [],
  defaultValues,
}: AnalyticsEntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AnalyticsFormData>({
    resolver: zodResolver(analyticsFormSchema),
    defaultValues: {
      metric_date: new Date().toISOString().split('T')[0],
      views: 0,
      clicks: 0,
      facebook_url_id: null,
      ...defaultValues,
    },
  })

  const handleSubmit = async (data: AnalyticsFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Analytics Data</DialogTitle>
          <DialogDescription className="text-foreground/70">
            Log views and clicks for {listingName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="metric_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="views"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Views</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clicks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clicks</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {facebookUrls.length > 0 && (
              <FormField
                control={form.control}
                name="facebook_url_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Post (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                      defaultValue={field.value ?? 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Facebook post" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">General (No specific post)</SelectItem>
                        {facebookUrls.map((url) => (
                          <SelectItem key={url.id} value={url.id}>
                            {url.facebook_url.length > 50
                              ? url.facebook_url.substring(0, 50) + '...'
                              : url.facebook_url}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-foreground/70">
                      Associate this data with a specific Facebook post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {defaultValues ? 'Update' : 'Add'} Analytics
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
