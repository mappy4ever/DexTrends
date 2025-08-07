#!/usr/bin/env node

// Simple script to trigger price collection
// Can be run manually or via cron job

const https = require('https');
const logger = require('./utils/logger');

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

  logger.info(`Starting price collection (${jobType})...`);
  logger.info(`Target: ${specificCards.length > 0 ? specificCards.length + ' specific cards' : limit + ' popular cards'}`);

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
      logger.info('Price collection completed successfully!');
      logger.info('Results:', {
        cardsProcessed: result.summary.cardsProcessed,
        cardsUpdated: result.summary.cardsUpdated,
        cardsFailed: result.summary.cardsFailed,
        batchesProcessed: result.summary.batchesProcessed,
        jobId: result.jobId
      });
      
      return result;
    } else {
      logger.error('Price collection failed:', { error: result.error });
      if (result.message) {
        logger.error('Message:', { message: result.message });
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error('Error running price collection:', { error: error.message });
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
      logger.info(`
DexTrends Price Collection Script

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