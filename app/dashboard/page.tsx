'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getListings, ListingWithStats } from '@/lib/supabase/listings'
import { getOverallAnalyticsSummary } from '@/lib/supabase/analytics'
import {
  Building2,
  Eye,
  MousePointer,
  Plus,
  BarChart3,
  TrendingUp,
  List
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState<ListingWithStats[]>([])
  const [summary, setSummary] = useState({
    total_views: 0,
    total_clicks: 0,
    active_listings: 0,
    total_listings: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setIsLoading(true)
      const [listingsData, summaryData] = await Promise.all([
        getListings(),
        getOverallAnalyticsSummary(),
      ])

      setListings(listingsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const recentListings = listings.slice(0, 5)

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
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
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-foreground/70">
            Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}!
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Building2 className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.active_listings}</div>
              <p className="text-xs text-foreground/60">
                {summary.total_listings} total listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_views.toLocaleString()}</div>
              <p className="text-xs text-foreground/60">
                Across all listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_clicks.toLocaleString()}</div>
              <p className="text-xs text-foreground/60">
                Across all listings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => router.push('/listings/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
              <Button variant="outline" onClick={() => router.push('/analytics')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" onClick={() => router.push('/listings')}>
                <List className="mr-2 h-4 w-4" />
                View All Listings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Listings</CardTitle>
                <CardDescription>Your most recently created listings</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/listings')}
              >
                View All →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
                <p className="text-foreground/60 mb-4">No listings yet</p>
                <Button onClick={() => router.push('/listings/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push(`/listings/${listing.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{listing.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${listing.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                          {listing.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/60">
                        Created {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-foreground/60" />
                        <span>{listing.total_views || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-foreground/60" />
                        <span>{listing.total_clicks || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-foreground/60" />
                        <span>{listing.facebook_url_count || 0} FB posts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
