# Troubleshooting: Manual Data Not Saving

## Issue
When attempting to add manual data from the `/listings/{id}` page, the data doesn't get saved to the database.

## Root Causes

### 1. Authentication Issues (Most Common)
The database tables use Row Level Security (RLS) policies that require authentication. If you're not properly logged in, inserts will be silently blocked.

**Check:**
- Are you logged in to the application?
- Does your browser have a valid session cookie?
- Check browser console for authentication errors

**Fix:**
1. Log out and log back in
2. Clear browser cookies and re-authenticate
3. Check network tab for 401 unauthorized errors

### 2. No Listings in Database
The manual data forms require an existing listing. If there are no listings, you can't access the page.

**Check:**
```bash
# Run diagnostic script
node scripts/check-metrics-tables.js
```

**Fix:**
1. Create a listing first via `/listings/new`
2. Then add manual data to that listing

### 3. Missing Facebook URLs
For Facebook metrics, you must first add a Facebook URL to the listing.

**Check:**
- Does the listing have at least one Facebook URL?
- Look for the Facebook URLs section on the listing detail page

**Fix:**
1. Scroll to "Facebook URLs Manager" section
2. Add a Facebook post URL
3. Then you can add Facebook metrics

### 4. Database Tables Not Created
The `platform_metrics` and `facebook_metrics` tables must exist.

**Check:**
```bash
# Run diagnostic script
node scripts/check-metrics-tables.js
```

**Fix:**
```bash
# Apply migrations
npx supabase db push
```

### 5. RLS Policy Issues
The RLS policies check that the listing belongs to the authenticated user.

**Verify:**
- The listing's `user_id` matches your authenticated user ID
- Check Supabase dashboard for RLS policy errors

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to submit manual data
4. Look for error messages with these prefixes:
   - `[addPlatformMetrics]`
   - `[addFacebookMetrics]`
   - `Platform metrics submission error:`
   - `Facebook metrics submission error:`
   - `HAR data update error:`

### Step 2: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to submit manual data
4. Look for POST requests to Supabase
5. Check the response status code:
   - 401: Authentication issue
   - 403: RLS policy blocking the insert
   - 422: Validation error
   - 500: Server error

### Step 3: Run Diagnostic Scripts
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL=https://wuoxgzglvnhoxrgaukft.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Check if tables exist
node scripts/check-metrics-tables.js

# Test insert operations (requires auth)
node scripts/test-manual-data-insert.js
```

### Step 4: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Table Editor
4. Verify tables exist:
   - `platform_metrics`
   - `facebook_metrics`
5. Try to manually insert a row to test RLS policies

## Common Error Messages

### "Failed to add platform metrics: new row violates row-level security policy"
**Cause:** You're not authenticated or the listing doesn't belong to your user
**Fix:** Log in with the account that owns the listing

### "Failed to add Facebook metrics: insert or update on table violates foreign key constraint"
**Cause:** The Facebook URL ID doesn't exist
**Fix:** Add a Facebook URL to the listing first

### "Failed to add platform metrics: duplicate key value violates unique constraint"
**Cause:** Metrics already exist for this listing, platform, and date
**Fix:** This issue has been resolved - the forms now use `upsert` which will update existing records instead of creating duplicates. If you still see this error, please update your code.

### Silent Failure (No Error Message)
**Cause:** Usually an authentication issue or RLS policy blocking the insert
**Fix:** Check browser console and network tab for detailed errors

## Prevention

1. **Always be logged in** when adding manual data
2. **Create listings first** before trying to add metrics
3. **Add Facebook URLs** before adding Facebook metrics
4. **Check console logs** for detailed error information
5. **Use unique dates** for each metrics entry

## Enhanced Error Logging

As of the latest update, all manual data forms now include:
- Console logging of submission data
- Detailed error messages in toasts
- Error object logging in console

This makes it much easier to debug issues!

## Need More Help?

If you're still experiencing issues:
1. Check all browser console logs
2. Check Supabase logs in the dashboard
3. Run the diagnostic scripts
4. Check that all migrations have been applied
5. Verify RLS policies are correctly configured
