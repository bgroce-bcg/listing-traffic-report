"use client"

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowRightIcon } from 'lucide-react'

interface Activity {
  id: string
  listingAddress: string
  platform: 'Realtor.com' | 'Zillow' | 'Facebook'
  metricType: string
  value: number
  timestamp: Date
}

interface RecentActivityProps {
  activities?: Activity[]
  isLoading?: boolean
}

export function RecentActivity({ activities = [], isLoading = false }: RecentActivityProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getPlatformColor = (platform: Activity['platform']) => {
    switch (platform) {
      case 'Realtor.com':
        return 'default'
      case 'Zillow':
        return 'secondary'
      case 'Facebook':
        return 'outline'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest metrics and updates from your listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No recent activity to display.
            </p>
            <p className="text-sm text-muted-foreground">
              Add listings and track metrics to see activity here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest metrics and updates from your listings
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/analytics" className="gap-1">
              View All
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">View all analytics</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead className="hidden sm:table-cell">Platform</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right hidden md:table-cell">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.listingAddress}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={getPlatformColor(activity.platform)}>
                      {activity.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.metricType}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {activity.value}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground hidden md:table-cell">
                    {formatTimestamp(activity.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}