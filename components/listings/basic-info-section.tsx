'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import type { ListingForm } from '@/lib/validations/listing-schema'

interface BasicInfoSectionProps {
  form: UseFormReturn<ListingForm>
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const { register, formState: { errors } } = form

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Enter the listing name and property URLs for tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Listing Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Listing Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., 123 Main St, Houston TX"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* URL Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Realtor.com URL */}
          <div className="space-y-2">
            <Label htmlFor="realtor_url" className="flex items-center gap-2 text-sm font-medium">
              <ExternalLink className="h-4 w-4" />
              Realtor.com URL
            </Label>
            <Input
              id="realtor_url"
              type="url"
              placeholder="https://www.realtor.com/..."
              {...register('realtor_url')}
              className={errors.realtor_url ? 'border-destructive' : ''}
            />
            {errors.realtor_url && (
              <p className="text-xs text-destructive">{errors.realtor_url.message}</p>
            )}
          </div>

          {/* HAR URL */}
          <div className="space-y-2">
            <Label htmlFor="har_url" className="flex items-center gap-2 text-sm font-medium">
              <ExternalLink className="h-4 w-4" />
              HAR.com URL
            </Label>
            <Input
              id="har_url"
              type="url"
              placeholder="https://www.har.com/..."
              {...register('har_url')}
              className={errors.har_url ? 'border-destructive' : ''}
            />
            {errors.har_url && (
              <p className="text-xs text-destructive">{errors.har_url.message}</p>
            )}
          </div>

          {/* Zillow URL */}
          <div className="space-y-2">
            <Label htmlFor="zillow_url" className="flex items-center gap-2 text-sm font-medium">
              <ExternalLink className="h-4 w-4" />
              Zillow URL
            </Label>
            <Input
              id="zillow_url"
              type="url"
              placeholder="https://www.zillow.com/..."
              {...register('zillow_url')}
              className={errors.zillow_url ? 'border-destructive' : ''}
            />
            {errors.zillow_url && (
              <p className="text-xs text-destructive">{errors.zillow_url.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
