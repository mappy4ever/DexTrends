import { test, expect } from '@playwright/test';

test.describe('TCG Set Performance - sv08 Loading', () => {
  test('sv08 set page loads efficiently with progressive loading', async ({ page }) => {
    // Start monitoring performance
    const startTime = Date.now();
    
    // Navigate to sv08 set page
    await page.goto('http://localhost:3001/tcgexpansions/sv08');
    
    // Check that set info loads quickly (within 3 seconds)
    await expect(page.locator('h1:has-text("Surging Sparks")')).toBeVisible({ timeout: 3000 });
    
    // Check that initial cards are displayed
    await expect(page.locator('[data-testid="card-grid"], .grid')).toBeVisible({ timeout: 5000 });
    
    // Check for loading indicator for remaining cards
    const loadingIndicator = page.locator('text="loading..."');
    const hasLoadingIndicator = await loadingIndicator.isVisible();
    
    // If set has more than 50 cards, loading indicator should appear
    if (hasLoadingIndicator) {
      console.log('Progressive loading is working - loading indicator found');
    }
    
    // Check that virtualized grid is used for large sets
    const virtualizedGrid = await page.locator('[class*="react-window"]').count();
    if (virtualizedGrid > 0) {
      console.log('Virtualized grid is being used for performance');
    }
    
    // Measure total page load time
    const loadTime = Date.now() - startTime;
    console.log(`Page became interactive in ${loadTime}ms`);
    
    // Page should be interactive within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check that statistics section appears after cards load
    await expect(page.locator('h2:has-text("Set Statistics")')).toBeVisible({ timeout: 10000 });
    
    // Verify cards are displayed
    const cardCount = await page.locator('img[alt*="card"]').count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check console for performance warnings
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warn' && msg.text().includes('Slow')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Wait a bit to collect any console warnings
    await page.waitForTimeout(2000);
    
    // Log any performance warnings
    if (consoleMessages.length > 0) {
      console.log('Performance warnings:', consoleMessages);
    }
  });

  test('filters work correctly while cards are loading', async ({ page }) => {
    await page.goto('http://localhost:3001/tcgexpansions/sv08');
    
    // Wait for filters to be available
    await expect(page.locator('h2:has-text("Filter Cards")')).toBeVisible({ timeout: 5000 });
    
    // Try filtering by rarity
    const raritySelect = page.locator('select').filter({ hasText: 'All Rarities' });
    await raritySelect.selectOption({ index: 1 });
    
    // Verify filter is applied
    await page.waitForTimeout(500);
    const filteredCardsHeader = page.locator('h2:has-text("Cards")');
    const headerText = await filteredCardsHeader.textContent();
    
    // Should show filtered count
    expect(headerText).toContain('of');
  });
});