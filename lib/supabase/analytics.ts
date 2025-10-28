import { createClient } from './client'
import { Analytics, AnalyticsInsert, AnalyticsUpdate } from './listings'

export interface AnalyticsWithDetails extends Analytics {
  listing_name?: string
  facebook_url?: string | null
}

export interface ListingAnalyticsSummary {
  listing_id: string
  listing_name: string
  total_views: number
  total_clicks: number
  facebook_url_count: number
}

export interface AnalyticsTrend {
  date: string
  views: number
  clicks: number
}

/**
 * Get all analytics for a listing with details
 * This pulls from the analytics table only (legacy data)
 */
export async function getListingAnalytics(listingId: string): Promise<AnalyticsWithDetails[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('analytics')
    .select(`
      *,
      listings(name),
      facebook_urls(facebook_url)
    `)
    .eq('listing_id', listingId)
    .order('metric_date', { ascending: false })

  if (error) throw error

  return (data || []).map(item => {
    const itemWithRelations = item as typeof item & {
      listings?: { name: string }
      facebook_urls?: { facebook_url: string }
    }
    return {
      ...item,
      listing_name: itemWithRelations.listings?.name,
      facebook_url: itemWithRelations.facebook_urls?.facebook_url,
    }
  })
}

/**
 * Get comprehensive analytics summary for a listing
 * Includes data from analytics, platform_metrics, and facebook_metrics tables
 */
export async function getListingAnalyticsSummary(listingId: string) {
  const supabase = createClient()

  // Get analytics table data
  const { data: analyticsData, error: analyticsError } = await supabase
    .from('analytics')
    .select('views, clicks')
    .eq('listing_id', listingId)

  if (analyticsError) throw analyticsError

  // Get platform_metrics data
  const { data: platformData, error: platformError } = await supabase
    .from('platform_metrics')
    .select('views, saves, shares, leads')
    .eq('listing_id', listingId)

  if (platformError) throw platformError

  // Get facebook_metrics data
  const { data: facebookData, error: facebookError } = await supabase
    .from('facebook_metrics')
    .select(`
      impressions,
      reach,
      post_clicks,
      facebook_urls!inner(listing_id)
    `)
    .eq('facebook_urls.listing_id', listingId)

  if (facebookError) throw facebookError

  // Calculate totals
  const analyticsViews = analyticsData?.reduce((sum, a) => sum + (a.views || 0), 0) ?? 0
  const analyticsClicks = analyticsData?.reduce((sum, a) => sum + (a.clicks || 0), 0) ?? 0

  const platformViews = platformData?.reduce((sum, p) => sum + (p.views || 0), 0) ?? 0
  const platformLeads = platformData?.reduce((sum, p) => sum + (p.leads || 0), 0) ?? 0

  const facebookImpressions = facebookData?.reduce((sum, f) => sum + (f.impressions || 0), 0) ?? 0
  const facebookClicks = facebookData?.reduce((sum, f) => sum + (f.post_clicks || 0), 0) ?? 0

  return {
    totalViews: analyticsViews + platformViews,
    totalClicks: analyticsClicks + platformLeads + facebookClicks,
    analytics: {
      views: analyticsViews,
      clicks: analyticsClicks,
    },
    platform: {
      views: platformViews,
      leads: platformLeads,
    },
    facebook: {
      impressions: facebookImpressions,
      clicks: facebookClicks,
    },
  }
}

/**
 * Create or update analytics record
 */
export async function upsertAnalytics(data: AnalyticsInsert): Promise<Analytics> {
  const supabase = createClient()

  const { data: result, error } = await supabase
    .from('analytics')
    .upsert(data, {
      onConflict: 'listing_id,facebook_url_id,metric_date',
    })
    .select()
    .single()

  if (error) throw error
  return result
}

/**
 * Update existing analytics record
 */
export async function updateAnalytics(id: string, updates: AnalyticsUpdate): Promise<Analytics> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('analytics')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete analytics record
 */
