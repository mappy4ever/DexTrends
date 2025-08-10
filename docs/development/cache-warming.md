# Background Cache Warming

## Overview

The DexTrends application implements automatic background cache warming to ensure first-time visitors experience fast load times (< 10ms) instead of waiting 30-60 seconds for data to load from the Pokemon TCG API.

## How It Works

### Automatic Startup Warming
When the server starts, the cache warming service automatically:
1. Loads critical sets (sv3pt5/151, sv8pt5, sv8, sv7, etc.) 
2. Caches complete set data including all cards
3. Caches individual card details, images, and prices
4. Runs full cache warming every 48 hours to keep data fresh

### Priority-Based Warming
Sets are warmed based on priority:
- **Critical**: Most recent sets and popular sets like 151 (sv3pt5)
- **High**: Classic sets like Base Set and Crown Zenith
- **Medium**: Other popular sets from the curated list

### Cache Update Strategy
- **Full Cache Warming**: Every 48 hours - Updates all set data, cards, images, and prices
- This reduces Redis operations by ~87.5% compared to the original 6-hour interval
- Price data stays reasonably fresh as it's included in the full refresh

## Verification

To verify cache warming is working:

```bash
# Check cache status
npm run verify-cache

# Manually trigger cache warming
curl -X POST http://localhost:3000/api/admin/startup-warming

# Check specific set performance
curl -I http://localhost:3000/api/tcg-sets/sv3pt5/complete
# Look for X-Cache-Status: hit
```

## Configuration

### Environment Variables
- `NODE_ENV=production` - Enables automatic cache warming
- `ENABLE_DEV_CACHE_WARMING=true` - Enable in development
- `CACHE_WARM_TOKEN` - Authentication token for admin endpoints

### Critical Sets
The following sets are prioritized for immediate caching:
- sv8pt5 (Prismatic Evolutions)
- sv8 (Surging Sparks)
- sv7 (Stellar Crown)
- sv6pt5 (Shrouded Fable)
- sv6 (Twilight Masquerade)
- sv5 (Temporal Forces)
- sv4pt5 (Paldean Fates)
- sv4 (Paradox Rift)
- sv3pt5 (151) - User specifically mentioned this one!
- sv3 (Obsidian Flames)

## Monitoring

The cache status endpoint provides real-time information:
```
GET /api/admin/cache-status
```

Returns:
- Cache hit/miss statistics
- Background warmer status
- List of warmed sets
- Redis connection health

## Troubleshooting

### Sets Still Loading Slowly
1. Check if background warmer is running: `npm run verify-cache`
2. Verify Redis is connected properly
3. Check logs for warming errors
4. Manually trigger warming for specific sets

### "Set not found" Errors
This has been fixed - background refresh failures are now handled gracefully and won't affect cached data serving.

### Redis Connection Issues
If you see "max clients reached" errors:
1. Call the redis reset endpoint: `POST /api/admin/redis-reset`
2. Check Redis connection pooling settings
3. Monitor active connections