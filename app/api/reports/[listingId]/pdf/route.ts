import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportPDF } from '@/components/reports/report-pdf'
import { Tables } from '@/lib/supabase/database.types'
import { readFileSync } from 'fs'
import { join } from 'path'

type Listing = Tables<'listings'>
type FacebookUrl = Tables<'facebook_urls'>
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

  // Get all analytics for this listing
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

  return {
    listing: listing as Listing & { facebook_urls: FacebookUrl[] },
    analytics: (analytics || []) as AnalyticsWithFacebook[]
  }
}

function calculateMetrics(
  analytics: AnalyticsWithFacebook[],
  listing: Listing & { facebook_urls: FacebookUrl[] }
) {
  const totalViews = analytics.reduce((sum, a) => sum + a.views, 0)
  const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0)

  const facebookAnalytics = analytics.filter(a => a.facebook_url_id !== null)
  const generalAnalytics = analytics.filter(a => a.facebook_url_id === null)

  // Calculate Facebook metrics grouped by URL
  const facebookUrlMap = new Map<string, { views: number; clicks: number }>()

  facebookAnalytics.forEach(a => {
    if (a.facebook_url) {
      const url = a.facebook_url.facebook_url
      const existing = facebookUrlMap.get(url) || { views: 0, clicks: 0 }
      facebookUrlMap.set(url, {
        views: existing.views + a.views,
        clicks: existing.clicks + a.clicks
      })
    }
  })

  const facebookMetrics = Array.from(facebookUrlMap.entries()).map(([url, metrics]) => ({
    url,
    ...metrics
  }))

  // Calculate general listing metrics
  const generalViews = generalAnalytics.reduce((sum, a) => sum + a.views, 0)
  const sourcesCount = [listing.har_url, listing.realtor_url, listing.zillow_url].filter(Boolean).length
  const viewsPerSource = sourcesCount > 0 ? Math.floor(generalViews / sourcesCount) : 0

  return {
    totalViews,
    totalClicks,
    harViews: listing.har_url ? viewsPerSource : 0,
    realtorViews: listing.realtor_url ? viewsPerSource : 0,
    zillowViews: listing.zillow_url ? viewsPerSource : 0,
    facebookMetrics,
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

    const { listing, analytics } = data
    const metrics = calculateMetrics(analytics, listing)

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
