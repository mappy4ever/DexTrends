import { test, expect } from '@playwright/test';

test.describe('Pokemon Detail Page', () => {
  test('should load Butterfree page and check for console errors', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(30000);
    
    const consoleMessages: { type: string; text: string }[] = [];
    
    // Capture all console messages
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    // Navigate to the page
    console.log('Navigating to Pokemon detail page...');
    const response = await page.goto('http://localhost:3000/pokedex/12', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    // Check response status
    console.log('Response status:', response?.status());
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Try to find Pokemon name
    let pokemonName = null;
    try {
      // Try different selectors
      pokemonName = await page.locator('h1').first().textContent({ timeout: 5000 });
      if (!pokemonName) {
        pokemonName = await page.locator('[data-testid="pokemon-name"]').textContent({ timeout: 2000 });
      }
    } catch (e) {
      console.log('Could not find Pokemon name with standard selectors');
    }
    
    console.log('Pokemon name found:', pokemonName);
    
    // Take screenshot
    await page.screenshot({ path: 'butterfree-page.png' });
    console.log('Screenshot saved as butterfree-page.png');
    
    // Report console messages
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    
    console.log('\n=== Console Messages Summary ===');
    console.log(`Total messages: ${consoleMessages.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Console Errors:');
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.text}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Console Warnings:');
      warnings.slice(0, 5).forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.text}`);
      });
      if (warnings.length > 5) {
        console.log(`... and ${warnings.length - 5} more warnings`);
      }
    }
    
    // Basic assertions
    expect(response?.status()).toBe(200);
    expect(title).toBeTruthy();
  });
});