import { test, expect } from '@playwright/test';

test.describe('TCG Sets Quick Check', () => {
  test('Check TCG sets page current status', async ({ page }) => {
    console.log('Navigating to TCG sets page...');
    
    // Navigate to TCG sets page
    await page.goto('http://localhost:3002/tcgsets');
    
    // Take a screenshot of initial state
    await page.screenshot({ path: 'tcg-sets-initial.png' });
    
    // Check what's actually on the page
    const pageContent = await page.content();
    
    // Look for common elements
    const hasError = await page.locator('text=/error|failed/i').count() > 0;
    const hasNoSetsFound = await page.locator('text="No Sets Found"').count() > 0;
    const hasLoadingText = await page.locator('text=/loading/i').count() > 0;
    const hasGrid = await page.locator('.grid').count() > 0;
    const hasSetCards = await page.locator('.group.animate-fadeIn').count() > 0;
    
    console.log('Page status:');
    console.log('- Has error:', hasError);
    console.log('- Has "No Sets Found":', hasNoSetsFound);
    console.log('- Has loading text:', hasLoadingText);
    console.log('- Has grid:', hasGrid);
    console.log('- Has set cards:', hasSetCards);
    
    // Wait a bit for any async operations
    await page.waitForTimeout(5000);
    
    // Take another screenshot
    await page.screenshot({ path: 'tcg-sets-after-wait.png' });
    
    // Count visible sets
    const visibleSets = await page.locator('.group.animate-fadeIn').count();
    console.log('Visible sets count:', visibleSets);
    
    // Check console for errors
    const consoleLogs: { type: string; text: string }[] = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Reload to capture console logs
    await page.reload();
    await page.waitForTimeout(5000);
    
    console.log('\nConsole logs:');
    consoleLogs.forEach(log => {
      if (log.type === 'error' || log.text.includes('error') || log.text.includes('Error')) {
        console.log(`[${log.type}] ${log.text}`);
      }
    });
    
    // Try clicking on a set if available
    if (visibleSets > 0) {
      console.log('\nTrying to click on first set...');
      const firstSet = page.locator('.group.animate-fadeIn').first();
      await firstSet.click();
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log('Current URL after click:', currentUrl);
      
      // Check if we're on a set detail page
      if (currentUrl.includes('/tcgsets/')) {
        console.log('Successfully navigated to set detail page');
        await page.screenshot({ path: 'tcg-set-detail.png' });
        
        const hasSetTitle = await page.locator('h1').count() > 0;
        const hasCards = await page.locator('img[src*="pokemontcg"]').count() > 0;
        
        console.log('- Has set title:', hasSetTitle);
        console.log('- Has card images:', hasCards);
      }
    }
    
    // Final check
    if (hasNoSetsFound) {
      console.log('\n⚠️  "No Sets Found" is displayed - there might be an API issue');
    } else if (visibleSets > 0) {
      console.log(`\n✅ ${visibleSets} sets are visible on the page`);
    } else {
      console.log('\n❌ No sets are visible and no error message');
    }
  });
});