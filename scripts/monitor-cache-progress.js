#!/usr/bin/env node

/**
 * Monitor cache warming progress
 */

// Using native fetch (available in Node 18+)

async function checkCacheProgress() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Get all sets
    const setsResponse = await fetch(`${baseUrl}/api/tcgexpansions?pageSize=250`);
    const setsData = await setsResponse.json();
    
    if (!setsData.data) {
      console.error('Could not fetch sets data');
      return;
    }
    
    const allSets = setsData.data;
    console.log(`📊 Checking cache status for ${allSets.length} sets...\n`);
    
    let cached = 0;
    let notCached = 0;
    const sampleSize = Math.min(20, allSets.length); // Check first 20 sets
    
    // Check a sample of sets
    for (let i = 0; i < sampleSize; i++) {
      const set = allSets[i];
      try {
        const response = await fetch(`${baseUrl}/api/tcgexpansions/${set.id}/complete`, {
          method: 'HEAD',
          timeout: 2000
        });
        
        const cacheStatus = response.headers.get('x-cache-status');
        if (cacheStatus === 'hit' || cacheStatus === 'stale-hit') {
          cached++;
          console.log(`✅ ${set.id} - ${set.name} (cached)`);
        } else {
          notCached++;
          console.log(`⏳ ${set.id} - ${set.name} (not cached)`);
        }
      } catch (error) {
        notCached++;
        console.log(`❌ ${set.id} - ${set.name} (error)`);
      }
    }
    
    console.log(`\n📈 Cache Progress (sample of ${sampleSize} sets):`);
    console.log(`   Cached: ${cached}/${sampleSize} (${Math.round(cached/sampleSize * 100)}%)`);
    console.log(`   Not Cached: ${notCached}/${sampleSize}`);
    
    // Estimate total progress
    const estimatedTotal = Math.round((cached / sampleSize) * allSets.length);
    console.log(`\n📊 Estimated Total Progress:`);
    console.log(`   ~${estimatedTotal}/${allSets.length} sets cached`);
    console.log(`   ~${Math.round((estimatedTotal / allSets.length) * 100)}% complete`);
    
  } catch (error) {
    console.error('Error checking cache progress:', error.message);
  }
}

// Run the check
checkCacheProgress();