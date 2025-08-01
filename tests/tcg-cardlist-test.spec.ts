import { test, expect } from '@playwright/test';

test.describe('TCG Set Detail - CardList Component Test', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for these tests
    test.setTimeout(60000);
  });

  test('CardList handles sv8 set (>50 cards)', async ({ page }) => {
    await page.goto('http://localhost:3002/tcgsets/sv8');
    
    // Wait for the cards to load
    await page.waitForSelector('.grid.grid-cols-2', { timeout: 30000 });
    
    // Check debug info shows CardList
    const debugInfo = await page.locator('.font-mono').textContent();
    expect(debugInfo).toContain('Component: CardList');
    
    // Check that cards are rendered
    const cardElements = await page.locator('.card-container').count();
    console.log(`Found ${cardElements} cards rendered`);
    
    // Verify we have more than 50 cards
    expect(cardElements).toBeGreaterThan(50);
    
    // Check if 500-card limit message appears (if applicable)
    const limitMessage = await page.locator('text=Showing first 500 of').count();
    if (limitMessage > 0) {
      console.log('500-card limit message is displayed');
    }
  });

  test('CardList handles small set (<50 cards)', async ({ page }) => {
    // Try with a smaller set
    await page.goto('http://localhost:3002/tcgsets/sv10');
    
    // Wait for the cards to load
    await page.waitForSelector('.grid.grid-cols-2', { timeout: 30000 });
    
    // Check debug info shows CardList
    const debugInfo = await page.locator('.font-mono').textContent();
    expect(debugInfo).toContain('Component: CardList');
    
    // Verify cards are rendered
    const cardElements = await page.locator('.card-container').count();
    console.log(`Found ${cardElements} cards in small set`);
    expect(cardElements).toBeGreaterThan(0);
  });

  test('Manual Load All Cards button works', async ({ page }) => {
    await page.goto('http://localhost:3002/tcgsets/sv8');
    
    // Look for Load All Cards button
    const loadAllButton = page.locator('button:has-text("Load All Cards")');
    const buttonExists = await loadAllButton.count();
    
    if (buttonExists > 0) {
      console.log('Found Load All Cards button, clicking it');
      await loadAllButton.click();
      
      // Wait for loading to complete
      await page.waitForTimeout(2000);
      
      // Check that more cards are loaded
      const cardElements = await page.locator('.card-container').count();
      console.log(`Cards after Load All: ${cardElements}`);
      expect(cardElements).toBeGreaterThan(50);
    } else {
      console.log('No Load All Cards button needed - cards loaded automatically');
    }
  });
});