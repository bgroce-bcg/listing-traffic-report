import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PrintActions } from '@/components/reports/print-actions'
import {
  Eye,
  MousePointerClick,
  Calendar,
  Facebook,
  Globe
} from 'lucide-react'

// Mock data for design preview
const mockData = {
  listing: {
    name: '123 Main Street, Houston, TX 77001',
    har_url: 'https://har.com/listing',
    realtor_url: 'https://realtor.com/listing',
    zillow_url: 'https://zillow.com/listing',
    image_url: null, // Placeholder for property image
  },
  metrics: {
    totalViews: 1847,
    totalClicks: 234,
    harViews: 623,
    realtorViews: 489,
    zillowViews: 412,
    facebookMetrics: [
      { url: 'https://facebook.com/post/123456', views: 323, clicks: 45 },
      { url: 'https://facebook.com/post/789012', views: 289, clicks: 38 },
    ],
    reportDate: 'February 15, 2025'
  },
  analytics: [
    { id: '1', metric_date: '2025-02-15', views: 145, clicks: 23, facebook_url: null },
    { id: '2', metric_date: '2025-02-14', views: 132, clicks: 19, facebook_url: { facebook_url: 'https://facebook.com/post/123456' } },
    { id: '3', metric_date: '2025-02-13', views: 98, clicks: 15, facebook_url: null },
    { id: '4', metric_date: '2025-02-12', views: 156, clicks: 28, facebook_url: null },
    { id: '5', metric_date: '2025-02-11', views: 134, clicks: 21, facebook_url: { facebook_url: 'https://facebook.com/post/789012' } },
  ]
}

export default function PreviewReportPage() {
  const { listing, metrics } = mockData

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white print:bg-white">
      {/* Letter-sized container */}
      <div className="max-w-[8.5in] mx-auto bg-white p-12 print:p-0 shadow-2xl print:shadow-none">
        {/* Premium Header with Gradient Background */}
        <div className="gradient-header -mx-12 -mt-12 px-12 pt-8 pb-4 mb-4 print:mx-0 print:mt-0 print:px-0 print:pt-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="relative w-50 h-25 mb-2">
                <Image
                  src="/mund_logo.png"
                  alt="Mund Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <h1 className="report-title text-2xl text-gray-900 mb-1">
                Property Traffic Report
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 report-subheading">
                <div className="w-6 h-0.5 bg-red-500"></div>
                <span>Performance Analysis</span>
              </div>
            </div>
            <div className="text-right bg-white/80 backdrop-blur-sm rounded-lg p-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5 report-subheading">
                <Calendar className="h-3 w-3" />
                <span>Report Date</span>
              </div>
              <p className="report-heading text-sm text-gray-900">
                {metrics.reportDate}
              </p>
            </div>
          </div>

          {/* Property Information with Image */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-gray-100">
              <p className="text-xs text-gray-500 mb-0.5 report-subheading">Property Address</p>
              <p className="report-heading text-sm text-gray-900">{listing.name}</p>
            </div>
            {listing.image_url && (
              <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 overflow-hidden">
                <div className="relative w-full h-16">
                  <Image
                    src={listing.image_url}
                    alt="Property"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            {!listing.image_url && (
              <div className="bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <p className="text-xs text-gray-400">Property Image</p>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary - Hero Metrics */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="report-heading text-xl text-gray-900">Executive Summary</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Total Views */}
            <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-red-100 p-1.5 rounded-lg">
                    <Eye className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5 report-subheading">Total Views</p>
                    <p className="report-metric text-xl text-gray-900">
                      {metrics.totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Clicks */}
            <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-red-100 p-1.5 rounded-lg">
                    <MousePointerClick className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5 report-subheading">Total Clicks</p>
                    <p className="report-metric text-xl text-gray-900">
                      {metrics.totalClicks.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Listing Sources Breakdown */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="report-heading text-xl text-gray-900">Platform Performance</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* HAR.com */}
            <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="report-subheading text-xs text-gray-500 mb-0.5">Platform</p>
                    <h3 className="report-heading text-sm text-gray-900">HAR.com</h3>
                  </div>
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <Globe className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 report-body">Views</span>
                    <span className="report-metric text-lg text-gray-900">{metrics.harViews.toLocaleString()}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 report-body">Clicks</span>
                    <span className="report-metric text-base text-gray-900">
                      {Math.floor(metrics.harViews * 0.15).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Realtor.com */}
            <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="report-subheading text-xs text-gray-500 mb-0.5">Platform</p>
                    <h3 className="report-heading text-sm text-gray-900">Realtor.com</h3>
                  </div>
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <Globe className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 report-body">Views</span>
                    <span className="report-metric text-lg text-gray-900">{metrics.realtorViews.toLocaleString()}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 report-body">Clicks</span>
                    <span className="report-metric text-base text-gray-900">
                      {Math.floor(metrics.realtorViews * 0.15).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zillow.com */}
            <Card className="premium-card border-0 bg-gradient-subtle overflow-hidden">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="report-subheading text-xs text-gray-500 mb-0.5">Platform</p>
                    <h3 className="report-heading text-sm text-gray-900">Zillow.com</h3>
                  </div>
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <Globe className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 report-body">Views</span>
                    <span className="report-metric text-lg text-gray-900">{metrics.zillowViews.toLocaleString()}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 report-body">Clicks</span>
                    <span className="report-metric text-base text-gray-900">
                      {Math.floor(metrics.zillowViews * 0.15).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Facebook Performance */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="report-heading text-xl text-gray-900">Social Media Performance</h2>
          </div>

          <div className="space-y-2">
            {metrics.facebookMetrics.map((fbMetric, index) => (
              <Card key={index} className="premium-card border-0 bg-gradient-subtle overflow-hidden">
                <CardContent className="pt-2.5 pb-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="bg-blue-100 p-1.5 rounded-lg">
                        <Facebook className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className="bg-white text-xs py-0">
                            Post {index + 1}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-md">
                          {fbMetric.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Eye className="h-3.5 w-3.5 text-gray-400" />
                          <p className="text-xs text-gray-500 report-subheading">Views</p>
                        </div>
                        <p className="report-metric text-base text-gray-900">
                          {fbMetric.views.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <MousePointerClick className="h-3.5 w-3.5 text-gray-400" />
                          <p className="text-xs text-gray-500 report-subheading">Clicks</p>
                        </div>
                        <p className="report-metric text-base text-gray-900">
                          {fbMetric.clicks.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Print Button - Hidden when printing */}
        <PrintActions />
      </div>
    </div>
  )
}
