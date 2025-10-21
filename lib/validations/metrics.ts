import { z } from 'zod'

export const manualMetricsSchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
  metric_date: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      return selectedDate <= today
    },
    { message: 'Date cannot be in the future' }
  ),
  phone_calls: z.number().int().min(0, 'Must be 0 or greater').nullable().optional(),
  showings: z.number().int().min(0, 'Must be 0 or greater').nullable().optional(),
  inquiries: z.number().int().min(0, 'Must be 0 or greater').nullable().optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional().nullable(),
})

export type ManualMetricsFormData = z.infer<typeof manualMetricsSchema>