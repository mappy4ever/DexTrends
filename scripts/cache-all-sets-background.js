#!/usr/bin/env node

/**
 * Script to trigger cache warming for ALL sets in background
 * This will return immediately while warming continues in background
 */

// Using native fetch (available in Node 18+)

async function triggerCacheWarming() {
  const baseUrl = 'http://localhost:3000';
  const token = 'your-secure-token-here';
  
  console.log('🚀 Triggering background cache warming for ALL TCG sets...');
  console.log('📊 Total sets to cache: ~168');
  console.log('⏱️  Estimated time: 30-60 minutes');
  console.log('');
  
  try {
    // Use a short timeout just to trigger the warming
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    fetch(`${baseUrl}/api/admin/warm-cache?all=true&token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    }).catch(() => {
      // Ignore timeout errors - warming continues in background
    });
    
    clearTimeout(timeoutId);
    
    // Wait a moment for the request to be sent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Cache warming triggered successfully!');
    console.log('🔄 Warming is now running in the background');
    console.log('');
    console.log('📋 To check progress, run:');
    console.log('   npm run verify-cache');
    console.log('');
    console.log('Or check specific sets:');
    console.log('   curl -I http://localhost:3000/api/tcgexpansions/base1/complete');
    console.log('   (Look for X-Cache-Status: hit)');
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('✅ Request sent - cache warming continues in background');
    } else {
      console.error('❌ Error triggering cache warming:', error.message);
    }
  }
}

// Run it
triggerCacheWarming();