'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Globe, Trash2, Facebook } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { addAnalyticsEntry, deleteAnalyticsEntry } from '@/lib/actions/listings'
import type { Database } from '@/lib/supabase/database.types'

type FacebookUrl = Database['public']['Tables']['facebook_urls']['Row']
type Analytics = Database['public']['Tables']['analytics']['Row'] & {
  facebook_url?: FacebookUrl | null
}

interface AnalyticsSectionProps {
  listingId: string
  facebookUrls: FacebookUrl[]
  analytics: Analytics[]
  onUpdate: () => void
}

export function AnalyticsSection({ listingId, facebookUrls, analytics, onUpdate }: AnalyticsSectionProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [source, setSource] = useState<string>('listing')
  const [views, setViews] = useState('')
  const [clicks, setClicks] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const handleAdd = async () => {
    if (!date) {
      toast.error('Please select a date')
      return
    }

    const viewsNum = parseInt(views) || 0
    const clicksNum = parseInt(clicks) || 0

    if (viewsNum < 0 || clicksNum < 0) {
      toast.error('Views and clicks must be 0 or greater')
      return
    }

    setIsAdding(true)
    const result = await addAnalyticsEntry(listingId, {
      metric_date: format(date, 'yyyy-MM-dd'),
      facebook_url_id: source === 'listing' ? null : source,
      views: viewsNum,
      clicks: clicksNum,
    })
    setIsAdding(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Analytics entry added')
      setViews('')
      setClicks('')
      onUpdate()
    }
  }

  const handleDelete = async (entryId: string) => {
    setDeletingIds(prev => new Set(prev).add(entryId))
    const result = await deleteAnalyticsEntry(entryId, listingId)
    setDeletingIds(prev => {
      const next = new Set(prev)
      next.delete(entryId)
      return next
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Analytics entry deleted')
      onUpdate()
    }
  }

  // Calculate totals
  const totalViews = analytics.reduce((sum, entry) => sum + entry.views, 0)
  const totalClicks = analytics.reduce((sum, entry) => sum + entry.clicks, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Analytics</CardTitle>
        <CardDescription>
          Track daily views and clicks for your listing and Facebook posts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Add Form */}
        <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
          <h3 className="font-semibold text-sm">Add Daily Analytics Entry</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="text-sm">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
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

            {/* Source Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listing">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Listing Overall
                    </div>
                  </SelectItem>
                  {facebookUrls.map((url, index) => (
                    <SelectItem key={url.id} value={url.id}>
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4" />
                        Facebook Post {index + 1}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Views */}
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

            {/* Clicks */}
            <div className="space-y-2">
              <Label htmlFor="clicks" className="text-sm">Clicks</Label>
              <Input
                id="clicks"
                type="number"
                min="0"
                placeholder="0"
                value={clicks}
                onChange={(e) => setClicks(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </div>

        {/* Analytics Table */}
        {analytics.length > 0 ? (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Recent Entries ({analytics.length})
            </Label>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {format(new Date(entry.metric_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {entry.facebook_url_id ? (
                          <Badge variant="outline" className="gap-1">
                            <Facebook className="h-3 w-3" />
                            FB Post {facebookUrls.findIndex(u => u.id === entry.facebook_url_id) + 1}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" />
                            Listing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{entry.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{entry.clicks.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingIds.has(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">{totalViews.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{totalClicks.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No analytics data yet</p>
            <p className="text-xs">Add your first entry above to start tracking</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
