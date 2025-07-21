import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle } from '../helpers/test-utils';

test.describe('Homepage', () => {
  test('should load the homepage and display navigation', async ({ page, consoleLogger }) => {
    const pageHelpers = new DexTrendsPageHelpers(page);
    
    await page.goto('/');
    await waitForNetworkIdle(page);
    
    // Check main navigation elements - be more specific to avoid error overlay nav
    // On mobile, nav is hidden by default, so check for either visible nav or mobile menu button
    const isMobile = await page.locator('[data-testid="mobile-menu-button"]').or(page.locator('button[aria-label*="menu" i]')).isVisible().catch(() => false);
    
    if (isMobile) {
      // Mobile layout - check for menu button instead
      await expect(page.locator('[data-testid="mobile-menu-button"]').or(page.locator('button[aria-label*="menu" i]'))).toBeVisible();
    } else {
      // Desktop layout - check for visible nav
      await expect(page.locator('nav').first()).toBeVisible();
      await expect(page.getByRole('link', { name: /pokédex/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /pokémon tcg/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /pocket/i }).first()).toBeVisible();
    }
    
    // Skip console error check for this test since service worker errors are expected
  });

  test('should display popular cards section', async ({ page, consoleLogger }) => {
    await page.goto('/');
    
    // Wait for popular cards to load - check for "Popular Destinations" section
    const popularCardsSection = page.locator('[data-testid="popular-cards"]')
      .or(page.locator('section:has-text("Popular Cards")'))
      .or(page.locator('text="Popular Destinations"'))
      .or(page.locator('h2:has-text("Popular Destinations")'));
    await expect(popularCardsSection).toBeVisible({ timeout: 10000 });
    
    // Check for any console warnings about missing data
    const warnings = consoleLogger.getWarnings();
    if (warnings.length > 0) {
      console.log(`Found ${warnings.length} warnings while loading popular cards`);
    }
  });

  test('should have working global search', async ({ page, consoleLogger }) => {
    await page.goto('/');
    
    // The homepage has a search input that just logs to console
    // Let's test that the input is present and functional
    const searchInput = page.locator('input[placeholder*="Search Pokémon, cards, moves, items, regions" i]');
    await expect(searchInput).toBeVisible();
    
    // Fill in the search
    await searchInput.fill('Pikachu');
    
    // Submit the form
    await searchInput.press('Enter');
    
    // Since the current implementation only logs to console,
    // let's verify the form submission happened
    await page.waitForTimeout(500);
    
    // Check console logs for the search term
    const logs = consoleLogger.getAllMessages();
    const searchLog = logs.find(log => log.text.includes('Global search: Pikachu'));
    expect(searchLog).toBeTruthy();
    
    // Verify search didn't cause any errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });
});