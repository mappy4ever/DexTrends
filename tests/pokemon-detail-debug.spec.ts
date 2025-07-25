import { test, expect } from '@playwright/test';

test.describe('Pokemon Detail Page - Debug', () => {
  test('check for console errors on Pikachu page', async ({ page }) => {
    // Capture console errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.error('Page error:', error.message);
    });
    
    // Capture console logs
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    // Navigate to Pikachu's detail page
    await page.goto('/pokedex/pikachu');
    
    // Wait a bit for all scripts to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'pikachu-page.png' });
    
    // Check if page loaded at all
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for any errors
    if (errors.length > 0) {
      console.error('Errors found:', errors);
      throw new Error(`Found ${errors.length} errors: ${errors.join(', ')}`);
    }
    
    // Try to find the pokemon name element
    const nameElement = await page.locator('[data-testid="pokemon-name"]').count();
    console.log('Pokemon name element found:', nameElement);
    
    expect(errors).toHaveLength(0);
  });
});