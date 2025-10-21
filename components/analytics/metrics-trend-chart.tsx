'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { AnalyticsTrend } from '@/lib/supabase/analytics'

interface MetricsTrendChartProps {
  data: AnalyticsTrend[]
}

export function MetricsTrendChart({ data }: MetricsTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No metrics data available for the selected period
      </div>
    )
  }

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="phone_calls"
          name="Phone Calls"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-1))' }}
        />
        <Line
          type="monotone"
          dataKey="showings"
          name="Showings"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-2))' }}
        />
        <Line
          type="monotone"
          dataKey="inquiries"
          name="Inquiries"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-3))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}