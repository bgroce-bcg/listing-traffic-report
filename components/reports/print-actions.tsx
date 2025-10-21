'use client'

import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'

export function PrintActions() {
  return (
    <div className="no-print mt-8 flex justify-center gap-4">
      <Button
        onClick={() => window.print()}
        className="px-6 py-3 bg-red-500 text-white hover:bg-red-600"
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
  )
}
