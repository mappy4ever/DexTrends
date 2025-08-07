#!/usr/bin/env node

/**
 * Script to cache ALL TCG sets
 * Run with: node scripts/cache-all-sets.js
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const logger = require('./utils/logger');

async function cacheAllSets() {
  const baseUrl = 'http://localhost:3000';
  const token = process.env.CACHE_WARM_TOKEN || 'your-secure-token-here';
  
  logger.info('Starting cache warming for ALL TCG sets...');
  logger.info('This may take a while (30-60 minutes for all sets)');
  
  try {
    // First, let's check how many sets we have
    const statusResponse = await fetch(`${baseUrl}/api/tcg-sets`);
    const setsData = await statusResponse.json();
    
    if (setsData.error) {
      logger.error('Error fetching sets list:', { error: setsData.error });
      return;
    }
    
    const totalSets = setsData.totalCount || setsData.data?.length || 0;
    logger.info(`Found ${totalSets} total TCG sets to cache`);
    
    // Now trigger the cache warming for ALL sets
    logger.info('Triggering cache warming for ALL sets...');
    const warmResponse = await fetch(`${baseUrl}/api/admin/warm-cache?all=true&token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Don't timeout - this will take a while
      timeout: 0
    });
    
    if (!warmResponse.ok) {
      const errorText = await warmResponse.text();
      console.error('Error starting cache warming:', errorText);
      return;
    }
    
    const result = await warmResponse.json();
    
    console.log('\nCache warming completed!');
    console.log('Results:', {
      total: result.results?.total || 0,
      successful: result.results?.successful || 0,
      failed: result.results?.failed || 0,
      skipped: result.results?.skipped || 0,
      duration: result.duration ? `${(result.duration / 1000 / 60).toFixed(2)} minutes` : 'unknown'
    });
    
    if (result.results?.failed > 0) {
      console.log('\nFailed sets:');
      result.results.errors.forEach(err => {
        console.log(`- ${err.setId}: ${err.error}`);
      });
    }
    
  } catch (error) {
    console.error('Error during cache warming:', error.message);
    
    // If it's a timeout, that's expected for large operations
    if (error.message.includes('timeout')) {
      console.log('\nNote: The request timed out, but cache warming may still be running in the background.');
      console.log('Check the cache status with: npm run verify-cache');
    }
  }
}

// Add option to warm specific sets
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: node scripts/cache-all-sets.js [options]');
  console.log('Options:');
  console.log('  --help     Show this help message');
  console.log('  --status   Check cache warming status only');
  process.exit(0);
}

if (args.includes('--status')) {
  // Just check status
  fetch('http://localhost:3000/api/admin/cache-status')
    .then(res => res.json())
    .then(data => {
      console.log('Cache Status:');
      console.log('- Background Warmer Running:', data.backgroundWarmer?.isRunning || false);
      console.log('- Warmed Sets Count:', data.backgroundWarmer?.warmedSetsCount || 0);
      console.log('- Cache Hit Rate:', data.cache?.performance?.hitRate || '0%');
    })
    .catch(err => console.error('Error checking status:', err));
} else {
  // Run the cache warming
  cacheAllSets();
}