export async function deleteAnalytics(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('analytics')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get analytics summary for all listings
 */
export async function getAllListingsAnalyticsSummary(): Promise<ListingAnalyticsSummary[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      id,
      name,
      analytics(views, clicks),
      facebook_urls(id)
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (listingsError) throw listingsError

  return (listings || []).map(listing => {
    const listingWithRelations = listing as typeof listing & {
      analytics?: Array<{ views: number; clicks: number }>
      facebook_urls?: unknown[]
    }
    const analytics = listingWithRelations.analytics || []
    const facebookUrls = listingWithRelations.facebook_urls || []

    return {
      listing_id: listing.id,
      listing_name: listing.name,
      total_views: analytics.reduce((sum, a) => sum + (a.views || 0), 0),
      total_clicks: analytics.reduce((sum, a) => sum + (a.clicks || 0), 0),
      facebook_url_count: facebookUrls.length,
    }
  })
}

/**
 * Get analytics trend over time for all listings
 */
export async function getAnalyticsTrend(startDate?: string, endDate?: string): Promise<AnalyticsTrend[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (listingsError) throw listingsError

  if (!listings || listings.length === 0) {
    return []
  }

  const listingIds = listings.map(l => l.id)

  let query = supabase
    .from('analytics')
    .select('*')
    .in('listing_id', listingIds)
    .order('metric_date', { ascending: true })

  if (startDate) {
    query = query.gte('metric_date', startDate)
  }

  if (endDate) {
    query = query.lte('metric_date', endDate)
  }

  const { data: analytics, error: analyticsError } = await query

  if (analyticsError) throw analyticsError

  if (!analytics || analytics.length === 0) {
    return []
  }

  // Group by date and sum
  const analyticsByDate = analytics.reduce((acc, item) => {
    const date = item.metric_date

    if (!acc[date]) {
      acc[date] = {
        date,
        views: 0,
        clicks: 0,
      }
    }

    acc[date].views += item.views || 0
    acc[date].clicks += item.clicks || 0

    return acc
  }, {} as Record<string, AnalyticsTrend>)

  return Object.values(analyticsByDate).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get analytics trend for a single listing
 */
export async function getListingAnalyticsTrend(listingId: string, startDate?: string, endDate?: string): Promise<AnalyticsTrend[]> {
  const supabase = createClient()

  let query = supabase
    .from('analytics')
    .select('*')
    .eq('listing_id', listingId)
    .order('metric_date', { ascending: true })

  if (startDate) {
    query = query.gte('metric_date', startDate)
  }

  if (endDate) {
    query = query.lte('metric_date', endDate)
  }

  const { data: analytics, error } = await query

  if (error) throw error

  if (!analytics || analytics.length === 0) {
    return []
  }

  // Group by date
  const analyticsByDate = analytics.reduce((acc, item) => {
    const date = item.metric_date

    if (!acc[date]) {
      acc[date] = {
        date,
        views: 0,
        clicks: 0,
      }
    }

    acc[date].views += item.views || 0
    acc[date].clicks += item.clicks || 0

    return acc
  }, {} as Record<string, AnalyticsTrend>)

  return Object.values(analyticsByDate).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get overall metrics summary
 */
export async function getOverallAnalyticsSummary(startDate?: string, endDate?: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, is_active')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (listingsError) throw listingsError

  if (!listings || listings.length === 0) {
    return {
      total_views: 0,
      total_clicks: 0,
      active_listings: 0,
      total_listings: 0,
    }
  }

  const listingIds = listings.map(l => l.id)

  let query = supabase
    .from('analytics')
    .select('*')
    .in('listing_id', listingIds)

  if (startDate) {
    query = query.gte('metric_date', startDate)
  }

  if (endDate) {
    query = query.lte('metric_date', endDate)
  }

  const { data: analytics, error: analyticsError } = await query

  if (analyticsError) throw analyticsError

  const total_views = analytics?.reduce((sum, a) => sum + (a.views || 0), 0) ?? 0
  const total_clicks = analytics?.reduce((sum, a) => sum + (a.clicks || 0), 0) ?? 0
  const active_listings = listings.filter(l => l.is_active).length

  return {
    total_views,
    total_clicks,
    active_listings,
    total_listings: listings.length,
  }
}

/**
 * Export listing analytics to CSV
 */
export async function exportListingAnalyticsToCSV(
  listingId: string,
  listingName: string
) {
  const analytics = await getListingAnalytics(listingId)

  if (analytics.length === 0) {
    throw new Error('No analytics data to export')
  }

  const headers = ['Date', 'Views', 'Clicks', 'Facebook URL']
  const rows = analytics.map(a => [
    a.metric_date,
    a.views || 0,
    a.clicks || 0,
    a.facebook_url || 'General',
  ])

  const csvContent = [
    `Listing Analytics: ${listingName}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `listing-${listingId}-analytics-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
