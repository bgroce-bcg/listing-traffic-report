'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
const HarTrafficImport = dynamic(() => import('./har-traffic-import'), {
  ssr: false,
  loading: () => null,
})
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { DataTable } from '@/components/listings/data-table'
import { getListings, deleteListing, ListingWithStats } from '@/lib/supabase/listings'
import { Building2, Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'

export default function ListingsPage() {
  const router = useRouter()
  const [listings, setListings] = useState<ListingWithStats[]>([])
  const [filteredListings, setFilteredListings] = useState<ListingWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<ListingWithStats | null>(null)

  useEffect(() => {
    loadListings()
  }, [])

  useEffect(() => {
    filterListings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, searchQuery, statusFilter])

  async function loadListings() {
    try {
      setLoading(true)
      setError(null)
      const data = await getListings()
      setListings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  function filterListings() {
    let filtered = [...listings]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((listing) =>
        listing.name.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((listing) => listing.is_active)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((listing) => !listing.is_active)
    }

    setFilteredListings(filtered)
  }

  function handleView(listing: ListingWithStats) {
    router.push(`/listings/${listing.id}`)
  }

  function handleAnalytics(listing: ListingWithStats) {
    router.push(`/listings/${listing.id}/analytics`)
  }

  function handleEdit(listing: ListingWithStats) {
    router.push(`/listings/${listing.id}/edit`)
  }

  function handleDeleteClick(listing: ListingWithStats) {
    setListingToDelete(listing)
    setDeleteDialogOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!listingToDelete) return

    try {
      await deleteListing(listingToDelete.id)
      setListings((prev) => prev.filter((l) => l.id !== listingToDelete.id))
      setDeleteDialogOpen(false)
      setListingToDelete(null)
      toast.success('Listing deleted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete listing')
    }
  }

  function clearFilters() {
    setSearchQuery('')
    setStatusFilter('all')
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Listings</h2>
            <p className="text-foreground/70">
              Manage your listings and track their analytics
            </p>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Listings</h2>
            <p className="text-foreground/70">
              Manage your listings and track their analytics
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                Error Loading Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-4">{error}</p>
              <Button onClick={loadListings}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Listings</h2>
            <p className="text-foreground/70">
              Manage listings, import HAR traffic, and track performance
            </p>
          </div>
          <Button onClick={() => router.push('/listings/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="har-import">HAR Traffic Import</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  All Listings
                </CardTitle>
                <CardDescription>
                  View, search, and manage all your listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="h-12 w-12 text-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                    <p className="text-sm text-foreground/70 mb-4">
                      Get started by creating your first listing
                    </p>
                    <Button onClick={() => router.push('/listings/new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Listing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
                        <Input
                          placeholder="Search by listing name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Listings</SelectItem>
                          <SelectItem value="active">Active Only</SelectItem>
                          <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                      </Select>
                      {(searchQuery || statusFilter !== 'all') && (
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="w-full sm:w-auto"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear
                        </Button>
                      )}
                    </div>

                    <DataTable
                      data={filteredListings}
                      onView={handleView}
                      onAnalytics={handleAnalytics}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="har-import">
            <HarTrafficImport />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete{' '}
              <span className="font-medium">{listingToDelete?.name}</span>.
              This action cannot be undone.
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
    </ProtectedRoute>
  )
}