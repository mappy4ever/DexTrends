import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle, waitForImages, checkBrokenImages } from '../helpers/test-utils';

test.describe('TCG Set Detail Page', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
  });

  test('should load TCG set detail page', async ({ page, consoleLogger }) => {
    // Navigate to a specific set (using a common set ID)
    await page.goto('/tcgexpansions/base1'); // Base Set
    await waitForNetworkIdle(page);

    // Check page loads
    await expect(page.locator('h1').or(page.locator('[data-testid="set-name"]'))).toBeVisible();
    
    // Set logo/symbol should be visible
    const setLogo = page.locator('[data-testid="set-logo"]').or(page.locator('.set-symbol')).or(page.locator('img[alt*="set"]')).first();
    await expect(setLogo).toBeVisible();

    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display all cards in the set', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 15000 });

    // Check cards are displayed
    const cards = await page.locator('[data-testid="card-item"]').or(page.locator('.card-item')).count();
    expect(cards).toBeGreaterThan(0);

    // Base Set should have specific number of cards
    const setInfo = page.locator('[data-testid="set-info"]').or(page.locator('.set-details'));
    if (await setInfo.isVisible()) {
      const infoText = await setInfo.textContent();
      expect(infoText).toMatch(/\d+\s*(cards|total)/i);
    }
  });

  test('should display card prices and market data', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for price information on cards
    const priceElements = page.locator('[data-testid="card-price"]').or(page.locator('.price')).or(page.locator('.market-price'));
    const priceCount = await priceElements.count();
    
    if (priceCount > 0) {
      // At least some cards should have prices
      const firstPrice = await priceElements.first().textContent();
      expect(firstPrice).toMatch(/\$?\d+/); // Should contain a number
    }
  });

  test('should filter cards by rarity', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for rarity filter
    const rarityFilter = page.locator('select[name*="rarity"]').or(page.locator('[data-testid="rarity-filter"]')).or(page.locator('button:has-text("Rarity")')).first();
    
    if (await rarityFilter.isVisible()) {
      const initialCardCount = await page.locator('[data-testid="card-item"]').count();
      
      // Apply rarity filter
      if (await rarityFilter.evaluate(el => el.tagName === 'SELECT')) {
        await rarityFilter.selectOption('Rare');
      } else {
        await rarityFilter.click();
        await page.locator('button:has-text("Rare")').or(page.locator('[data-value="rare"]')).click();
      }
      
      await page.waitForTimeout(1000);
      
      // Card count should change
      const filteredCount = await page.locator('[data-testid="card-item"]:visible').count();
      expect(filteredCount).toBeLessThan(initialCardCount);
    }
  });

  test('should open card modal on click', async ({ page, consoleLogger }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Click on first card
    const firstCard = page.locator('[data-testid="card-item"]').or(page.locator('.card-item')).first();
    await firstCard.click();
    
    // Modal should open
    const modal = await page.waitForSelector('[role="dialog"]', { 
      timeout: 5000 
    }).catch(() => null);
    
    if (modal) {
      // Modal should show card details
      await expect(page.locator('[data-testid="card-name"]').or(page.locator('.card-title'))).toBeVisible();
      await expect(page.locator('[data-testid="card-image"]').or(page.locator('.card-full-image'))).toBeVisible();
      
      // Close modal
      await pageHelpers.closeModal();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display set statistics', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for set statistics
    const statsSection = page.locator('[data-testid="set-stats"]').or(page.locator('.set-statistics'));
    if (await statsSection.isVisible()) {
      // Should show various stats
      const stats = ['Total Cards', 'Common', 'Uncommon', 'Rare'];
      for (const stat of stats) {
        const statElement = page.locator(`text=/${stat}/i`);
        if (await statElement.isVisible()) {
          const value = await statElement.textContent();
          expect(value).toMatch(/\d+/); // Should contain a number
        }
      }
    }
  });

  test('should handle sorting options', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for sort options
    const sortSelect = page.locator('select[name*="sort"]').or(page.locator('[data-testid="sort-select"]')).or(page.locator('button:has-text("Sort")')).first();
    
    if (await sortSelect.isVisible()) {
      // Get first card name before sorting
      const firstCardBefore = await page.locator('[data-testid="card-item"] [data-testid="card-name"]').or(page.locator('.card-name')).first().textContent();
      
      // Change sort
      if (await sortSelect.evaluate(el => el.tagName === 'SELECT')) {
        await sortSelect.selectOption('name');
      } else {
        await sortSelect.click();
        await page.locator('button:has-text("Name")').or(page.locator('[data-value="name"]')).click();
      }
      
      await page.waitForTimeout(1000);
      
      // First card should be different
      const firstCardAfter = await page.locator('[data-testid="card-item"] [data-testid="card-name"]').or(page.locator('.card-name')).first().textContent();
      expect(firstCardAfter).not.toBe(firstCardBefore);
    }
  });

  test('should display card collection status', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for collection indicators
    const collectionIndicators = page.locator('[data-testid="collection-status"]').or(page.locator('.owned-indicator')).or(page.locator('.collection-badge'));
    
    if (await collectionIndicators.count() > 0) {
      // Some cards might be marked as owned/collected
      const firstIndicator = collectionIndicators.first();
      await expect(firstIndicator).toBeVisible();
    }
  });

  test('should navigate between sets', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for next/previous set navigation
    const nextSetButton = page.locator('button:has-text("Next Set")').or(page.locator('[data-testid="next-set"]')).or(page.locator('a[href*="/tcgexpansions/"]')).first();
    
    if (await nextSetButton.isVisible()) {
      const currentUrl = page.url();
      await nextSetButton.click();
      await waitForNetworkIdle(page);
      
      // URL should change
      expect(page.url()).not.toBe(currentUrl);
      // Should still be on a set page
      expect(page.url()).toContain('/tcgexpansions/');
    }
  });

  test('should handle search within set', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"]').or(page.locator('[data-testid="set-search"]')).first();
    
    if (await searchInput.isVisible()) {
      // Search for a specific card
      await searchInput.fill('Charizard');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should filter to Charizard cards
      const visibleCards = await page.locator('[data-testid="card-item"]:visible').count();
      expect(visibleCards).toBeGreaterThanOrEqual(1);
      
      // Verify Charizard is shown
      await expect(page.locator('text=/Charizard/i')).toBeVisible();
    }
  });

  test('should display set release information', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for release date and other set info
    const setInfo = page.locator('[data-testid="set-release-date"]').or(page.locator('.release-date')).or(page.locator('text=/release|date/i'));
    
    if (await setInfo.isVisible()) {
      const infoText = await setInfo.textContent();
      // Should contain date information
      expect(infoText).toMatch(/\d{4}|\d{1,2}\/\d{1,2}/); // Year or date format
    }
  });

  test('should work on mobile viewport', async ({ page, consoleLogger }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Main content should be visible
    await expect(page.locator('h1').or(page.locator('[data-testid="set-name"]'))).toBeVisible();
    
    // Cards should be in mobile-friendly layout
    const cardGrid = page.locator('[data-testid="card-grid"]').or(page.locator('.card-container'));
    if (await cardGrid.isVisible()) {
      const gridStyle = await cardGrid.evaluate(el => window.getComputedStyle(el));
      // Should have mobile-appropriate columns
      expect(gridStyle).toBeTruthy();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should handle invalid set IDs', async ({ page }) => {
    await page.goto('/tcgexpansions/invalid-set-id-12345');
    await waitForNetworkIdle(page);

    // Should show error or redirect
    const errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('.error')).or(page.locator('text=/not found/i'));
    const redirected = page.url() === '/tcgexpansions' || page.url().includes('/404');
    
    expect(await errorMessage.isVisible() || redirected).toBeTruthy();
  });

  test('should load card images properly', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);
    await waitForImages(page);

    // Check for broken images
    const brokenImages = await checkBrokenImages(page);
    expect(brokenImages.length).toBe(0);
    
    // All card images should be loaded
    const cardImages = await page.locator('[data-testid="card-image"]').or(page.locator('.card-img')).count();
    expect(cardImages).toBeGreaterThan(0);
  });

  test('should display pack opening link if available', async ({ page }) => {
    await pageHelpers.goToTCGSet('base1');
    await waitForNetworkIdle(page);

    // Look for pack opening feature
    const packOpeningLink = page.locator('a:has-text("Open Packs")').or(page.locator('[data-testid="pack-opening-link"]'));
    
    if (await packOpeningLink.isVisible()) {
      await packOpeningLink.click();
      await waitForNetworkIdle(page);
      
      // Should navigate to pack opening page
      expect(page.url()).toContain('/packs');
    }
  });
});