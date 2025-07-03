#!/usr/bin/env node

// Simple script to trigger price collection
// Can be run manually or via cron job

const https = require('https');

const BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : 'http://localhost:3000';

const API_KEY = process.env.PRICE_COLLECTION_API_KEY;

async function collectPrices(options = {}) {
  const {
    jobType = 'daily',
    limit = 50,
    specificCards = []
  } = options;

  console.log(`🚀 Starting price collection (${jobType})...`);
  console.log(`📊 Target: ${specificCards.length > 0 ? specificCards.length + ' specific cards' : limit + ' popular cards'}`);

  const requestData = JSON.stringify({
    jobType,
    limit,
    specificCards
  });

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    timeout: 300000 // 5 minute timeout
  };

  try {
    const response = await fetch(`${BASE_URL}/api/collect-prices`, {
      ...requestOptions,
      body: requestData
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Price collection completed successfully!');
      console.log(`📈 Results:`);
      console.log(`   • Cards processed: ${result.summary.cardsProcessed}`);
      console.log(`   • Cards updated: ${result.summary.cardsUpdated}`);
      console.log(`   • Cards failed: ${result.summary.cardsFailed}`);
      console.log(`   • Batches processed: ${result.summary.batchesProcessed}`);
      console.log(`   • Job ID: ${result.jobId}`);
      
      return result;
    } else {
      console.error('❌ Price collection failed:', result.error);
      if (result.message) {
        console.error('💬 Message:', result.message);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('🔥 Error running price collection:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--type':
      options.jobType = args[++i];
      break;
    case '--limit':
      options.limit = parseInt(args[++i]);
      break;
    case '--cards':
      options.specificCards = args[++i].split(',');
      break;
    case '--help':
      console.log(`
📊 DexTrends Price Collection Script

Usage:
  node scripts/collect-prices.js [options]

Options:
  --type <type>     Job type: daily, weekly, manual (default: daily)
  --limit <number>  Number of cards to collect (default: 50)
  --cards <ids>     Comma-separated card IDs (overrides limit)
  --help           Show this help message

Examples:
  node scripts/collect-prices.js
  node scripts/collect-prices.js --type weekly --limit 100
  node scripts/collect-prices.js --cards base1-4,base1-9,base1-16

Environment Variables:
  PRICE_COLLECTION_API_KEY - API key for authentication
  NEXT_PUBLIC_VERCEL_URL   - Base URL (for production)
`);
      process.exit(0);
  }
}

// Run the collection
collectPrices(options);