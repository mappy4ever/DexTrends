#!/usr/bin/env node

/**
 * Script to verify that background cache warming is working
 * Run with: node scripts/verify-cache-warming.js
 */

// Using native fetch (available in Node 18+)

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

async function checkCacheStatus() {
  console.log('Checking cache status...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/cache-status`);
    const data = await response.json();
    
    console.log('Cache Statistics:');
    console.log('- Hit Rate:', data.cache?.performance?.hitRate || '0%');
    console.log('- Total Requests:', data.cache?.performance?.totalRequests || 0);
    console.log('- Error Rate:', data.cache?.performance?.errorRate || '0%');
    console.log('\nBackground Warmer Status:');
    console.log('- Is Running:', data.backgroundWarmer?.isRunning || false);
    console.log('- Startup Warmed:', data.backgroundWarmer?.startupWarmed || false);
    console.log('- Warmed Sets Count:', data.backgroundWarmer?.warmedSetsCount || 0);
    
    if (data.backgroundWarmer?.warmedSets?.length > 0) {
      console.log('- First 5 Warmed Sets:', data.backgroundWarmer.warmedSets.slice(0, 5).join(', '));
    }
    
    // Check specific critical sets
    console.log('\nChecking Critical Sets:');
    const criticalSets = ['sv3pt5', 'sv8pt5', 'sv8', 'sv7', 'sv6pt5'];
    
    for (const setId of criticalSets) {
      const setResponse = await fetch(`${BASE_URL}/api/tcgexpansions/${setId}/complete`);
      const cacheStatus = setResponse.headers.get('x-cache-status');
      const responseTime = setResponse.headers.get('x-response-time');
      
      console.log(`- ${setId}: Cache Status = ${cacheStatus || 'unknown'}, Response Time = ${responseTime || 'unknown'}`);
    }
    
  } catch (error) {
    console.error('Error checking cache status:', error.message);
  }
}

// Run the check
checkCacheStatus();