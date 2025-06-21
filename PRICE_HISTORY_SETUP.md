# 📈 DexTrends Price History Setup Guide

This guide will help you set up automated Pokemon card price history collection for your DexTrends app.

## 🗄️ Step 1: Database Setup

### Add Price History Tables
Run the following SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase-price-history-schema.sql
```

This creates tables for:
- `card_price_history` - Daily price snapshots
- `set_price_history` - Aggregate set pricing
- `price_collection_jobs` - Track collection runs
- `price_alerts` - User price notifications

## 🔑 Step 2: Environment Variables

Add to your `.env.local`:

```bash
# Optional: API key for price collection endpoint protection
PRICE_COLLECTION_API_KEY=your_secret_key_here

# Your existing Pokemon TCG API key (for rate limiting)
NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY=your_pokemon_tcg_api_key
```

## 🚀 Step 3: Manual Price Collection

### Test the System
```bash
# Test price collection manually
curl -X POST http://localhost:3000/api/collect-prices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key_here" \
  -d '{"jobType": "manual", "limit": 10}'
```

### Using the Script
```bash
# Make the script executable
chmod +x scripts/collect-prices.js

# Run manually
node scripts/collect-prices.js --type manual --limit 20

# Collect specific cards
node scripts/collect-prices.js --cards base1-4,base1-9,base1-16
```

## ⏰ Step 4: Automated Collection

### Option A: Vercel Cron Jobs (Recommended for Production)

Add to your `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/collect-prices",
      "schedule": "0 6 * * *"
    }
  ]
}
```

### Option B: GitHub Actions (Free Alternative)

Create `.github/workflows/collect-prices.yml`:
```yaml
name: Collect Pokemon Card Prices
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  collect-prices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/collect-prices.js --type daily --limit 50
        env:
          PRICE_COLLECTION_API_KEY: ${{ secrets.PRICE_COLLECTION_API_KEY }}
          NEXT_PUBLIC_VERCEL_URL: ${{ secrets.VERCEL_URL }}
```

### Option C: Local Cron Job

```bash
# Edit crontab
crontab -e

# Add daily collection at 6 AM
0 6 * * * cd /path/to/DexTrends && node scripts/collect-prices.js --type daily
```

## 📊 Step 5: Display Price History

### Add to Card Detail Pages

```jsx
import PriceHistory from '../components/PriceHistory';

// In your card component
<PriceHistory 
  cardId={card.id} 
  cardName={card.name}
  variantType="holofoil" 
/>
```

### Example Usage
```jsx
// Show price history for Charizard Base Set
<PriceHistory 
  cardId="base1-4" 
  cardName="Charizard"
  variantType="holofoil" 
/>
```

## 🔧 Step 6: Monitoring & Maintenance

### Check Collection Status
```javascript
import { PriceHistoryManager } from '../lib/supabase';

// Get recent collection jobs
const jobs = await PriceHistoryManager.getRecentCollectionJobs();
console.log('Recent jobs:', jobs);

// Check if we have recent data
const hasData = await PriceHistoryManager.hasRecentPriceData('base1-4');
console.log('Has recent data:', hasData);
```

### Database Maintenance
```sql
-- Clean up old price history (keeps 1 year)
SELECT cleanup_old_price_history(365);

-- Check collection job status
SELECT * FROM price_collection_jobs 
ORDER BY created_at DESC 
LIMIT 10;
```

## 📈 Expected Results

After setup, you'll have:

### ✅ Immediate Benefits
- **API endpoint** for price collection
- **Database schema** for historical data
- **Utility functions** for data access
- **React component** for price charts

### ✅ After First Collection
- Current price snapshots in database
- Basic price statistics
- Collection job tracking

### ✅ After 1 Week
- Price trend data
- Day-over-day changes
- Basic volatility metrics

### ✅ After 1 Month
- Meaningful price charts
- Statistical analysis
- Trend identification

## 🛠️ Customization Options

### Target Specific Sets
```javascript
// Modify the API to target specific sets
const response = await fetch(
  'https://api.pokemontcg.io/v2/cards?q=set.id:base1&pageSize=50'
);
```

### Adjust Collection Frequency
```javascript
// Change batch size and delays in collect-prices.js
const BATCH_SIZE = 10;  // Smaller batches for API respect
const DELAY_BETWEEN_BATCHES = 2000;  // 2 second delay
```

### Add Price Alerts
```javascript
// Add user price alerts
await PriceHistoryManager.addPriceAlert(
  userId, 
  'base1-4', 
  'Charizard', 
  'price_drop', 
  100.00  // Alert when price drops to $100
);
```

## 🚨 Troubleshooting

### Common Issues

**API Rate Limiting**
- Increase delays between batches
- Reduce batch size
- Use Pokemon TCG API key

**Database Errors**
- Check Supabase connection
- Verify table permissions
- Review error logs

**Missing Price Data**
- Check if cards have TCGplayer prices
- Verify API response format
- Test with known card IDs

### Debug Commands
```bash
# Test single card
node -e "
const fetch = require('node-fetch');
fetch('https://api.pokemontcg.io/v2/cards/base1-4')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d.data.tcgplayer, null, 2)))
"
```

---

🎉 **You're all set!** Your DexTrends app will now start building its own historical Pokemon card price database.

The system will automatically:
- Collect daily price snapshots
- Track price trends over time  
- Provide rich analytics and charts
- Store data for long-term analysis

Start small with 10-20 popular cards and expand from there!