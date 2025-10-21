'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'

type HarTrafficEntry = {
  address?: string
  mlsNumber: string
  daysOnMarket?: number | null
  status?: string | null
  desktopViews?: number | null
  mobileViews?: number | null
  photoViews?: number | null
}

export interface ImportHarTrafficResult {
  totalRows: number
  matched: number
  updated: number
  unmatched: Array<{ mlsNumber: string; address?: string }>
  errors: string[]
  warnings: string[]
}

const STATUS_MAP: Record<string, string> = {
  A: 'Active',
  P: 'Pending',
  S: 'Sold',
  PS: 'Pending Continue to Show',
  OP: 'Option Pending',
  T: 'Temporarily Off Market',
}

const numberOrNull = (value?: string | null): number | null => {
  if (!value) return null
  const cleaned = value.replace(/,/g, '').trim()
  if (!cleaned) return null
  const parsed = Number.parseInt(cleaned, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function splitColumns(line: string): string[] {
  if (line.includes('\t')) {
    return line.split('\t').map((part) => part.trim())
  }
  // Fallback: split on 2+ spaces when tabs are missing
  return line.split(/\s{2,}/).map((part) => part.trim())
}

function normalizeMls(value: string | undefined): string | null {
  if (!value) return null
  const digits = value.replace(/[^0-9]/g, '')
  return digits.length > 0 ? digits : null
}

function parseHarTraffic(rawInput: string): {
  entries: HarTrafficEntry[]
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const entries: HarTrafficEntry[] = []

  const trimmed = rawInput.trim()
  if (!trimmed) {
    return { entries, errors: ['No HAR traffic data provided.'], warnings }
  }

  const lines = trimmed
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { entries, errors: ['No HAR traffic data provided.'], warnings }
  }

  const headerIndex = lines.findIndex((line) => /mls#/i.test(line) || /mls number/i.test(line))
  const dataLines = headerIndex >= 0 ? lines.slice(headerIndex + 1) : lines

  for (let i = 0; i < dataLines.length; i++) {
    const current = dataLines[i]
    const currentParts = splitColumns(current)

    let combinedParts = currentParts

    if (combinedParts.length < 7 && i + 1 < dataLines.length) {
      const nextLine = dataLines[i + 1]
      const nextParts = splitColumns(nextLine)
      const merged = [...currentParts, ...nextParts]
      if (merged.length >= 7) {
        combinedParts = merged
        i += 1
      }
    }

    if (combinedParts.length < 2) {
      warnings.push(`Skipping line ${i + 1} – not enough columns to parse MLS number.`)
      continue
    }

    const [addressRaw, mlsRaw, daysRaw, statusRaw, desktopRaw, mobileRaw, photoRaw] = combinedParts

    const mlsNumber = normalizeMls(mlsRaw)
    if (!mlsNumber) {
      warnings.push(`Skipping row with address "${addressRaw ?? 'Unknown'}" – MLS number missing.`)
      continue
    }

    const daysOnMarket = numberOrNull(daysRaw)
    const desktopViews = numberOrNull(desktopRaw)
    const mobileViews = numberOrNull(mobileRaw)
    const photoViews = numberOrNull(photoRaw)

    const status = statusRaw?.trim()
    const mappedStatus = status ? STATUS_MAP[status.toUpperCase()] ?? status : null

    entries.push({
      address: addressRaw?.trim() || undefined,
      mlsNumber,
      daysOnMarket,
      status: mappedStatus,
      desktopViews,
      mobileViews,
      photoViews,
    })
  }

  return { entries, errors, warnings }
}

export async function importHarTraffic(rawInput: string): Promise<ImportHarTrafficResult> {
  const { entries, errors: parseErrors, warnings } = parseHarTraffic(rawInput)

  if (parseErrors.length > 0) {
    throw new Error(parseErrors[0])
  }

  if (entries.length === 0) {
    throw new Error('No HAR traffic rows detected. Please double-check the pasted data.')
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(userError.message)
  }

  if (!user) {
    throw new Error('You must be signed in to import HAR traffic.')
  }

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, name, user_id')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (listingsError) {
    throw new Error(listingsError.message)
  }

  const listingsByMls = new Map<
    string,
    {
      id: string
    }
  >()
  for (const listing of listings ?? []) {
    // Extract MLS number from listing name if it contains one
    const mlsMatch = listing.name.match(/\b\d{5,}\b/)
    if (!mlsMatch) continue
    const normalized = normalizeMls(mlsMatch[0])
    if (normalized) {
      listingsByMls.set(normalized, {
        id: listing.id,
      })
    }
  }

  const unmatched: Array<{ mlsNumber: string; address?: string }> = []
  const errors: string[] = []
  let updated = 0

  for (const entry of entries) {
    const listing = listingsByMls.get(entry.mlsNumber)
    if (!listing) {
      unmatched.push({ mlsNumber: entry.mlsNumber, address: entry.address })
      continue
    }

    // Note: HAR snapshot fields (har_desktop_views, etc.) have been removed from schema
    // This import feature needs to be updated to use the analytics table instead
    // Skipping update for now - this feature requires refactoring
    const updates: Partial<Database['public']['Tables']['listings']['Row']> = {}

    const hasChanges = false // Disabled until schema supports HAR snapshot fields

    if (!hasChanges) {
      continue
    }

    const { error: updateError } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listing.id)

    if (updateError) {
      errors.push(`Failed to update MLS ${entry.mlsNumber}: ${updateError.message}`)
      continue
    }

    updated += 1
  }

  return {
    totalRows: entries.length,
    matched: entries.length - unmatched.length,
    updated,
    unmatched,
    errors,
    warnings,
  }
}

