import { test, expect } from '@playwright/test';

test('TCG Sets simple test', async ({ page }) => {
  // Listen for console messages
  page.on('console', msg => {
    console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`Page error: ${error.message}`);
  });
  
  // Go to the page
  await page.goto('http://localhost:3001/tcgexpansions');
  
  // Wait longer for the page to load
  await page.waitForTimeout(5000);
  
  // Check state
  const loading = await page.locator('text="Loading TCG sets"').isVisible();
  const error = await page.locator('text=/Error|Failed/i').isVisible();
  const gridItems = await page.locator('.grid > div').count();
  
  console.log('Page state after 5 seconds:');
  console.log('- Loading visible:', loading);
  console.log('- Error visible:', error);
  console.log('- Grid items:', gridItems);
  
  // Take a screenshot
  await page.screenshot({ path: 'tcg-simple-test.png', fullPage: true });
  
  // Check if sets state is populated via React DevTools or component state
  const setsCount = await page.evaluate(() => {
    // Try to access React internal state (this may not work depending on React version)
    const reactRoot = document.querySelector('#__next');
    if (reactRoot && (reactRoot as any)._reactRootContainer) {
      console.log('Found React root');
    }
    return document.querySelectorAll('.grid > div').length;
  });
  
  console.log('Sets in DOM:', setsCount);
  
  expect(gridItems).toBeGreaterThan(0);
});