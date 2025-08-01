#!/usr/bin/env node

/**
 * Critical cache warming script - run this to pre-load essential data
 * Usage: node scripts/warm-critical-cache.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3004';

const CACHE_TOKEN = process.env.CACHE_WARM_TOKEN || 'your-secure-token-here';

console.log('🔥 Starting critical cache warming...');
console.log(`📍 Base URL: ${BASE_URL}`);

// Simple HTTP/HTTPS request helper
function makeRequest(url, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
    
    const req = client.get(url, (res) => {
      clearTimeout(timeoutId);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
    
    req.setTimeout(timeout);
  });
}

async function warmCache() {
  const tasks = [
    {
      name: 'TCG Sets List (Page 1)',
      url: `${BASE_URL}/api/admin/warm-sets-list-simple?token=${CACHE_TOKEN}&page=1&pageSize=25`,
      priority: 'CRITICAL'
    },
    {
      name: 'Popular Set sv8 Complete',
      url: `${BASE_URL}/api/tcg-sets/sv8/complete`,
      priority: 'HIGH'
    },
    {
      name: 'Popular Set sv7 Complete', 
      url: `${BASE_URL}/api/tcg-sets/sv7/complete`,
      priority: 'HIGH'
    },
    {
      name: 'Market Trends',
      url: `${BASE_URL}/api/market/trends?limit=20`,
      priority: 'MEDIUM'
    },
    {
      name: 'TCG Sets List (Page 2)',
      url: `${BASE_URL}/api/admin/warm-sets-list-simple?token=${CACHE_TOKEN}&page=2&pageSize=25`,
      priority: 'MEDIUM'
    }
  ];
  
  console.log(`\n📋 Warming ${tasks.length} cache entries...\n`);
  
  const results = [];
  
  for (const task of tasks) {
    const startTime = Date.now();
    
    try {
      console.log(`⏳ ${task.priority}: ${task.name}...`);
      
      const result = await makeRequest(task.url, 120000); // 2 minute timeout
      const duration = Date.now() - startTime;
      
      if (result.status === 200) {
        console.log(`✅ ${task.name} - ${duration}ms`);
        results.push({ ...task, status: 'success', duration });
      } else {
        console.log(`❌ ${task.name} - HTTP ${result.status} - ${duration}ms`);
        results.push({ ...task, status: 'failed', duration, error: `HTTP ${result.status}` });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${task.name} - ${error.message} - ${duration}ms`);
      results.push({ ...task, status: 'error', duration, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Cache Warming Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status !== 'success').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Total time: ${totalDuration}ms`);
  
  if (failed > 0) {
    console.log('\n❌ Failed tasks:');
    results.filter(r => r.status !== 'success').forEach(task => {
      console.log(`   • ${task.name}: ${task.error}`);
    });
  }
  
  console.log('\n🎉 Cache warming completed!');
  
  // Exit with error code if critical tasks failed
  const criticalFailed = results.filter(r => r.priority === 'CRITICAL' && r.status !== 'success').length;
  if (criticalFailed > 0) {
    console.log('⚠️  Critical cache warming failed - some pages may be slow');
    process.exit(1);
  }
  
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Cache warming interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Cache warming terminated');
  process.exit(1);
});

// Run the warming
warmCache().catch(error => {
  console.error('💥 Cache warming failed:', error);
  process.exit(1);
});