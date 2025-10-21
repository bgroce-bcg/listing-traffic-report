import { z } from 'zod'

// Simplified listing schema for new database structure
export const listingFormSchema = z.object({
  name: z.string().min(1, 'Listing name is required').max(255, 'Name must be less than 255 characters'),
  realtor_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  har_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  zillow_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  is_active: z.boolean(),
})

export type ListingFormData = z.infer<typeof listingFormSchema>

// Facebook URL validation schema
export const facebookUrlSchema = z.object({
  facebook_url: z.string().url('Must be a valid URL').refine(
    (url) => url.includes('facebook.com') || url.includes('fb.com'),
    'Must be a Facebook URL'
  ),
})

export type FacebookUrlData = z.infer<typeof facebookUrlSchema>

// Analytics data schema
export const analyticsFormSchema = z.object({
  metric_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  views: z.number().int().min(0, 'Views must be a positive number'),
  clicks: z.number().int().min(0, 'Clicks must be a positive number'),
  facebook_url_id: z.string().uuid().optional().nullable(),
})

export type AnalyticsFormData = z.infer<typeof analyticsFormSchema>
