import { test, expect } from '@playwright/test';

test.describe('TCG Set Detail Page Layout Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to TCG sets page first
    await page.goto('/tcg-sets');
    await page.waitForLoadState('networkidle');
  });

  test('should display cards in proper grid layout without animations', async ({ page }) => {
    // Click on a set to navigate to detail page
    const firstSet = page.locator('[data-testid="set-card"]').first();
    await firstSet.click();
    
    // Wait for set detail page to load
    await page.waitForURL(/\/tcgsets\/[^/]+$/);
    await page.waitForSelector('[data-testid="card-grid"], .grid');
    
    // Check that cards are displayed
    const cardGrid = page.locator('.grid').filter({ has: page.locator('img[alt*="card"]') }).first();
    await expect(cardGrid).toBeVisible();
    
    // Verify grid has appropriate columns based on viewport
    const gridClasses = await cardGrid.getAttribute('class');
    expect(gridClasses).toContain('grid-cols-3'); // Mobile
    expect(gridClasses).toContain('md:grid-cols-6'); // Desktop
    
    // Verify no fade-in animations
    expect(gridClasses).not.toContain('animate-fadeIn');
    expect(gridClasses).not.toContain('transition-all');
  });

  test('should not automatically load cards in background', async ({ page }) => {
    // Navigate to a specific set
    await page.goto('/tcgsets/sv5'); // Surging Sparks
    
    // Wait for initial cards to load
    await page.waitForSelector('.grid img[alt*="card"]');
    
    // Count initial cards
    const initialCardCount = await page.locator('.grid img[alt*="card"]').count();
    
    // Wait 5 seconds to ensure no automatic background loading
    await page.waitForTimeout(5000);
    
    // Count cards again - should be the same
    const afterWaitCardCount = await page.locator('.grid img[alt*="card"]').count();
    expect(afterWaitCardCount).toBe(initialCardCount);
    
    // Verify "Load More Cards" button exists if there are more cards
    const loadMoreButton = page.locator('button:has-text("Load More Cards")');
    const hasMoreCards = await loadMoreButton.isVisible();
    
    if (hasMoreCards) {
      // Verify clicking button loads more cards
      await loadMoreButton.click();
      
      // Wait for loading indicator
      await expect(page.locator('text="Loading more cards..."')).toBeVisible();
      
      // Wait for new cards to load
      await page.waitForFunction(
        (count) => document.querySelectorAll('.grid img[alt*="card"]').length > count,
        initialCardCount,
        { timeout: 30000 }
      );
      
      // Verify more cards were loaded
      const newCardCount = await page.locator('.grid img[alt*="card"]').count();
      expect(newCardCount).toBeGreaterThan(initialCardCount);
    }
  });

  test('should have proper scrolling without height restrictions', async ({ page }) => {
    // Navigate to a large set
    await page.goto('/tcgsets/sv5');
    await page.waitForSelector('.grid img[alt*="card"]');
    
    // Check if VirtualizedCardGrid is used (for large sets)
    const virtualizedGrid = page.locator('[class*="VirtualizedCardGrid"], [class*="virtualized"]');
    const isVirtualized = await virtualizedGrid.count() > 0;
    
    if (isVirtualized) {
      // Verify no fixed height restriction
      const gridContainer = virtualizedGrid.first();
      const style = await gridContainer.getAttribute('style');
      
      // Should not have a max-height of 800px
      expect(style).not.toContain('max-height: 800px');
      expect(style).not.toContain('height: 800px');
    } else {
      // For regular CardList, verify scrolling works
      const cardGrid = page.locator('.grid').filter({ has: page.locator('img[alt*="card"]') }).first();
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Verify we can scroll
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    }
  });

  test('should display proper loading indicator only when loading', async ({ page }) => {
    await page.goto('/tcgsets/sv5');
    await page.waitForSelector('.grid img[alt*="card"]');
    
    // Initially, no loading indicator should be visible
    await expect(page.locator('text="Loading more cards..."')).not.toBeVisible();
    
    // If Load More button exists, click it
    const loadMoreButton = page.locator('button:has-text("Load More Cards")');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      
      // Loading indicator should appear
      await expect(page.locator('text="Loading more cards..."')).toBeVisible();
      
      // Wait for loading to complete
      await page.waitForFunction(
        () => !document.querySelector('text="Loading more cards..."'),
        { timeout: 30000 }
      );
      
      // Loading indicator should disappear
      await expect(page.locator('text="Loading more cards..."')).not.toBeVisible();
    }
  });

  test('responsive grid layout at different viewports', async ({ page }) => {
    await page.goto('/tcgsets/sv5');
    await page.waitForSelector('.grid img[alt*="card"]');
    
    const cardGrid = page.locator('.grid').filter({ has: page.locator('img[alt*="card"]') }).first();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    let gridClasses = await cardGrid.getAttribute('class');
    expect(gridClasses).toContain('grid-cols-3');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    gridClasses = await cardGrid.getAttribute('class');
    expect(gridClasses).toContain('md:grid-cols-6');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    gridClasses = await cardGrid.getAttribute('class');
    expect(gridClasses).toContain('xl:grid-cols-10');
  });
});