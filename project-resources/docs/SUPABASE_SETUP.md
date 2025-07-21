# Supabase Setup Guide for DexTrends

## Overview
DexTrends uses Supabase for:
- Collection syncing across devices
- Favorites persistence
- Price history tracking
- Pokemon/Card data caching

## Prerequisites
1. A Supabase account (free tier works)
2. A Supabase project created

## Setup Steps

### 1. Environment Variables
Add these to your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `/supabase/schema.sql`
4. Paste and run it in the SQL Editor

### 3. Enable Realtime (Optional)
For real-time collection updates:
1. Go to Database → Replication
2. Enable replication for:
   - `user_collections`
   - `session_collections`
   - `card_price_history`

### 4. Storage Buckets (Optional)
If you want to store card images:
1. Go to Storage
2. Create a new bucket called `card-images`
3. Set it to public

## Features Enabled by Supabase

### Collections Sync
- Collections automatically sync between devices
- Works for both authenticated and anonymous users
- Anonymous collections expire after 30 days

### Favorites
- Pokemon, cards, and decks can be favorited
- Favorites persist across sessions
- Automatic migration from localStorage

### Price History
- Real price data collection and storage
- Historical price charts
- Price alerts for specific cards

### Caching
- Pokemon and card data cached to reduce API calls
- Automatic cache expiration
- Improved app performance

## Testing the Integration

### 1. Check Connection
Visit: `http://localhost:3001/api/test-supabase`

Expected response:
```json
{
  "connected": true,
  "tables": {
    "user_collections": true,
    "session_collections": true,
    "user_favorites": true,
    "session_favorites": true
  }
}
```

### 2. Test Collections
1. Go to `/collections`
2. Create a new collection
3. Add some cards
4. Refresh the page - data should persist
5. Open in another browser - data should sync

### 3. Test Favorites
1. Go to any Pokemon or card page
2. Click the favorite button
3. Go to `/favorites`
4. Your favorites should appear

## Troubleshooting

### "Supabase not configured" errors
- Check that environment variables are set correctly
- Restart your development server after adding env vars

### Collections not syncing
- Check browser console for errors
- Verify tables were created in Supabase
- Check Row Level Security policies

### Price data not loading
- Ensure `card_price_history` table exists
- Check if price collection job has run
- Verify API endpoints are accessible

## Security Notes

1. **Row Level Security (RLS)**: Currently set to allow all operations. In production, restrict based on user authentication.

2. **API Keys**: Never commit your Supabase keys to git. Always use environment variables.

3. **Session Management**: Anonymous sessions expire after 30 days to prevent database bloat.

## Maintenance

### Clean up expired sessions
Run this SQL periodically (or set up a cron job):
```sql
SELECT cleanup_expired_sessions();
```

### Monitor usage
- Check Database → Usage in Supabase Dashboard
- Monitor API request count
- Set up alerts for quota limits

## Next Steps

1. **Authentication**: Implement Supabase Auth for user accounts
2. **Advanced RLS**: Add proper row-level security based on user IDs
3. **Webhooks**: Set up webhooks for price alerts
4. **Edge Functions**: Use Supabase Edge Functions for complex operations