'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Save, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { BasicInfoSection } from './basic-info-section'
import { HarMetricsSection } from './har-metrics-section'
import { FacebookUrlsSection } from './facebook-urls-section'
import { FacebookMetricsSection } from './facebook-metrics-section'
import { PlatformMetricsSection } from './platform-metrics-section'
import { AnalyticsSection } from './analytics-section'
import { listingFormSchema, type ListingForm } from '@/lib/validations/listing-schema'
import { updateListing, getListingWithData } from '@/lib/actions/listings'
import type { Database } from '@/lib/supabase/database.types'

type Listing = Database['public']['Tables']['listings']['Row']
type FacebookUrl = Database['public']['Tables']['facebook_urls']['Row']
type Analytics = Database['public']['Tables']['analytics']['Row']

interface EditListingFormProps {
  listingId: string
  initialData: Listing
}

export function EditListingForm({ listingId, initialData }: EditListingFormProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [facebookUrls, setFacebookUrls] = useState<FacebookUrl[]>([])
  const [analytics, setAnalytics] = useState<Analytics[]>([])

  const form = useForm<ListingForm>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: initialData.name,
      realtor_url: initialData.realtor_url || '',
      har_url: initialData.har_url || '',
      zillow_url: initialData.zillow_url || '',
      is_active: initialData.is_active,
      har_desktop_views: initialData.har_desktop_views,
      har_mobile_views: initialData.har_mobile_views,
      har_photo_views: initialData.har_photo_views,
      har_days_on_market: initialData.har_days_on_market,
      har_status: (initialData.har_status || '') as 'Active' | 'Pending' | 'Under Contract' | 'Closed' | 'Expired' | '',
    },
  })

  // Load related data
  const loadData = useCallback(async () => {
    const result = await getListingWithData(listingId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setFacebookUrls(result.facebookUrls || [])
      setAnalytics(result.analytics || [])
    }
  }, [listingId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    const values = form.getValues()
    const validation = listingFormSchema.safeParse(values)

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        toast.error(`${issue.path.join('.')}: ${issue.message}`)
      })
      return
    }

    setIsSaving(true)
    const result = await updateListing(listingId, {
      name: values.name,
      realtor_url: values.realtor_url || null,
      har_url: values.har_url || null,
      zillow_url: values.zillow_url || null,
      is_active: values.is_active,
      har_desktop_views: values.har_desktop_views,
      har_mobile_views: values.har_mobile_views,
      har_photo_views: values.har_photo_views,
      har_days_on_market: values.har_days_on_market,
      har_status: values.har_status || null,
    })
    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Listing saved successfully')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{initialData.name}</h1>
          <p className="text-muted-foreground">
            Update listing information and add daily analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" />
            Preview Report
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="har">HAR Snapshot</TabsTrigger>
          <TabsTrigger value="platform">Platform Traffic</TabsTrigger>
          <TabsTrigger value="facebook">Facebook Posts</TabsTrigger>
          <TabsTrigger value="facebook-metrics">FB Engagement</TabsTrigger>
          <TabsTrigger value="analytics">Old Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoSection form={form} />
        </TabsContent>

        <TabsContent value="har" className="mt-6">
          <HarMetricsSection form={form} />
        </TabsContent>

        <TabsContent value="platform" className="mt-6">
          <PlatformMetricsSection listingId={listingId} />
        </TabsContent>

        <TabsContent value="facebook" className="mt-6">
          <FacebookUrlsSection
            listingId={listingId}
            facebookUrls={facebookUrls}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="facebook-metrics" className="mt-6">
          <FacebookMetricsSection
            listingId={listingId}
            facebookUrls={facebookUrls}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsSection
            listingId={listingId}
            facebookUrls={facebookUrls}
            analytics={analytics}
            onUpdate={loadData}
          />
        </TabsContent>
      </Tabs>

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
