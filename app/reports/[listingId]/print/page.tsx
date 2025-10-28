import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Tables } from '@/lib/supabase/database.types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PrintActions } from '@/components/reports/print-actions'
import {
  Eye,
  MousePointerClick,
  Calendar,
  Facebook,
  Globe
} from 'lucide-react'

type Listing = Tables<'listings'>
type FacebookUrl = Tables<'facebook_urls'>
type Analytics = Tables<'analytics'>

interface AnalyticsWithFacebook extends Analytics {
  facebook_url?: FacebookUrl | null
}

interface MetricsSummary {
  totalViews: number
  harViews: number
  realtorViews: number
  zillowViews: number
  facebookMetrics: Array<{
    url: string
    impressions: number
    reach: number
    clicks: number
  }>
  reportDate: string
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

  // Get Facebook metrics
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

  return {
    listing: listing as Listing & { facebook_urls: FacebookUrl[] },
    analytics: (analytics || []) as AnalyticsWithFacebook[],
    platformMetrics: platformMetrics || [],
    facebookMetrics: facebookMetrics || []
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
  facebookMetrics: FacebookMetric[]
): MetricsSummary {
  // Get HAR views from listing columns (simplified: total views only)
  const harViews = (listing.har_desktop_views || 0) + (listing.har_mobile_views || 0)

  // Calculate platform metrics by source (simplified: views only)
  const realtorViews = platformMetrics
    .filter(p => p.platform === 'realtor')
    .reduce((sum, p) => sum + (p.views || 0), 0)

  const zillowViews = platformMetrics
    .filter(p => p.platform === 'zillow')
    .reduce((sum, p) => sum + (p.views || 0), 0)

  // Calculate Facebook metrics grouped by URL (simplified: impressions, reach, clicks)
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

  // Calculate total views from all sources
  const totalViews = harViews + realtorViews + zillowViews

  return {
    totalViews,
    harViews,
    realtorViews,
    zillowViews,
    facebookMetrics: facebookMetricsArray,
    reportDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
}

export default async function PrintReportPage({
  params,
}: {
  params: Promise<{ listingId: string }>
}) {
  const { listingId } = await params
  const data = await getListingData(listingId)

  if (!data) {
    notFound()
  }

  const { listing, platformMetrics, facebookMetrics } = data
  const metrics = calculateMetrics(listing, platformMetrics, facebookMetrics)

  return (
    <div className="min-h-screen print:min-h-0 bg-gradient-to-br from-gray-50 to-white print:bg-white">
      {/* Letter-sized container */}
      <div className="max-w-[8.5in] mx-auto bg-white p-8 print:p-0 shadow-2xl print:shadow-none">
        {/* Premium Header with Gradient Background */}
        <div className="gradient-header -mx-8 -mt-8 px-8 pt-6 pb-4 mb-4 print:mx-0 print:mt-0 print:px-8 print:pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="relative w-24 h-12 mb-2">
                <Image
                  src="/mund_logo.png"
                  alt="Mund Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <h1 className="report-title text-2xl text-gray-900 mb-1">
                Property Traffic Report
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 report-subheading">
                <div className="w-6 h-0.5 bg-red-500"></div>
                <span>Performance Analysis</span>
              </div>
            </div>
            <div className="text-right bg-white/80 backdrop-blur-sm rounded-lg p-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5 report-subheading">
                <Calendar className="h-3 w-3" />
                <span>Report Date</span>
              </div>
              <p className="report-heading text-sm text-gray-900">
                {metrics.reportDate}
              </p>
            </div>
          </div>

          {/* Property Information with Image */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-gray-100">
              <p className="text-xs text-gray-500 mb-0.5 report-subheading">Property Address</p>
              <p className="report-heading text-sm text-gray-900">{listing.name}</p>
            </div>
            {listing.image_url && (
              <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 overflow-hidden">
                <div className="relative w-full h-24 print:h-32">
                  <Image
                    src={listing.image_url}
                    alt="Property"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            {!listing.image_url && (
              <div className="bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center h-24 print:h-32">
                <p className="text-xs text-gray-400">Property Image</p>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary - Hero Metrics */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="report-heading text-xl text-gray-900">Executive Summary</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Total Views */}
            <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-red-100 p-1.5 rounded-lg">
                    <Eye className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5 report-subheading">Total Views</p>
                    <p className="report-metric text-xl text-gray-900">
                      {metrics.totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Listing Sources Breakdown */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="report-heading text-xl text-gray-900">Platform Performance</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {listing.har_url && (
              <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="report-subheading text-xs text-gray-500 mb-0.5">Platform</p>
                      <h3 className="report-heading text-sm text-gray-900">HAR.com</h3>
                    </div>
                    <div className="bg-white rounded-lg p-1 shadow-sm">
                      <Globe className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 report-body">Views</span>
                      <span className="report-metric text-lg text-gray-900">{metrics.harViews.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {listing.realtor_url && (
              <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="report-subheading text-xs text-gray-500 mb-0.5">Platform</p>
                      <h3 className="report-heading text-sm text-gray-900">Realtor.com</h3>
                    </div>
                    <div className="bg-white rounded-lg p-1 shadow-sm">
                      <Globe className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 report-body">Views</span>
                      <span className="report-metric text-lg text-gray-900">{metrics.realtorViews.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {listing.zillow_url && (
              <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="report-subheading text-xs text-gray-500 mb-0.5">Platform</p>
                      <h3 className="report-heading text-sm text-gray-900">Zillow.com</h3>
                    </div>
                    <div className="bg-white rounded-lg p-1 shadow-sm">
                      <Globe className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 report-body">Views</span>
                      <span className="report-metric text-lg text-gray-900">{metrics.zillowViews.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {!listing.har_url && !listing.realtor_url && !listing.zillow_url && (
            <div className="text-center py-8 text-gray-500">
              No listing platform URLs configured
            </div>
          )}
        </div>

        {/* Facebook Performance */}
        {metrics.facebookMetrics.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
              <h2 className="report-heading text-xl text-gray-900">Social Media Performance</h2>
            </div>

            <div className="space-y-2">
              {metrics.facebookMetrics.map((fbMetric, index) => (
                <Card key={index} className="premium-card border-0 bg-gradient-subtle overflow-hidden">
                  <CardContent className="pt-2.5 pb-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="bg-blue-100 p-1.5 rounded-lg">
                          <Facebook className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant="outline" className="bg-white text-xs py-0">
                              Post {index + 1}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-md">
                            {fbMetric.url}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Eye className="h-3.5 w-3.5 text-gray-400" />
                            <p className="text-xs text-gray-500 report-subheading">Impressions</p>
                          </div>
                          <p className="report-metric text-base text-gray-900">
                            {fbMetric.impressions.toLocaleString()}
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Eye className="h-3.5 w-3.5 text-gray-400" />
                            <p className="text-xs text-gray-500 report-subheading">Reach</p>
                          </div>
                          <p className="report-metric text-base text-gray-900">
                            {fbMetric.reach.toLocaleString()}
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <MousePointerClick className="h-3.5 w-3.5 text-gray-400" />
                            <p className="text-xs text-gray-500 report-subheading">Clicks</p>
                          </div>
                          <p className="report-metric text-base text-gray-900">
                            {fbMetric.clicks.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}


        {/* Premium Footer */}
        <div className="mt-5 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 report-subheading mb-0.5">Report Generated</p>
              <p className="report-heading text-xs text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-0.5 bg-red-500 mb-1.5 mx-auto"></div>
              <p className="text-xs text-gray-500">Premium Traffic Report</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 report-subheading mb-0.5">Document</p>
              <p className="report-heading text-xs text-gray-900">Page 1 of 1</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-600 report-body text-center">
              This report contains proprietary traffic analytics data. All metrics are aggregated from verified listing platforms
              and social media channels. Data accuracy is subject to third-party reporting systems.
            </p>
          </div>
        </div>

        {/* Print Button - Hidden when printing */}
        <PrintActions listingId={listingId} />
      </div>
    </div>
  )
}
