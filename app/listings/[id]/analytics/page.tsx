'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getListing, getFacebookUrls, Listing, FacebookUrl } from '@/lib/supabase/listings'
import {
  getListingAnalytics,
  getListingAnalyticsTrend,
  exportListingAnalyticsToCSV,
  upsertAnalytics,
  deleteAnalytics,
  AnalyticsWithDetails,
  AnalyticsTrend
} from '@/lib/supabase/analytics'
import { AnalyticsEntryDialog } from '@/components/analytics/analytics-entry-dialog'
import { AnalyticsFormData } from '@/lib/validations/listing'
import { ArrowLeft, Download, Plus, Eye, MousePointer, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ListingAnalyticsPage() {
  const params = useParams()
  const listingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [facebookUrls, setFacebookUrls] = useState<FacebookUrl[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsWithDetails[]>([])
  const [trendData, setTrendData] = useState<AnalyticsTrend[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [analyticsToDelete, setAnalyticsToDelete] = useState<AnalyticsWithDetails | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      const [listingData, fbUrls, analyticsData, trend] = await Promise.all([
        getListing(listingId),
        getFacebookUrls(listingId),
        getListingAnalytics(listingId),
        getListingAnalyticsTrend(listingId),
      ])

      if (!listingData) {
        setError('Listing not found')
        return
      }

      setListing(listingData)
      setFacebookUrls(fbUrls)
      setAnalytics(analyticsData)
      setTrendData(trend)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAnalytics(data: AnalyticsFormData) {
    try {
      await upsertAnalytics({
        listing_id: listingId,
        facebook_url_id: data.facebook_url_id || null,
        metric_date: data.metric_date,
        views: data.views,
        clicks: data.clicks,
      })

      toast.success('Analytics added successfully')
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add analytics')
      throw error
    }
  }

  async function handleDeleteClick(analytics: AnalyticsWithDetails) {
    setAnalyticsToDelete(analytics)
    setDeleteDialogOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!analyticsToDelete) return

    try {
      await deleteAnalytics(analyticsToDelete.id)
      toast.success('Analytics deleted successfully')
      setDeleteDialogOpen(false)
      setAnalyticsToDelete(null)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete analytics')
    }
  }

  async function handleExport() {
    if (!listing) return

    try {
      setExporting(true)
      await exportListingAnalyticsToCSV(listingId, listing.name)
      toast.success('Analytics exported successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export analytics')
    } finally {
      setExporting(false)
    }
  }

  const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0)
  const totalClicks = analytics.reduce((sum, a) => sum + (a.clicks || 0), 0)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container max-w-7xl py-8">
          <div className="mb-6">
            <Link href={`/listings/${listingId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listing
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
        <div className="container max-w-7xl py-8">
          <div className="mb-6">
            <Link href={`/listings/${listingId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listing
              </Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-4">
                {error || 'Listing not found'}
              </p>
              <Button onClick={loadData}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-7xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/listings/${listingId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Listing
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting || analytics.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Analytics
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{listing.name}</h1>
          <p className="text-foreground/70">Analytics Overview</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-foreground/60" />
                <span className="text-4xl font-bold">{totalViews.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <MousePointer className="h-8 w-8 text-foreground/60" />
                <span className="text-4xl font-bold">{totalClicks.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Analytics Trend</CardTitle>
              <CardDescription>Views and clicks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    name="Views"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--chart-2))"
                    name="Clicks"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Analytics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Data</CardTitle>
            <CardDescription>Detailed analytics entries sorted by date</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60 mb-4">No analytics data yet</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Entry
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.metric_date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.views}</TableCell>
                      <TableCell>{item.clicks}</TableCell>
                      <TableCell>
                        {item.facebook_url ? (
                          <a
                            href={item.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            Facebook Post
                          </a>
                        ) : (
                          <span className="text-foreground/60">General</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AnalyticsEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleAddAnalytics}
          listingName={listing.name}
          facebookUrls={facebookUrls}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Analytics Entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this analytics entry. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
