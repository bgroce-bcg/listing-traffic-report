'use client'

import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ListingAnalyticsSummary } from '@/lib/supabase/analytics'
import { Eye } from 'lucide-react'

interface ListingPerformanceTableProps {
  data: ListingAnalyticsSummary[]
}

export function ListingPerformanceTable({ data }: ListingPerformanceTableProps) {
  const router = useRouter()

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No listing performance data available.
        <p className="text-sm mt-2">Start logging metrics to see performance insights.</p>
      </div>
    )
  }

  // Sort by total views + clicks descending
  const sortedData = [...data].sort((a, b) =>
    (b.total_views + b.total_clicks) - (a.total_views + a.total_clicks)
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Listing</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">FB Posts</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((listing) => (
            <TableRow key={listing.listing_id}>
              <TableCell className="font-medium max-w-xs truncate">
                {listing.listing_name}
              </TableCell>
              <TableCell className="text-right">
                {listing.total_views.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {listing.total_clicks.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {listing.facebook_url_count}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {(listing.total_views + listing.total_clicks).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/listings/${listing.listing_id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}