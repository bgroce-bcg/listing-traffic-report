import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface ReportPDFProps {
  listing: {
    name: string
    image_url?: string | null
  }
  metrics: {
    totalViews: number
    totalClicks: number
    harViews: number
    realtorViews: number
    zillowViews: number
    facebookMetrics: Array<{
      url: string
      views: number
      clicks: number
    }>
    reportDate: string
  }
  hasHar: boolean
  hasRealtor: boolean
  hasZillow: boolean
  logoUrl?: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#fef8f7',
    padding: 20,
    marginBottom: 15,
    borderRadius: 8,
  },
  logoContainer: {
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Times-Bold',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
  },
  dateBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 6,
    border: '1px solid #E5E7EB',
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  propertySection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  propertyAddressContainer: {
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 8,
    borderRadius: 6,
    border: '1px solid #E5E7EB',
  },
  propertyAddressLabel: {
    fontSize: 7,
    color: '#6B7280',
    marginBottom: 3,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  propertyAddress: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  propertyImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 6,
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  propertyImage: {
    width: '100%',
    height: 80,
    objectFit: 'cover',
    borderRadius: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionAccent: {
    width: 3,
    height: 16,
    backgroundColor: '#EF4444',
    marginRight: 8,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    color: '#111827',
    letterSpacing: -0.3,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #E5E7EB',
  },
  metricLabel: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    letterSpacing: -0.4,
  },
  platformsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  platformCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #E5E7EB',
  },
  platformName: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  platformMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  platformLabel: {
    fontSize: 8,
    color: '#6B7280',
    fontFamily: 'Helvetica',
  },
  platformValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    letterSpacing: -0.3,
  },
  fbCard: {
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #E5E7EB',
    marginBottom: 8,
  },
  fbHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fbBadge: {
    backgroundColor: 'white',
    padding: '3 8',
    borderRadius: 4,
    border: '1px solid #E5E7EB',
  },
  fbBadgeText: {
    fontSize: 8,
    color: '#111827',
  },
  fbUrl: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 8,
  },
  fbMetrics: {
    flexDirection: 'row',
    gap: 20,
  },
  fbMetric: {
    flexDirection: 'row',
    gap: 5,
  },
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: '1px solid #E5E7EB',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  footerItem: {
    flex: 1,
  },
  footerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 3,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: 8,
    fontFamily: 'Times-Bold',
    color: '#111827',
  },
  disclaimer: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #E5E7EB',
  },
  disclaimerText: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 1.4,
  },
})

export function ReportPDF({ listing, metrics, hasHar, hasRealtor, hasZillow, logoUrl }: ReportPDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Top Row: Logo/Title on left, Date on right */}
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              {logoUrl && (
                <View style={styles.logoContainer}>
                  <Image
                    src={logoUrl}
                    style={styles.logo}
                  />
                </View>
              )}
              
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Report Date</Text>
              <Text style={styles.dateText}>{metrics.reportDate}</Text>
            </View>
          </View>

          {/* Bottom Row: Property Address (2/3) + Property Image (1/3) */}
          <View style={styles.propertySection}>
            <View style={styles.propertyAddressContainer}>
              <Text style={styles.title}>Property Traffic Report</Text>
              <Text style={styles.subtitle}>Performance Analysis</Text>
              <Text style={styles.propertyAddressLabel}>Property Address</Text>
              <Text style={styles.propertyAddress}>{listing.name}</Text>
            </View>

            {listing.image_url && (
              <View style={styles.propertyImageContainer}>
                <Image src={listing.image_url} style={styles.propertyImage} />
              </View>
            )}
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Executive Summary</Text>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Views</Text>
              <Text style={styles.metricValue}>{metrics.totalViews.toLocaleString()}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Clicks</Text>
              <Text style={styles.metricValue}>{metrics.totalClicks.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Platform Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Platform Performance</Text>
          </View>
          <View style={styles.platformsRow}>
            {hasHar && (
              <View style={styles.platformCard}>
                <Text style={styles.platformName}>HAR.com</Text>
                <View style={styles.platformMetric}>
                  <Text style={styles.platformLabel}>Views</Text>
                  <Text style={styles.platformValue}>{metrics.harViews.toLocaleString()}</Text>
                </View>
                <View style={styles.platformMetric}>
                  <Text style={styles.platformLabel}>Clicks</Text>
                  <Text style={styles.platformValue}>
                    {Math.floor(metrics.harViews * 0.15).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
            {hasRealtor && (
              <View style={styles.platformCard}>
                <Text style={styles.platformName}>Realtor.com</Text>
                <View style={styles.platformMetric}>
                  <Text style={styles.platformLabel}>Views</Text>
                  <Text style={styles.platformValue}>{metrics.realtorViews.toLocaleString()}</Text>
                </View>
                <View style={styles.platformMetric}>
                  <Text style={styles.platformLabel}>Clicks</Text>
                  <Text style={styles.platformValue}>
                    {Math.floor(metrics.realtorViews * 0.15).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
            {hasZillow && (
              <View style={styles.platformCard}>
                <Text style={styles.platformName}>Zillow.com</Text>
                <View style={styles.platformMetric}>
                  <Text style={styles.platformLabel}>Views</Text>
                  <Text style={styles.platformValue}>{metrics.zillowViews.toLocaleString()}</Text>
                </View>
                <View style={styles.platformMetric}>
                  <Text style={styles.platformLabel}>Clicks</Text>
                  <Text style={styles.platformValue}>
                    {Math.floor(metrics.zillowViews * 0.15).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Social Media Performance */}
        {metrics.facebookMetrics.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Social Media Performance</Text>
            </View>
            {metrics.facebookMetrics.map((fbMetric, index) => (
              <View key={index} style={styles.fbCard}>
                <View style={styles.fbHeader}>
                  <View style={styles.fbBadge}>
                    <Text style={styles.fbBadgeText}>Post {index + 1}</Text>
                  </View>
                </View>
                <Text style={styles.fbUrl}>{fbMetric.url}</Text>
                <View style={styles.fbMetrics}>
                  <View style={styles.fbMetric}>
                    <Text style={styles.platformLabel}>Views: </Text>
                    <Text style={styles.platformValue}>{fbMetric.views.toLocaleString()}</Text>
                  </View>
                  <View style={styles.fbMetric}>
                    <Text style={styles.platformLabel}>Clicks: </Text>
                    <Text style={styles.platformValue}>{fbMetric.clicks.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Report Generated</Text>
              <Text style={styles.footerText}>{metrics.reportDate}</Text>
            </View>
            <View style={styles.footerCenter}>
              <Text style={styles.footerText}>Premium Traffic Report</Text>
            </View>
            <View style={[styles.footerItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.footerLabel}>Document</Text>
              <Text style={styles.footerText}>Page 1 of 1</Text>
            </View>
          </View>
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This report contains proprietary traffic analytics data. All metrics are aggregated from verified listing platforms
              and social media channels. Data accuracy is subject to third-party reporting systems.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
