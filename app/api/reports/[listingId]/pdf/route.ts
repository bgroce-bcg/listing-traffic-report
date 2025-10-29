import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportPDF } from '@/components/reports/report-pdf'
import { Tables } from '@/lib/supabase/database.types'
import { readFileSync } from 'fs'
import { join } from 'path'

type Listing = Tables<'listings'>
type FacebookUrl = Tables<'facebook_urls'>
type FacebookPost = Tables<'facebook_posts'>
type Analytics = Tables<'analytics'>

interface AnalyticsWithFacebook extends Analytics {
  facebook_url?: FacebookUrl | null
}

async function getListingData(listingId: string) {
  const supabase = await createClient()

  // Get listing with facebook URLs
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select(`
      *,
      facebook_urls (*)
    `)
    .eq('id', listingId)
    .is('deleted_at', null)
    .single()

  if (listingError || !listing) {
    return null
  }

  // Get all analytics for this listing (legacy data)
  const { data: analytics, error: analyticsError } = await supabase
    .from('analytics')
    .select(`
      *,
      facebook_url:facebook_urls (*)
    `)
    .eq('listing_id', listingId)
    .order('metric_date', { ascending: false })

  if (analyticsError) {
    console.error('Analytics error:', analyticsError)
  }

  // Get platform metrics (Realtor, Zillow, HAR)
  const { data: platformMetrics, error: platformError } = await supabase
    .from('platform_metrics')
    .select('*')
    .eq('listing_id', listingId)
    .order('metric_date', { ascending: false })

  if (platformError) {
    console.error('Platform metrics error:', platformError)
  }

  // Get Facebook metrics (legacy)
  const { data: facebookMetrics, error: facebookError } = await supabase
    .from('facebook_metrics')
    .select(`
      *,
      facebook_url:facebook_urls!inner(facebook_url, listing_id)
    `)
    .eq('facebook_url.listing_id', listingId)
    .order('metric_date', { ascending: false })

  if (facebookError) {
    console.error('Facebook metrics error:', facebookError)
  }

  // Get Facebook posts (new simplified model)
  const { data: facebookPosts, error: facebookPostsError } = await supabase
    .from('facebook_posts')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })

  if (facebookPostsError) {
    console.error('Facebook posts error:', facebookPostsError)
  }

  return {
    listing: listing as Listing & { facebook_urls: FacebookUrl[] },
    analytics: (analytics || []) as AnalyticsWithFacebook[],
    platformMetrics: platformMetrics || [],
    facebookMetrics: facebookMetrics || [],
    facebookPosts: facebookPosts || []
  }
}

interface PlatformMetric {
  platform: string
  views: number | null
  leads: number | null
}

interface FacebookMetric {
  impressions: number | null
  reach: number | null
  post_clicks: number | null
  facebook_url?: {
    facebook_url: string
  }
}

function calculateMetrics(
  listing: Listing,
  platformMetrics: PlatformMetric[],
  facebookMetrics: FacebookMetric[],
  facebookPosts: FacebookPost[]
) {
  // Get HAR views from listing columns (simplified: total views only)
  const harViews = (listing.har_desktop_views || 0) + (listing.har_mobile_views || 0)

  // Calculate platform metrics by source (simplified: views only)
  const realtorViews = platformMetrics
    .filter(p => p.platform === 'realtor')
    .reduce((sum, p) => sum + (p.views || 0), 0)

  const zillowViews = platformMetrics
    .filter(p => p.platform === 'zillow')
    .reduce((sum, p) => sum + (p.views || 0), 0)

  // Calculate Facebook posts views (new simplified model)
  const facebookPostsViews = facebookPosts.reduce((sum, post) => sum + (post.views || 0), 0)
  const facebookPostsArray = facebookPosts.map(post => ({
    url: post.url,
    views: post.views
  }))

  // Calculate Facebook metrics grouped by URL (legacy - for backwards compatibility)
  const facebookUrlMap = new Map<string, { impressions: number; reach: number; clicks: number }>()

  facebookMetrics.forEach(fm => {
    if (fm.facebook_url?.facebook_url) {
      const url = fm.facebook_url.facebook_url
      const existing = facebookUrlMap.get(url) || { impressions: 0, reach: 0, clicks: 0 }
      facebookUrlMap.set(url, {
        impressions: existing.impressions + (fm.impressions || 0),
        reach: existing.reach + (fm.reach || 0),
        clicks: existing.clicks + (fm.post_clicks || 0)
      })
    }
  })

  const facebookMetricsArray = Array.from(facebookUrlMap.entries()).map(([url, metrics]) => ({
    url,
    ...metrics
  }))

  // Calculate total views from all sources INCLUDING Facebook posts
  const totalViews = harViews + realtorViews + zillowViews + facebookPostsViews

  // For backward compatibility with ReportPDF component, convert facebookPosts to facebookMetrics format
  const facebookMetricsForPDF = facebookPostsArray.map(post => ({
    url: post.url,
    views: post.views
  }))

  // Convert legacy facebookMetrics to expected format (use impressions as views for legacy data)
  const legacyFacebookMetricsForPDF = facebookMetricsArray.map(item => ({
    url: item.url,
    views: item.impressions // Use impressions as the view count for legacy data
  }))

  return {
    totalViews,
    totalClicks: 0, // No longer tracking clicks separately in the new model
    harViews,
    realtorViews,
    zillowViews,
    facebookPostsViews,
    facebookPosts: facebookPostsArray,
    facebookMetrics: facebookMetricsForPDF.length > 0 ? facebookMetricsForPDF : legacyFacebookMetricsForPDF, // Use new data if available, fall back to legacy
    reportDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
}

function getLogoDataUrl(): string {
  try {
    const logoPath = join(process.cwd(), 'public', 'mund_logo.png')
    const logoBuffer = readFileSync(logoPath)
    const base64Logo = logoBuffer.toString('base64')
    return `data:image/png;base64,${base64Logo}`
  } catch (error) {
    console.error('Error loading logo:', error)
    return ''
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params
    const data = await getListingData(listingId)

    if (!data) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const { listing, platformMetrics, facebookMetrics, facebookPosts } = data
    const metrics = calculateMetrics(listing, platformMetrics, facebookMetrics, facebookPosts)

    // Debug logging
    console.log('=== PDF API METRICS DEBUG ===')
    console.log('Listing ID:', listingId)
    console.log('Calculated metrics:', metrics)
    console.log('==============================')

    // Get logo as data URL
    const logoDataUrl = getLogoDataUrl()

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      ReportPDF({
        listing: {
          name: listing.name,
          image_url: listing.image_url
        },
        metrics,
        hasHar: !!listing.har_url,
        hasRealtor: !!listing.realtor_url,
        hasZillow: !!listing.zillow_url,
        logoUrl: logoDataUrl
      })
    )

    // Create filename from listing name
    const filename = `${listing.name.replace(/[^a-z0-9]/gi, '_')}_Traffic_Report.pdf`

    // Return PDF as download
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
