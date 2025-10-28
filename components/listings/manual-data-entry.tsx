'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { HarDataForm } from './har-data-form'
import { PlatformMetricsForm } from './platform-metrics-form'
import { FacebookMetricsForm } from './facebook-metrics-form'
import { Listing, FacebookUrl } from '@/lib/supabase/listings'
import { ClipboardList, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ManualDataEntryProps {
  listing: Listing
  facebookUrls: FacebookUrl[]
  onRefresh: () => void
}

export function ManualDataEntry({ listing, facebookUrls, onRefresh }: ManualDataEntryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Manual Data Entry
        </CardTitle>
        <CardDescription>
          Manually enter traffic data from HAR.com, Realtor.com, Zillow, and Facebook posts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a temporary solution for data collection. Automated scraping and API integrations
            will replace manual entry in future updates.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* HAR Data Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">HAR.com Traffic Data</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Update snapshot metrics from HAR.com (desktop views, mobile views, photo views, days on market, status)
              </p>
            </div>
            <HarDataForm listing={listing} onSuccess={onRefresh} />
          </div>

          <Separator />

          {/* Platform Metrics Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">Realtor.com & Zillow Metrics</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Add daily traffic metrics from Realtor.com or Zillow (views, saves, shares, leads)
              </p>
            </div>
            <PlatformMetricsForm listingId={listing.id} onSuccess={onRefresh} />
          </div>

          <Separator />

          {/* Facebook Metrics Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">Facebook Post Metrics</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Log engagement metrics for Facebook posts (impressions, reach, reactions, comments, shares, clicks)
              </p>
            </div>
            <FacebookMetricsForm facebookUrls={facebookUrls} onSuccess={onRefresh} />
            {facebookUrls.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Add a Facebook post URL first to log metrics
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
