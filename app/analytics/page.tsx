'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getAllListingsAnalyticsSummary,
  getAnalyticsTrend,
  getOverallAnalyticsSummary,
  ListingAnalyticsSummary,
  AnalyticsTrend
} from '@/lib/supabase/analytics'
import { BarChart3, TrendingUp, Eye, MousePointer, Building2 } from 'lucide-react'
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

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [overallSummary, setOverallSummary] = useState({
    total_views: 0,
    total_clicks: 0,
    active_listings: 0,
    total_listings: 0,
  })
  const [trendData, setTrendData] = useState<AnalyticsTrend[]>([])
  const [listingsSummary, setListingsSummary] = useState<ListingAnalyticsSummary[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      setLoading(true)

      const [summary, trend, listings] = await Promise.all([
        getOverallAnalyticsSummary(),
        getAnalyticsTrend(),
        getAllListingsAnalyticsSummary(),
      ])

      setOverallSummary(summary)
      setTrendData(trend)
      setListingsSummary(listings)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Overall Analytics</h2>
            <p className="text-foreground/70">
              View performance across all your listings
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Overall Analytics</h2>
          <p className="text-foreground/70">
            View performance across all your listings
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallSummary.total_views.toLocaleString()}</div>
              <p className="text-xs text-foreground/60">Across all listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallSummary.total_clicks.toLocaleString()}</div>
              <p className="text-xs text-foreground/60">Across all listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Building2 className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallSummary.active_listings}</div>
              <p className="text-xs text-foreground/60">
                of {overallSummary.total_listings} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics Trend
              </CardTitle>
              <CardDescription>
                Views and clicks over time across all listings
              </CardDescription>
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

        {/* Listing Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Listing Performance
            </CardTitle>
            <CardDescription>
              Compare performance across all your listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listingsSummary.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60">No analytics data available</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing Name</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">FB Posts</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listingsSummary.map((listing) => (
                    <TableRow
                      key={listing.listing_id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/listings/${listing.listing_id}/analytics`)}
                    >
                      <TableCell className="font-medium">{listing.listing_name}</TableCell>
                      <TableCell className="text-right">{listing.total_views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{listing.total_clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{listing.facebook_url_count}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-primary text-sm">View →</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
