'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Trash2, Facebook } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { addFacebookMetric, deleteFacebookMetric, getFacebookMetrics } from '@/lib/actions/platform-metrics'
import type { Database } from '@/lib/supabase/database.types'

type FacebookMetric = Database['public']['Tables']['facebook_metrics']['Row'] & {
  facebook_url?: Database['public']['Tables']['facebook_urls']['Row']
}
type FacebookUrl = Database['public']['Tables']['facebook_urls']['Row']

interface FacebookMetricsSectionProps {
  listingId: string
  facebookUrls: FacebookUrl[]
}

export function FacebookMetricsSection({ listingId, facebookUrls }: FacebookMetricsSectionProps) {
  const [metrics, setMetrics] = useState<FacebookMetric[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedUrlId, setSelectedUrlId] = useState<string>('')
  const [reach, setReach] = useState('')
  const [impressions, setImpressions] = useState('')
  const [postClicks, setPostClicks] = useState('')
  const [reactions, setReactions] = useState('')
  const [comments, setComments] = useState('')
  const [shares, setShares] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (facebookUrls.length > 0 && !selectedUrlId) {
      setSelectedUrlId(facebookUrls[0].id)
    }
  }, [facebookUrls, selectedUrlId])

  useEffect(() => {
    loadMetrics()
  }, [listingId])

  const loadMetrics = async () => {
    const result = await getFacebookMetrics(listingId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setMetrics(result.data)
    }
  }

  const handleAdd = async () => {
    if (!date) {
      toast.error('Please select a date')
      return
    }

    if (!selectedUrlId) {
      toast.error('Please select a Facebook post')
      return
    }

    setIsAdding(true)
    const result = await addFacebookMetric(selectedUrlId, listingId, {
      metric_date: format(date, 'yyyy-MM-dd'),
      reach: parseInt(reach) || null,
      impressions: parseInt(impressions) || null,
      post_clicks: parseInt(postClicks) || null,
      reactions: parseInt(reactions) || null,
      comments: parseInt(comments) || null,
      shares: parseInt(shares) || null,
    })
    setIsAdding(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Facebook metrics added')
      setReach('')
      setImpressions('')
      setPostClicks('')
      setReactions('')
      setComments('')
      setShares('')
      loadMetrics()
    }
  }

  const handleDelete = async (metricId: string) => {
    setDeletingIds(prev => new Set(prev).add(metricId))
    const result = await deleteFacebookMetric(metricId, listingId)
    setDeletingIds(prev => {
      const next = new Set(prev)
      next.delete(metricId)
      return next
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Facebook metrics deleted')
      loadMetrics()
    }
  }

  const calculateTotals = () => ({
    reach: metrics.reduce((sum, m) => sum + (m.reach || 0), 0),
    impressions: metrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    postClicks: metrics.reduce((sum, m) => sum + (m.post_clicks || 0), 0),
    reactions: metrics.reduce((sum, m) => sum + (m.reactions || 0), 0),
    comments: metrics.reduce((sum, m) => sum + (m.comments || 0), 0),
    shares: metrics.reduce((sum, m) => sum + (m.shares || 0), 0),
  })

  const totals = calculateTotals()

  if (facebookUrls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facebook Engagement Metrics</CardTitle>
          <CardDescription>
            Track daily engagement for your Facebook posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Facebook className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No Facebook posts yet</p>
            <p className="text-xs">Add a Facebook post URL in the Facebook Posts tab first</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facebook Engagement Metrics</CardTitle>
        <CardDescription>
          Track reach, impressions, clicks, reactions, comments, and shares for your Facebook posts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Add Form */}
        <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
          <h3 className="font-semibold text-sm">Add Daily Facebook Engagement</h3>
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

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm">Facebook Post</Label>
              <Select value={selectedUrlId} onValueChange={setSelectedUrlId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a post" />
                </SelectTrigger>
                <SelectContent>
                  {facebookUrls.map((url, index) => (
                    <SelectItem key={url.id} value={url.id}>
                      Post {index + 1}: {url.facebook_url.substring(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reach" className="text-sm">Reach</Label>
              <Input
                id="reach"
                type="number"
                min="0"
                placeholder="0"
                value={reach}
                onChange={(e) => setReach(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impressions" className="text-sm">Impressions</Label>
              <Input
                id="impressions"
                type="number"
                min="0"
                placeholder="0"
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postClicks" className="text-sm">Post Clicks</Label>
              <Input
                id="postClicks"
                type="number"
                min="0"
                placeholder="0"
                value={postClicks}
                onChange={(e) => setPostClicks(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactions" className="text-sm">Reactions (Likes, Love, etc.)</Label>
              <Input
                id="reactions"
                type="number"
                min="0"
                placeholder="0"
                value={reactions}
                onChange={(e) => setReactions(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments" className="text-sm">Comments</Label>
              <Input
                id="comments"
                type="number"
                min="0"
                placeholder="0"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
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
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </div>

        {/* Metrics Table */}
        {metrics.length > 0 ? (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Facebook Engagement History ({metrics.length} entries)
            </Label>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead className="text-right">Reach</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Reactions</TableHead>
                    <TableHead className="text-right">Comments</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => {
                    const postIndex = facebookUrls.findIndex(u => u.id === metric.facebook_url_id)
                    return (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">
                          {format(new Date(metric.metric_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Post {postIndex + 1}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{(metric.reach || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{(metric.impressions || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{(metric.post_clicks || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{(metric.reactions || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{(metric.comments || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{(metric.shares || 0).toLocaleString()}</TableCell>
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
                    )
                  })}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">{totals.reach.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{totals.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{totals.postClicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{totals.reactions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{totals.comments.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{totals.shares.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Facebook className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No engagement metrics yet</p>
            <p className="text-xs">Add your first entry above</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
