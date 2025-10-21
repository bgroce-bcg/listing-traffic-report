'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UseFormReturn } from 'react-hook-form'
import type { ListingForm } from '@/lib/validations/listing-schema'

interface HarMetricsSectionProps {
  form: UseFormReturn<ListingForm>
}

export function HarMetricsSection({ form }: HarMetricsSectionProps) {
  const { register, setValue, watch, formState: { errors } } = form
  const status = watch('har_status')

  return (
    <Card>
      <CardHeader>
        <CardTitle>HAR.com Metrics Snapshot</CardTitle>
        <CardDescription>
          Enter the current metrics from HAR.com for this listing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Desktop Views */}
          <div className="space-y-2">
            <Label htmlFor="har_desktop_views" className="text-sm font-medium">
              Desktop Views
            </Label>
            <Input
              id="har_desktop_views"
              type="number"
              min="0"
              placeholder="0"
              {...register('har_desktop_views', {
                setValueAs: (v) => v === '' ? null : parseInt(v)
              })}
              className={errors.har_desktop_views ? 'border-destructive' : ''}
            />
            {errors.har_desktop_views && (
              <p className="text-xs text-destructive">{errors.har_desktop_views.message}</p>
            )}
          </div>

          {/* Mobile Views */}
          <div className="space-y-2">
            <Label htmlFor="har_mobile_views" className="text-sm font-medium">
              Mobile Views
            </Label>
            <Input
              id="har_mobile_views"
              type="number"
              min="0"
              placeholder="0"
              {...register('har_mobile_views', {
                setValueAs: (v) => v === '' ? null : parseInt(v)
              })}
              className={errors.har_mobile_views ? 'border-destructive' : ''}
            />
            {errors.har_mobile_views && (
              <p className="text-xs text-destructive">{errors.har_mobile_views.message}</p>
            )}
          </div>

          {/* Photo Views */}
          <div className="space-y-2">
            <Label htmlFor="har_photo_views" className="text-sm font-medium">
              Photo Gallery Views
            </Label>
            <Input
              id="har_photo_views"
              type="number"
              min="0"
              placeholder="0"
              {...register('har_photo_views', {
                setValueAs: (v) => v === '' ? null : parseInt(v)
              })}
              className={errors.har_photo_views ? 'border-destructive' : ''}
            />
            {errors.har_photo_views && (
              <p className="text-xs text-destructive">{errors.har_photo_views.message}</p>
            )}
          </div>

          {/* Days on Market */}
          <div className="space-y-2">
            <Label htmlFor="har_days_on_market" className="text-sm font-medium">
              Days on Market
            </Label>
            <Input
              id="har_days_on_market"
              type="number"
              min="0"
              placeholder="0"
              {...register('har_days_on_market', {
                setValueAs: (v) => v === '' ? null : parseInt(v)
              })}
              className={errors.har_days_on_market ? 'border-destructive' : ''}
            />
            {errors.har_days_on_market && (
              <p className="text-xs text-destructive">{errors.har_days_on_market.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="har_status" className="text-sm font-medium">
              Listing Status
            </Label>
            <Select
              value={status || ''}
              onValueChange={(value) => setValue('har_status', value as 'Active' | 'Pending' | 'Under Contract' | 'Closed' | 'Expired' | '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Contract">Under Contract</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          These metrics represent a snapshot in time from HAR.com. Update them whenever you need to capture current values for your report.
        </p>
      </CardContent>
    </Card>
  )
}
