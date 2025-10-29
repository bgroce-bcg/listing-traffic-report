'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, Trash2, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { addPlatformMetric, deletePlatformMetric, getPlatformMetrics } from '@/lib/actions/platform-metrics'
import type { Database } from '@/lib/supabase/database.types'

type PlatformMetric = Database['public']['Tables']['platform_metrics']['Row']

interface PlatformMetricsSectionProps {
  listingId: string
}

export function PlatformMetricsSection({ listingId }: PlatformMetricsSectionProps) {
  const [metrics, setMetrics] = useState<PlatformMetric[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [platform, setPlatform] = useState<string>('zillow')
  const [views, setViews] = useState('')
  const [saves, setSaves] = useState('')
  const [shares, setShares] = useState('')
  const [leads, setLeads] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const loadMetrics = useCallback(async () => {
    const result = await getPlatformMetrics(listingId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setMetrics(result.data)
    }
  }, [listingId])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  const handleAdd = async () => {
    if (!date) {
      toast.error('Please select a date')
      return
    }

    setIsAdding(true)
    const result = await addPlatformMetric(listingId, {
      platform,
      metric_date: format(date, 'yyyy-MM-dd'),
      views: parseInt(views) || null,
      saves: parseInt(saves) || null,
      shares: parseInt(shares) || null,
      leads: parseInt(leads) || null,
    })
    setIsAdding(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Platform metrics added')
      setViews('')
      setSaves('')
      setShares('')
      setLeads('')
      loadMetrics()
    }
  }

  const handleDelete = async (metricId: string) => {
    setDeletingIds(prev => new Set(prev).add(metricId))
    const result = await deletePlatformMetric(metricId, listingId)
    setDeletingIds(prev => {
      const next = new Set(prev)
      next.delete(metricId)
      return next
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Platform metrics deleted')
      loadMetrics()
    }
  }

  const zillowMetrics = metrics.filter(m => m.platform === 'zillow')
  const realtorMetrics = metrics.filter(m => m.platform === 'realtor')
  const harMetrics = metrics.filter(m => m.platform === 'har')

  const calculateTotals = (platformMetrics: PlatformMetric[]) => ({
    views: platformMetrics.reduce((sum, m) => sum + (m.views || 0), 0),
    saves: platformMetrics.reduce((sum, m) => sum + (m.saves || 0), 0),
    shares: platformMetrics.reduce((sum, m) => sum + (m.shares || 0), 0),
    leads: platformMetrics.reduce((sum, m) => sum + (m.leads || 0), 0),
  })

  const MetricsTable = ({ platformMetrics, platformName }: { platformMetrics: PlatformMetric[], platformName: string }) => {
    const totals = calculateTotals(platformMetrics)

    return platformMetrics.length > 0 ? (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Saves</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platformMetrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="font-medium">
                  {format(new Date(metric.metric_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">{(metric.views || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(metric.saves || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(metric.shares || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(metric.leads || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(metric.id)}
                    disabled={deletingIds.has(metric.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{totals.views.toLocaleString()}</TableCell>
              <TableCell className="text-right">{totals.saves.toLocaleString()}</TableCell>
              <TableCell className="text-right">{totals.shares.toLocaleString()}</TableCell>
              <TableCell className="text-right">{totals.leads.toLocaleString()}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    ) : (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p className="text-sm">No {platformName} metrics yet</p>
        <p className="text-xs">Add your first entry above</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Traffic Metrics</CardTitle>
        <CardDescription>
          Track daily views, saves, shares, and leads from Zillow, Realtor.com, and HAR.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Add Form */}
        <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
          <h3 className="font-semibold text-sm">Add Daily Platform Metrics</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zillow">Zillow</SelectItem>
                  <SelectItem value="realtor">Realtor.com</SelectItem>
                  <SelectItem value="har">HAR.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="views" className="text-sm">Views</Label>
              <Input
                id="views"
                type="number"
                min="0"
                placeholder="0"
                value={views}
                onChange={(e) => setViews(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saves" className="text-sm">Saves/Favorites</Label>
              <Input
                id="saves"
                type="number"
                min="0"
                placeholder="0"
                value={saves}
                onChange={(e) => setSaves(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shares" className="text-sm">Shares</Label>
              <Input
                id="shares"
                type="number"
                min="0"
                placeholder="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leads" className="text-sm">Leads/Inquiries</Label>
              <Input
                id="leads"
                type="number"
                min="0"
                placeholder="0"
                value={leads}
                onChange={(e) => setLeads(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </div>

        {/* Platform-specific tabs */}
        <Tabs defaultValue="zillow" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="zillow">
              Zillow
              {zillowMetrics.length > 0 && (
                <Badge variant="secondary" className="ml-2">{zillowMetrics.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="realtor">
              Realtor.com
              {realtorMetrics.length > 0 && (
                <Badge variant="secondary" className="ml-2">{realtorMetrics.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="har">
              HAR.com
              {harMetrics.length > 0 && (
                <Badge variant="secondary" className="ml-2">{harMetrics.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="zillow" className="mt-4">
            <MetricsTable platformMetrics={zillowMetrics} platformName="Zillow" />
          </TabsContent>

          <TabsContent value="realtor" className="mt-4">
            <MetricsTable platformMetrics={realtorMetrics} platformName="Realtor.com" />
          </TabsContent>

          <TabsContent value="har" className="mt-4">
            <MetricsTable platformMetrics={harMetrics} platformName="HAR.com" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
