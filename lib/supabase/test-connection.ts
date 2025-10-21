import { createClient } from './server'

/**
 * Tests the Supabase connection by attempting to query the database
 * This function can be called from a Server Component or API Route to verify connectivity
 *
 * @returns Object containing connection status and details
 */
export async function testConnection() {
  try {
    const supabase = await createClient()

    // Try to query the database - this will fail if connection is not working
    const { data, error } = await supabase
      .from('listings')
      .select('id')
      .limit(1)

    if (error) {
      // If the listings table doesn't exist yet, that's okay
      // We're just testing the connection
      // PGRST205 = table not found in PostgREST, 42P01 = table not found in PostgreSQL
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return {
          success: true,
          message: 'Connection successful! Database is ready (no listings table yet)',
          details: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          }
        }
      }

      return {
        success: false,
        message: 'Connection failed',
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
        }
      }
    }

    return {
      success: true,
      message: 'Connection successful!',
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        listingsFound: data?.length || 0,
      }
    }
  } catch (err) {
    return {
      success: false,
      message: 'Connection test failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}