'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { listingFormSchema, ListingFormData } from '@/lib/validations/listing'
import { Loader2 } from 'lucide-react'

interface ListingFormProps {
  onSubmit: (data: ListingFormData) => Promise<void>
  defaultValues?: Partial<ListingFormData>
  isLoading?: boolean
  submitLabel?: string
}

export function ListingForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = 'Create Listing',
}: ListingFormProps) {
  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      is_active: true,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Listing Information</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listing Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 123 Main St, Houston TX"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-foreground/70">
                  Give this listing a descriptive name for easy identification
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Listing</FormLabel>
                  <FormDescription className="text-foreground/70">
                    Enable tracking for this listing
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Platform URLs Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Platform URLs</h3>
          <p className="text-sm text-foreground/70">
            Add links to this listing on various real estate platforms (all optional)
          </p>

          <FormField
            control={form.control}
            name="realtor_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Realtor.com URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.realtor.com/..."
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="har_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HAR.com URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.har.com/..."
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zillow_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zillow URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.zillow.com/..."
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset Form
          </Button>
        </div>
      </form>
    </Form>
  )
}
