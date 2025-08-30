// Quick test script to verify TCG page loads
const { chromium } = require('playwright');

(async () => {
  console.log('Starting TCG page test...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test 1: Load TCG sets list
    console.log('\n1. Testing TCG sets list page...');
    await page.goto('http://localhost:3003/tcgexpansions', { waitUntil: 'networkidle' });
    const setsTitle = await page.textContent('h1');
    console.log('✓ Sets page loaded, title:', setsTitle);
    
    // Test 2: Load specific set (sv5)
    console.log('\n2. Testing specific set page (sv5)...');
    await page.goto('http://localhost:3003/tcgexpansions/sv5', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // Wait for lazy loading
    
    // Check for key elements
    const hasSetHeader = await page.isVisible('text="Temporal Forces"');
    console.log('✓ Set name visible:', hasSetHeader);
    
    const hasBackButton = await page.isVisible('text="Back to Sets"');
    console.log('✓ Back button visible:', hasBackButton);
    
    const hasViewCards = await page.isVisible('text="View Cards"');
    console.log('✓ View Cards button visible:', hasViewCards);
    
    // Check for rarity showcase
    const hasRarityShowcase = await page.isVisible('text="Rarity Showcase"');
    console.log('✓ Rarity Showcase visible:', hasRarityShowcase);
    
    // Check for statistics
    const hasStats = await page.isVisible('text="Set Statistics"');
    console.log('✓ Set Statistics visible:', hasStats);
    
    // Check for search
    const hasSearch = await page.isVisible('text="Search & Filter"');
    console.log('✓ Search & Filter visible:', hasSearch);
    
    // Test 3: Check for cards
    const cardsHeader = await page.textContent('h2:has-text("Cards")');
    console.log('✓ Cards section:', cardsHeader);
    
    // Test 4: Check for errors in console
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Console errors found:');
      errors.forEach(err => console.log('  -', err));
    } else {
      console.log('\n✓ No console errors');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tcg-test-screenshot.png', fullPage: true });
    console.log('\n✓ Screenshot saved as tcg-test-screenshot.png');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();