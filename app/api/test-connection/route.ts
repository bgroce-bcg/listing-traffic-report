import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/supabase/test-connection'

/**
 * API Route to test Supabase connection
 * Access this at: http://localhost:3000/api/test-connection
 */
export async function GET() {
  const result = await testConnection()

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  })
}