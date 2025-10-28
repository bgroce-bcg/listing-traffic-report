import { z } from 'zod'

/**
 * Validation schema for HAR data update form
 * Updates listing fields directly (total views only)
 */
export const harDataSchema = z.object({
  har_views: z.number().int().min(0).optional().or(z.nan().transform(() => undefined)),
})

export type HarDataFormValues = z.infer<typeof harDataSchema>

/**
 * Validation schema for platform metrics form (Realtor.com/Zillow)
 * Uses platform_metrics table - simplified to only collect views
 */
export const platformMetricsSchema = z.object({
  platform: z.enum(['realtor', 'zillow']),
  metric_date: z.string().min(1, 'Date is required'),
  views: z.number().int().min(0).optional().or(z.nan().transform(() => undefined)),
})

export type PlatformMetricsFormValues = z.infer<typeof platformMetricsSchema>

/**
 * Validation schema for Facebook URL management
 * Uses facebook_urls table
 */
export const facebookUrlSchema = z.object({
  facebook_url: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine(
      (url) => url.includes('facebook.com') || url.includes('fb.com'),
      'Must be a valid Facebook URL'
    ),
})

export type FacebookUrlFormValues = z.infer<typeof facebookUrlSchema>

/**
 * Validation schema for Facebook metrics logging
 * Uses facebook_metrics table - simplified to essential metrics only
 */
export const facebookMetricsSchema = z.object({
  facebook_url_id: z.string().min(1, 'Please select a Facebook post'),
  metric_date: z.string().min(1, 'Date is required'),
  impressions: z.number().int().min(0).optional().or(z.nan().transform(() => undefined)),
  reach: z.number().int().min(0).optional().or(z.nan().transform(() => undefined)),
  post_clicks: z.number().int().min(0).optional().or(z.nan().transform(() => undefined)),
})

export type FacebookMetricsFormValues = z.infer<typeof facebookMetricsSchema>
