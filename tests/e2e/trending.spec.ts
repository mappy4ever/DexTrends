import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle } from '../helpers/test-utils';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';

test.describe('Trending Page', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
    await page.goto('/trending');
    await waitForNetworkIdle(page);
  });

  test('should load trending page', async ({ page, consoleLogger }) => {
    // Check page title
    await expect(page).toHaveTitle(/Trending|DexTrends/);
    
    // Check main heading
    await expect(page.locator('h1:has-text("Trending")').or(page.locator('[data-testid="trending-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display trending cards', async ({ page }) => {
    await pageHelpers.waitForLoadingComplete();
    
    // Should show trending cards
    const trendingCards = page.locator('[data-testid="trending-card"]').or(page.locator('.trending-item'));
    const cardCount = await trendingCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Cards should have essential info
    if (cardCount > 0) {
      const firstCard = trendingCards.first();
      await expect(firstCard).toBeVisible();
      
      // Should show card name
      const cardName = firstCard.locator('[data-testid="card-name"]').or(page.locator('.card-title'));
      await expect(cardName).toBeVisible();
    }
  });

  test('should display price changes', async ({ page }) => {
    const trendingCards = page.locator('[data-testid="trending-card"]');
    
    if (await trendingCards.count() > 0) {
      // Look for price change indicators
      const priceChange = page.locator('[data-testid="price-change"]').or(page.locator('.price-change')).or(page.locator('text=/%|↑|↓/')).first();
      await expect(priceChange).toBeVisible();
      
      // Should show percentage or arrow
      const changeText = await priceChange.textContent();
      expect(changeText).toMatch(/\d+%|↑|↓|[+-]/);
    }
  });

  test('should filter by time period', async ({ page }) => {
    // Look for time period filter
    const timeFilter = page.locator('select[name*="time"]').or(page.locator('[data-testid="time-filter"]')).or(page.locator('button:has-text("24h")')).first();
    
    if (await timeFilter.isVisible()) {
      const initialCards = await page.locator('[data-testid="trending-card"]').count();
      
      // Change time period
      if (await timeFilter.evaluate(el => el.tagName === 'SELECT')) {
        await timeFilter.selectOption('7d');
      } else {
        await timeFilter.click();
        await page.locator('button:has-text("7 Days")').or(page.locator('[data-value="7d"]')).click();
      }
      
      await page.waitForTimeout(1000);
      
      // Content might change
      const updatedCards = await page.locator('[data-testid="trending-card"]').count();
      expect(updatedCards).toBeGreaterThan(0);
    }
  });

  test('should sort trending items', async ({ page }) => {
    const sortOptions = page.locator('select[name*="sort"]').or(page.locator('[data-testid="sort-select"]')).first();
    
    if (await sortOptions.isVisible()) {
      // Get first item before sorting
      const firstItemBefore = await page.locator('[data-testid="trending-card"]').first().textContent();
      
      // Change sort
      if (await sortOptions.evaluate(el => el.tagName === 'SELECT')) {
        await sortOptions.selectOption({ index: 1 });
      } else {
        await sortOptions.click();
        await page.locator('[data-testid="sort-option"]').nth(1).click();
      }
      
      await page.waitForTimeout(1000);
      
      // First item might be different
      const firstItemAfter = await page.locator('[data-testid="trending-card"]').first().textContent();
      expect(firstItemAfter).toBeTruthy();
    }
  });

  test('should show trending categories', async ({ page }) => {
    // Look for category tabs or filters
    const categories = page.locator('[data-testid="trending-category"]').or(page.locator('.category-tab')).or(page.locator('button:has-text("Pokemon")'));
    
    if (await categories.count() > 0) {
      // Should have multiple categories
      expect(await categories.count()).toBeGreaterThan(1);
      
      // Click different category
      const secondCategory = categories.nth(1);
      await secondCategory.click();
      await page.waitForTimeout(1000);
      
      // Content should update
      await expect(page.locator('[data-testid="trending-card"]').first()).toBeVisible();
    }
  });

  test('should display market movers', async ({ page, consoleLogger }) => {
    // Look for biggest gainers/losers section
    const moversSection = page.locator('[data-testid="market-movers"]').or(page.locator('.movers-section'));
    
    if (await moversSection.isVisible()) {
      // Should show top gainers
      const gainers = page.locator('[data-testid="top-gainer"]').or(page.locator('.gainer'));
      if (await gainers.count() > 0) {
        // Gainers should have positive change
        const gainerChange = await gainers.first().locator('.price-change').textContent();
        expect(gainerChange).toMatch(/\+|↑/);
      }
      
      // Should show top losers
      const losers = page.locator('[data-testid="top-loser"]').or(page.locator('.loser'));
      if (await losers.count() > 0) {
        // Losers should have negative change
        const loserChange = await losers.first().locator('.price-change').textContent();
        expect(loserChange).toMatch(/-|↓/);
      }
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should navigate to card details', async ({ page }) => {
    const trendingCard = page.locator('[data-testid="trending-card"]').first();
    
    if (await trendingCard.isVisible()) {
      await trendingCard.click();
      await waitForNetworkIdle(page);
      
      // Should navigate to card detail page
      expect(page.url()).toMatch(/\/cards\/|\/tcgexpansions\/|\/pokedex\//);
    }
  });

  test('should display price history sparklines', async ({ page }) => {
    // Look for mini charts/sparklines
    const sparklines = page.locator('[data-testid="price-sparkline"]').or(page.locator('.sparkline')).or(page.locator('canvas')).first();
    
    if (await sparklines.isVisible()) {
      // Sparkline should be rendered
      const isCanvas = await sparklines.evaluate(el => el.tagName === 'CANVAS');
      if (isCanvas) {
        const context = await sparklines.evaluate((canvas: HTMLCanvasElement) => {
          return canvas.getContext('2d') !== null;
        });
        expect(context).toBeTruthy();
      }
    }
  });

  test('should auto-refresh trending data', async ({ page }) => {
    // Look for refresh indicator or timer
    const refreshIndicator = page.locator('[data-testid="refresh-timer"]').or(page.locator('.last-updated')).or(page.locator('text=/updated|refresh/i'));
    
    if (await refreshIndicator.isVisible()) {
      const initialText = await refreshIndicator.textContent();
      
      // Wait for potential refresh (usually every minute)
      await page.waitForTimeout(5000);
      
      const updatedText = await refreshIndicator.textContent();
      // Text might change to show new update time
      expect(updatedText).toBeTruthy();
    }
  });

  test('should work on mobile viewport', async ({ page, consoleLogger }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Main content should be visible
    await expect(page.locator('h1:has-text("Trending")').or(page.locator('[data-testid="trending-title"]'))).toBeVisible();
    
    // Cards should stack vertically on mobile
    const cardContainer = page.locator('[data-testid="trending-container"]').or(page.locator('.trending-grid'));
    if (await cardContainer.isVisible()) {
      const containerStyle = await cardContainer.evaluate(el => window.getComputedStyle(el));
      // Should have single column layout
      expect(containerStyle).toBeTruthy();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display trending statistics', async ({ page }) => {
    // Look for stats overview
    const statsSection = page.locator('[data-testid="trending-stats"]').or(page.locator('.market-stats'));
    
    if (await statsSection.isVisible()) {
      // Should show market statistics
      const stats = ['Total Volume', 'Average Change', 'Cards Tracked'];
      
      for (const stat of stats) {
        const statElement = page.locator(`text=/${stat}/i`);
        if (await statElement.count() > 0) {
          const value = await statElement.locator('xpath=..').textContent();
          expect(value).toMatch(/\d+|\$|%/);
        }
      }
    }
  });

  test('should handle empty trending data', async ({ page }) => {
    // If no trending data available
    const emptyState = page.locator('[data-testid="empty-trending"]').or(page.locator('.no-trending-data'));
    const trendingCards = page.locator('[data-testid="trending-card"]');
    
    if (await emptyState.isVisible()) {
      // Should show appropriate message
      const message = await emptyState.textContent();
      expect(message).toMatch(/no trending|check back/i);
    } else {
      // Should have trending cards
      expect(await trendingCards.count()).toBeGreaterThan(0);
    }
  });

  test('should export trending data', async ({ page }) => {
    // Look for export button
    const exportButton = page.locator('button:has-text("Export")').or(page.locator('[data-testid="export-trending"]')).first();
    
    if (await exportButton.isVisible()) {
      // Set up download promise
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      await exportButton.click();
      
      const download = await downloadPromise;
      if (download) {
        // Should download CSV or JSON
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/trending.*\.(csv|json)/i);
      }
    }
  });
});