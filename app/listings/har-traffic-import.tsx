'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { importHarTraffic, ImportHarTrafficResult } from './har-traffic-action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SummaryState {
  result: ImportHarTrafficResult | null
  expanded: boolean
}

export default function HarTrafficImport() {
  const router = useRouter()
  const [rawInput, setRawInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const [summary, setSummary] = useState<SummaryState>({ result: null, expanded: false })

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const result = await importHarTraffic(rawInput)
        setSummary({ result, expanded: false })

        if (result.updated > 0) {
          toast.success(`HAR traffic updated for ${result.updated} listing${result.updated === 1 ? '' : 's'}.`)
        } else if (result.matched > 0) {
          toast.info('Listings matched but no updates were applied.')
        } else {
          toast.warning('No listings were updated. Check unmatched MLS numbers below.')
        }

        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to import HAR traffic.'
        toast.error(message)
      }
    })
  }

  const hasResult = summary.result !== null
  const result = summary.result

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5" />
          HAR Traffic Import
        </CardTitle>
        <CardDescription>
          Paste the HAR traffic table from the MLS export. We&apos;ll match listings by MLS number and update their HAR traffic snapshot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="har-traffic" className="text-sm font-medium text-foreground">
            HAR Traffic Paste
          </label>
          <Textarea
            id="har-traffic"
            placeholder="Paste the HAR traffic table here."
            rows={8}
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            className="font-mono text-sm"
            disabled={isPending}
          />
          <p className="text-xs text-foreground/60">
            Tip: Copy the table from HAR (including headers) and paste it directly here. We&apos;ll handle the matching by MLS #.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-foreground/60">
            Only listings with an MLS # will be updated. Existing numbers are replaced with the latest snapshot.
          </div>
          <Button onClick={handleSubmit} disabled={isPending || rawInput.trim().length === 0}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Importing…' : 'Import Traffic'}
          </Button>
        </div>

        {hasResult && result && (
          <div className="border rounded-lg bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-foreground">Import Summary</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSummary((prev) => ({ ...prev, expanded: !prev.expanded }))}
              >
                {summary.expanded ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Total rows parsed</span>
                <span className="font-medium">{result.totalRows}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Listings matched</span>
                <span className="font-medium">{result.matched}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Listings updated</span>
                <span className="font-medium">{result.updated}</span>
              </div>
            </div>

            {summary.expanded && (
              <div className="space-y-3 pt-2 border-t">
                {result.unmatched.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Unmatched MLS Numbers
                    </div>
                    <ul className="list-disc pl-5 text-sm text-foreground/70 space-y-1">
                      {result.unmatched.map((row) => (
                        <li key={row.mlsNumber}>
                          MLS #{row.mlsNumber}{row.address ? ` – ${row.address}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <XCircle className="h-4 w-4" />
                      Errors
                    </div>
                    <ul className="list-disc pl-5 text-sm text-destructive/80 space-y-1">
                      {result.errors.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.warnings.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      Warnings
                    </div>
                    <ul className="list-disc pl-5 text-sm text-amber-700/80 space-y-1">
                      {result.warnings.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

