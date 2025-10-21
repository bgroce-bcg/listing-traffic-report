import { z } from 'zod'

// URL validation helper
const urlSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://'),
    { message: 'URL must start with http:// or https://' }
  )

// Facebook URL validation
const facebookUrlSchema = z
  .string()
  .min(1, 'Facebook URL is required')
  .refine(
    (val) => val.includes('facebook.com'),
    { message: 'Must be a valid Facebook URL' }
  )
  .refine(
    (val) => val.startsWith('http://') || val.startsWith('https://'),
    { message: 'URL must start with http:// or https://' }
  )

// Basic info schema
export const basicInfoSchema = z.object({
  name: z.string().min(1, 'Listing name is required'),
  realtor_url: urlSchema,
  har_url: urlSchema,
  zillow_url: urlSchema,
  is_active: z.boolean(),
})

export type BasicInfo = z.infer<typeof basicInfoSchema>

// HAR metrics schema
export const harMetricsSchema = z.object({
  har_desktop_views: z.number().int().min(0).optional().nullable(),
  har_mobile_views: z.number().int().min(0).optional().nullable(),
  har_photo_views: z.number().int().min(0).optional().nullable(),
  har_days_on_market: z.number().int().min(0).optional().nullable(),
  har_status: z.enum(['Active', 'Pending', 'Under Contract', 'Closed', 'Expired', '']).optional().nullable(),
})

export type HarMetrics = z.infer<typeof harMetricsSchema>

// Facebook URL schema
export const facebookUrlInputSchema = z.object({
  facebook_url: facebookUrlSchema,
})

export type FacebookUrlInput = z.infer<typeof facebookUrlInputSchema>

// Analytics entry schema
export const analyticsEntrySchema = z.object({
  metric_date: z.date(),
  facebook_url_id: z.string().nullable().optional(),
  views: z.number().int().min(0, 'Views must be 0 or greater').default(0),
  clicks: z.number().int().min(0, 'Clicks must be 0 or greater').default(0),
})

export type AnalyticsEntry = z.infer<typeof analyticsEntrySchema>

// Complete listing form schema
export const listingFormSchema = basicInfoSchema.merge(harMetricsSchema)

export type ListingForm = z.infer<typeof listingFormSchema>
