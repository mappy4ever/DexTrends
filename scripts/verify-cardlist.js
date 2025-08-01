const http = require('http');

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  throw new Error('Failed to fetch after retries');
}

async function verifyCardListImplementation() {
  console.log('🔍 Verifying CardList implementation...\n');
  
  try {
    // Check sv8 (large set)
    console.log('📊 Testing sv8 (large set with >50 cards)...');
    const sv8Html = await fetchWithRetry('http://localhost:3002/tcgsets/sv8');
    
    // Check if VirtualizedCardGrid reference is removed
    if (sv8Html.includes('VirtualizedCardGrid')) {
      console.log('❌ ERROR: Found VirtualizedCardGrid reference in HTML');
    } else {
      console.log('✅ No VirtualizedCardGrid references found');
    }
    
    // Check if CardList is mentioned in debug info
    if (sv8Html.includes('Component: CardList')) {
      console.log('✅ Debug info shows CardList component');
    } else {
      console.log('⚠️  Debug info not showing CardList component');
    }
    
    // Check for 500-card limit message
    if (sv8Html.includes('Showing first 500 of')) {
      console.log('✅ Found 500-card limit message');
    } else {
      console.log('ℹ️  No 500-card limit message (set might have <500 cards)');
    }
    
    console.log('\n📊 Testing sv10 (smaller set)...');
    const sv10Html = await fetchWithRetry('http://localhost:3002/tcgsets/sv10');
    
    if (!sv10Html.includes('VirtualizedCardGrid') && sv10Html.includes('Component: CardList')) {
      console.log('✅ sv10 correctly using CardList');
    } else {
      console.log('❌ sv10 has issues with component selection');
    }
    
    console.log('\n✨ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    console.log('\nMake sure the dev server is running on port 3002');
  }
}

verifyCardListImplementation();