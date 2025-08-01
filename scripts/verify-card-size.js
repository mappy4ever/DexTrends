const puppeteer = require('puppeteer');

async function verifyCardSize() {
  console.log('🔍 Verifying card size changes...\n');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test on desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📊 Loading TCG set page...');
    await page.goto('http://localhost:3002/tcgsets/sv8', { waitUntil: 'networkidle2' });
    
    // Wait for cards to load
    await page.waitForSelector('.grid > div', { timeout: 30000 });
    
    // Check grid classes
    const gridClasses = await page.$eval('.grid', el => el.className);
    console.log('Grid classes:', gridClasses);
    
    // Count cards per row on different viewports
    const viewports = [
      { name: 'Mobile', width: 375, expectedCols: 2 },
      { name: 'Tablet', width: 768, expectedCols: 4 },
      { name: 'Desktop', width: 1280, expectedCols: 6 },
      { name: 'Wide', width: 1920, expectedCols: 8 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: 800 });
      await page.waitForTimeout(500); // Wait for layout to adjust
      
      const cardsPerRow = await page.evaluate(() => {
        const grid = document.querySelector('.grid');
        const firstCard = grid?.querySelector('div');
        if (!firstCard) return 0;
        
        const cardWidth = firstCard.offsetWidth;
        const gridWidth = grid.offsetWidth;
        const gap = parseInt(window.getComputedStyle(grid).gap) || 0;
        
        return Math.floor((gridWidth + gap) / (cardWidth + gap));
      });
      
      console.log(`${viewport.name} (${viewport.width}px): ${cardsPerRow} cards per row (expected: ${viewport.expectedCols})`);
    }
    
    // Check for debug info (should not exist)
    const debugInfo = await page.$('.bg-yellow-100');
    if (debugInfo) {
      console.log('❌ Debug info still present!');
    } else {
      console.log('✅ Debug info successfully removed');
    }
    
    console.log('\n✨ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  verifyCardSize();
} catch (e) {
  console.log('📦 Puppeteer not installed. Using simple fetch verification...\n');
  
  // Fallback to simple verification
  const http = require('http');
  
  fetch('http://localhost:3002/tcgsets/sv8')
    .then(res => res.text())
    .then(html => {
      // Check for grid classes
      if (html.includes('grid-cols-2') && html.includes('xl:grid-cols-8')) {
        console.log('✅ Grid classes updated correctly');
      } else {
        console.log('❌ Grid classes may not be updated');
      }
      
      // Check for debug info
      if (html.includes('Debug Info:')) {
        console.log('❌ Debug info still present');
      } else {
        console.log('✅ Debug info removed');
      }
      
      console.log('\n✨ Basic verification complete!');
    })
    .catch(err => {
      console.error('❌ Error:', err.message);
      console.log('Make sure dev server is running on port 3002');
    });
}