import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { Listing } from '@/lib/supabase/listings'

interface ListingDetailHeaderProps {
  listing: Listing
}

export function ListingDetailHeader({ listing }: ListingDetailHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{listing.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created {format(new Date(listing.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <Badge
                variant={listing.is_active ? 'default' : 'secondary'}
                className={listing.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {listing.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
