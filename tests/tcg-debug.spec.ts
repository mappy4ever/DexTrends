import { test, expect } from '@playwright/test';

test('Debug TCG Sets page', async ({ page }) => {
  // Go to the page
  await page.goto('http://localhost:3001/tcgsets');
  
  // Wait a bit for initial load
  await page.waitForTimeout(2000);
  
  // Take a screenshot
  await page.screenshot({ path: 'tcg-debug-screenshot.png', fullPage: true });
  
  // Check for loading state
  const loading = await page.locator('text="Loading TCG sets"').isVisible();
  console.log('Loading visible:', loading);
  
  // Check for error messages
  const error = await page.locator('text=/Error|Failed/i').isVisible();
  console.log('Error visible:', error);
  
  // Check for any set cards
  const setCards = await page.locator('[data-set-card]').count();
  console.log('Set cards found:', setCards);
  
  // Check for grid container
  const grid = await page.locator('.grid').count();
  console.log('Grid containers found:', grid);
  
  // Get any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  
  // Wait for network idle
  await page.waitForLoadState('networkidle');
  
  // Check final state
  const finalSetCards = await page.locator('.grid > div').count();
  console.log('Final set cards in grid:', finalSetCards);
  
  // Get page content for debugging
  const content = await page.content();
  if (content.includes('Error') || content.includes('Failed')) {
    console.log('Page contains error text');
  }
  
  // Check API calls
  const apiResponse = await page.evaluate(() => {
    return fetch('/api/tcg-sets?page=1&pageSize=25')
      .then(res => res.json())
      .catch(err => ({ error: err.message }));
  });
  console.log('API response:', JSON.stringify(apiResponse, null, 2));
});