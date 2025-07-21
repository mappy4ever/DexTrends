import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle } from '../helpers/test-utils';

test.describe('Homepage', () => {
  test('should load the homepage and display navigation', async ({ page, consoleLogger }) => {
    const pageHelpers = new DexTrendsPageHelpers(page);
    
    await page.goto('/');
    await waitForNetworkIdle(page);
    
    // Check main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: /pokedex/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /tcg sets/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pocket mode/i })).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display popular cards section', async ({ page, consoleLogger }) => {
    await page.goto('/');
    
    // Wait for popular cards to load
    const popularCardsSection = page.locator('[data-testid="popular-cards"]').or(page.locator('section:has-text("Popular Cards")'));
    await expect(popularCardsSection).toBeVisible({ timeout: 10000 });
    
    // Check for any console warnings about missing data
    const warnings = consoleLogger.getWarnings();
    if (warnings.length > 0) {
      console.log(`Found ${warnings.length} warnings while loading popular cards`);
    }
  });

  test('should have working global search', async ({ page, consoleLogger }) => {
    await page.goto('/');
    
    // Look for search button or input
    const searchTrigger = page.locator('[aria-label*="search" i]').or(page.locator('button:has-text("Search")')).or(page.locator('input[placeholder*="search" i]')).first();
    await expect(searchTrigger).toBeVisible();
    
    // Click to open search if it's a button
    if (await searchTrigger.evaluate(el => el.tagName === 'BUTTON')) {
      await searchTrigger.click();
    }
    
    // Type in search
    const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="search" i]')).first();
    await searchInput.fill('Pikachu');
    await searchInput.press('Enter');
    
    // Should show search results or navigate to results page
    await expect(page.locator('text=/pikachu/i')).toBeVisible({ timeout: 10000 });
    
    // Verify search didn't cause any errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
    
    // Check if any API calls were logged
    const apiLogs = consoleLogger.findMessages('api');
    console.log(`Found ${apiLogs.length} API-related console messages`);
  });
});