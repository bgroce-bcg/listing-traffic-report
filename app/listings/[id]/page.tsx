'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getListing, getFacebookUrls, addFacebookUrl, deleteFacebookUrl, Listing, FacebookUrl } from '@/lib/supabase/listings'
import { getListingAnalytics, getListingAnalyticsSummary, AnalyticsWithDetails } from '@/lib/supabase/analytics'
import { Building2, ArrowLeft, Edit, BarChart3, ExternalLink, Eye, FileDown, Printer } from 'lucide-react'
import { FacebookUrlsManager } from '@/components/listings/facebook-urls-manager'
import { ImageUpload } from '@/components/listings/image-upload'
import { ManualDataEntry } from '@/components/listings/manual-data-entry'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ListingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [facebookUrls, setFacebookUrls] = useState<FacebookUrl[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsWithDetails[]>([])
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalViews: 0,
    platform: { views: 0 },
    facebook: { impressions: 0, clicks: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      const [listingData, fbUrls, analyticsData, summary] = await Promise.all([
        getListing(listingId),
        getFacebookUrls(listingId),
        getListingAnalytics(listingId),
        getListingAnalyticsSummary(listingId),
      ])

      if (!listingData) {
        setError('Listing not found')
        return
      }

      setListing(listingData)
      setFacebookUrls(fbUrls)
      setAnalytics(analyticsData)
      setAnalyticsSummary(summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddFacebookUrl(url: string) {
    await addFacebookUrl(listingId, url)
  }

  async function handleDeleteFacebookUrl(id: string) {
    await deleteFacebookUrl(id)
  }

  async function handleRefresh() {
    await loadData()
  }

  async function handleGenerateReport() {
    if (!listing) return

    try {
      setIsGeneratingReport(true)

      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const margin = 16
      let y = margin

      doc.setFontSize(18)
      doc.text('Listing Traffic Report', margin, y)

      doc.setFontSize(12)
      y += 10
      doc.text(`Name: ${listing.name ?? 'N/A'}`, margin, y)
      y += 6
      doc.text(`Status: ${listing.is_active ? 'Active' : 'Inactive'}`, margin, y)
      y += 6
      doc.text(`Created: ${new Date(listing.created_at).toLocaleDateString()}`, margin, y)
      y += 10

      const stringFromListing = (key: string) => {
        const value = (listing as Record<string, unknown>)[key]
        return typeof value === 'string' ? value : undefined
      }

      const addressLines = [
        stringFromListing('address'),
        stringFromListing('city'),
        stringFromListing('state'),
        stringFromListing('zip_code'),
      ].filter(Boolean) as string[]

      if (addressLines.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Address', margin, y)
        doc.setFont('helvetica', 'normal')
        y += 6
        addressLines.forEach((line) => {
          doc.text(line, margin, y)
          y += 6
        })
        y += 4
      }

      doc.setFont('helvetica', 'bold')
      doc.text('Platform URLs', margin, y)
      doc.setFont('helvetica', 'normal')
      y += 6

      const platformUrls: Array<{ label: string; value?: string | null }> = [
        { label: 'Realtor.com', value: listing.realtor_url },
        { label: 'HAR.com', value: listing.har_url },
        { label: 'Zillow', value: listing.zillow_url },
      ]

      platformUrls.forEach(({ label, value }) => {
        doc.text(`${label}: ${value ?? 'Not provided'}`, margin, y)
        y += 6
      })

      y += 4
      doc.setFont('helvetica', 'bold')
      doc.text('Traffic Summary', margin, y)
      doc.setFont('helvetica', 'normal')
      y += 6
      doc.text(`Total Views: ${totalViews.toLocaleString()}`, margin, y)
      y += 10

      doc.setFont('helvetica', 'bold')
      doc.text('Platform Breakdown', margin, y)
      doc.setFont('helvetica', 'normal')
      y += 6

      const breakdown: string[] = []

      // HAR.com views
      if (listing.har_desktop_views || listing.har_mobile_views) {
        const harTotal = (listing.har_desktop_views || 0) + (listing.har_mobile_views || 0)
        breakdown.push(`HAR.com: ${harTotal.toLocaleString()} views (Desktop: ${(listing.har_desktop_views || 0).toLocaleString()}, Mobile: ${(listing.har_mobile_views || 0).toLocaleString()})`)
      }

      // Platform metrics views
      if (analyticsSummary.platform.views > 0) {
        breakdown.push(`Realtor/Zillow: ${analyticsSummary.platform.views.toLocaleString()} views`)
      }

      // Facebook metrics
      if (analyticsSummary.facebook.impressions > 0) {
        breakdown.push(`Facebook: ${analyticsSummary.facebook.impressions.toLocaleString()} impressions, ${analyticsSummary.facebook.clicks.toLocaleString()} clicks`)
      }

      if (breakdown.length === 0) {
        doc.text('No traffic data available.', margin, y)
        y += 6
      } else {
        breakdown.forEach((line) => {
          doc.text(line, margin, y)
          y += 6
        })
      }

      const sanitizedName = listing.name?.trim().replace(/\s+/g, '-').toLowerCase() || 'listing'
      doc.save(`${sanitizedName}-report.pdf`)
      toast.success('Report generated')
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const totalViews = analyticsSummary.totalViews
  const recentAnalytics = analytics.slice(0, 7)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container max-w-6xl py-8">
          <div className="mb-6">
            <Link href="/listings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listings
              </Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !listing) {
    return (
      <ProtectedRoute>
        <div className="container max-w-6xl py-8">
          <div className="mb-6">
            <Link href="/listings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listings
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-foreground/70 mb-4">{error || 'The listing you are looking for does not exist.'}</p>
              <Button onClick={() => router.push('/listings')}>Back to Listings</Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl py-8">
        <div className="mb-6">
          <Link href="/listings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Listings
            </Button>
          </Link>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{listing.name}</h1>
              <Badge variant={listing.is_active ? 'default' : 'secondary'}>
                {listing.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-foreground/70">Created {new Date(listing.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/listings/${listing.id}/analytics`}>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href={`/reports/${listing.id}/print`}>
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                View Print Report
              </Button>
            </Link>
            <Button variant="outline" onClick={handleGenerateReport} disabled={isGeneratingReport}>
              <FileDown className="mr-2 h-4 w-4" />
              {isGeneratingReport ? 'Generating…' : 'Generate Report'}
            </Button>
            <Link href={`/listings/${listing.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Platform URLs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Platform URLs
              </CardTitle>
              <CardDescription>External listing links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {listing.realtor_url && (
                <a
                  href={listing.realtor_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="font-medium">Realtor.com</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {listing.har_url && (
                <a
                  href={listing.har_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="font-medium">HAR.com</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {listing.zillow_url && (
                <a
                  href={listing.zillow_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="font-medium">Zillow</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {!listing.realtor_url && !listing.har_url && !listing.zillow_url && (
                <p className="text-sm text-foreground/60">No platform URLs added</p>
              )}
            </CardContent>
          </Card>

          {/* Analytics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Summary</CardTitle>
              <CardDescription>Overall view metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-foreground/60 mb-1">Total Views</span>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-foreground/60" />
                    <span className="text-2xl font-bold">{totalViews.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Image Upload */}
        <div className="mb-6">
          <ImageUpload
            listingId={listing.id}
            currentImageUrl={listing.image_url}
            onUploadSuccess={handleRefresh}
            onDeleteSuccess={handleRefresh}
          />
        </div>

        {/* Manual Data Entry Forms */}
        <div className="mb-6">
          <ManualDataEntry
            listing={listing}
            facebookUrls={facebookUrls}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Facebook URLs Manager */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <FacebookUrlsManager
              listingId={listing.id}
              facebookUrls={facebookUrls}
              onAdd={handleAddFacebookUrl}
              onDelete={handleDeleteFacebookUrl}
              onRefresh={handleRefresh}
            />
          </CardContent>
        </Card>

        {/* Recent Analytics */}
        {recentAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Analytics (Last 7 Entries)</CardTitle>
              <CardDescription>
                <Link href={`/listings/${listing.id}/analytics`} className="text-primary hover:underline">
                  View all analytics →
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAnalytics.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 px-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{new Date(item.metric_date).toLocaleDateString()}</p>
                      <p className="text-xs text-foreground/60">
                        {item.facebook_url ? `Facebook Post` : 'General'}
                      </p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-foreground/60">Views: </span>
                        <span className="font-medium">{item.views}</span>
                      </div>
                      <div>
                        <span className="text-foreground/60">Clicks: </span>
                        <span className="font-medium">{item.clicks}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}