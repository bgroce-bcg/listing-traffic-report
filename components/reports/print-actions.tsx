'use client'

import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface PrintActionsProps {
  listingId?: string
}

export function PrintActions({ listingId }: PrintActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleSaveAsPDF = async () => {
    try {
      setIsDownloading(true)

      // Fetch PDF from API
      const response = await fetch(`/api/reports/${listingId}/pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'Traffic_Report.pdf'

      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="no-print mt-8">
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleSaveAsPDF}
          className="px-6 py-3 bg-red-500 text-white hover:bg-red-600"
          size="lg"
          disabled={isDownloading || !listingId}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-5 w-5" />
              Save as PDF
            </>
          )}
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          size="lg"
        >
          <Printer className="mr-2 h-5 w-5" />
          Print Report
        </Button>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Go Back
        </Button>
      </div>
    </div>
  )
}
