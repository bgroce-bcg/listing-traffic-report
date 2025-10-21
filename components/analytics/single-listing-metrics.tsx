import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Home, Mail, TrendingUp } from 'lucide-react'

interface ManualMetric {
  id: string
  metric_date: string
  phone_calls: number | null
  showings: number | null
  inquiries: number | null
  created_at: string
}

interface SingleListingMetricsProps {
  metrics: ManualMetric[]
}

export function SingleListingMetrics({ metrics }: SingleListingMetricsProps) {
  // Calculate totals
  const totalPhoneCalls = metrics.reduce((sum, m) => sum + (m.phone_calls ?? 0), 0)
  const totalShowings = metrics.reduce((sum, m) => sum + (m.showings ?? 0), 0)
  const totalInquiries = metrics.reduce((sum, m) => sum + (m.inquiries ?? 0), 0)
  const totalInteractions = totalPhoneCalls + totalShowings + totalInquiries

  // Calculate trend (compare last 7 days to previous 7 days)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const recentMetrics = metrics.filter(m => {
    const date = new Date(m.metric_date)
    return date >= sevenDaysAgo
  })

  const previousMetrics = metrics.filter(m => {
    const date = new Date(m.metric_date)
    return date >= fourteenDaysAgo && date < sevenDaysAgo
  })

  const recentTotal = recentMetrics.reduce(
    (sum, m) => sum + (m.phone_calls ?? 0) + (m.showings ?? 0) + (m.inquiries ?? 0),
    0
  )

  const previousTotal = previousMetrics.reduce(
    (sum, m) => sum + (m.phone_calls ?? 0) + (m.showings ?? 0) + (m.inquiries ?? 0),
    0
  )

  const trendPercentage = previousTotal > 0
    ? ((recentTotal - previousTotal) / previousTotal) * 100
    : recentTotal > 0 ? 100 : 0

  const trendText = trendPercentage > 0
    ? `+${trendPercentage.toFixed(0)}% from last week`
    : trendPercentage < 0
    ? `${trendPercentage.toFixed(0)}% from last week`
    : 'No change from last week'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Phone Calls</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPhoneCalls}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.length > 0 ? 'All time total' : 'No data yet'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Showings</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalShowings}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.length > 0 ? 'All time total' : 'No data yet'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Email Inquiries</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInquiries}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.length > 0 ? 'All time total' : 'No data yet'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInteractions}</div>
          <p className={`text-xs ${trendPercentage > 0 ? 'text-green-600' : trendPercentage < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
            {metrics.length > 0 ? trendText : 'No data yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}