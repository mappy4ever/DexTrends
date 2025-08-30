import { test, expect } from '@playwright/test';

test('Check Pokedex page error', async ({ page }) => {
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  // Go to Pokedex page
  await page.goto('http://localhost:3001/pokedex');
  
  // Wait a bit
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'pokedex-error-screenshot.png', fullPage: true });
  
  // Check for error messages
  const errorText = await page.locator('text=/Error|invalid|expected/i').first().textContent().catch(() => null);
  if (errorText) {
    console.log('Error found on page:', errorText);
  }
  
  // Check page title
  const title = await page.title();
  console.log('Page title:', title);
});