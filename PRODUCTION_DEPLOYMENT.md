# Production Deployment Guide

## Environment Configuration

### Required Environment Variables

```bash
# Node Environment - MUST be set to production
NODE_ENV=production

# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key

# External APIs
NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY=your_api_key  # Recommended for better rate limits

# Application URL
NEXT_PUBLIC_API_URL=https://your-production-domain.com
```

### Recommended Production Settings

```bash
# Logging - Use WARN or ERROR in production
LOG_LEVEL=WARN

# Enable Redis for better caching performance
ENABLE_REDIS=true
REDIS_URL=your_redis_url

# Performance monitoring is enabled by default
# Set to true only if you want to disable it
NEXT_PUBLIC_DISABLE_PERFORMANCE_MONITORING=false

# Cache settings
CACHE_TTL=3600000  # 1 hour
MAX_CACHE_SIZE=100  # Increase for production

# Security
RATE_LIMIT_PER_MINUTE=100
CORS_ALLOWED_ORIGINS=https://your-production-domain.com
```

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Set `NODE_ENV=production`
- [ ] Configure all required Supabase variables
- [ ] Set production API URL
- [ ] Configure Redis if available
- [ ] Set appropriate LOG_LEVEL (WARN or ERROR)

### 2. Performance Optimization
- [ ] Redis is configured and running (if available)
- [ ] Cache TTL is appropriately set
- [ ] Performance monitoring is enabled (default)

### 3. Security
- [ ] All sensitive variables are properly secured
- [ ] CORS origins are restricted to production domain
- [ ] Rate limiting is configured
- [ ] Debug information is hidden (automatic in production)

### 4. Database & Cache
- [ ] Supabase connection is tested
- [ ] Redis connection is tested (if enabled)
- [ ] Cache warming will run automatically on startup

## Deployment Steps

### 1. Build the Application

```bash
npm run build
```

### 2. Test Production Build Locally

```bash
npm run start
```

### 3. Deploy to Your Platform

#### Vercel (Recommended)
```bash
vercel --prod
```

#### Other Platforms
Follow your platform's Node.js deployment guide with:
- Node.js 18+ required
- Next.js 15.3.1
- Set all environment variables in platform dashboard

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

### 2. Cache Warming (Optional)
Trigger manual cache warming if needed:
```bash
curl -X POST https://your-domain.com/api/admin/warm-cache \
  -H "Content-Type: application/json" \
  -d '{"mode": "popular", "limit": 10}'
```

### 3. Monitor Logs
- Check application logs for any errors
- Verify LOG_LEVEL is working correctly
- Monitor performance metrics

## Production Behavior

### Automatic Features in Production:
1. **Cache Warming** - Runs automatically on server startup
2. **Error Hiding** - Stack traces and debug info hidden
3. **Performance Monitoring** - Enabled by default
4. **Optimized Logging** - Only ERROR level by default

### Development Features Disabled in Production:
1. Debug console output
2. Detailed error stack traces in API responses
3. Development-only API endpoints
4. Fast Refresh and HMR

## Troubleshooting

### Issue: High Memory Usage
- Reduce `MAX_CACHE_SIZE`
- Enable Redis for external caching
- Monitor with performance tools

### Issue: Slow API Responses
- Check Pokemon TCG API key is configured
- Verify Redis is working
- Review cache hit rates

### Issue: Cache Not Working
- Verify Redis connection string
- Check `ENABLE_REDIS` is set to true
- Review Redis logs

## Monitoring

The application includes built-in performance monitoring that tracks:
- Core Web Vitals (FCP, LCP, CLS, FID)
- API response times
- Cache hit rates
- Memory usage

Access metrics at: `/api/metrics` (consider securing this endpoint in production)

## Security Notes

1. Never expose `.env.local` or `.env.production` files
2. Use environment variables from your hosting platform
3. Regularly update dependencies for security patches
4. Consider implementing additional authentication for admin endpoints
5. Review and restrict CORS origins

## Support

For issues or questions about deployment, check:
- Application logs via your hosting platform
- `/api/health` endpoint for system status
- Performance metrics for bottlenecks