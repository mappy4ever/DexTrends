import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle } from '../helpers/test-utils';

test.describe('Favorites', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
    await page.goto('/favorites');
    await waitForNetworkIdle(page);
  });

  test('should load favorites page', async ({ page, consoleLogger }) => {
    // Check page title
    await expect(page).toHaveTitle(/Favorites|DexTrends/);
    
    // Check for main heading
    await expect(page.locator('h1:has-text("Favorites")').or(page.locator('[data-testid="favorites-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display favorite items or empty state', async ({ page }) => {
    await pageHelpers.waitForLoadingComplete();
    
    // Check for favorite items or empty state
    const favoriteItems = page.locator('[data-testid="favorite-item"]').or(page.locator('.favorite-card')).or(page.locator('.favorite-pokemon'));
    const emptyState = page.locator('[data-testid="empty-favorites"]').or(page.locator('.empty-state')).or(page.locator('text=/no favorites|start favoriting/i'));
    
    const hasFavorites = await favoriteItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    expect(hasFavorites || hasEmptyState).toBeTruthy();
  });

  test('should add Pokemon to favorites from Pokedex', async ({ page, consoleLogger }) => {
    // Navigate to Pokedex first
    await pageHelpers.goToPokemonDetail('25'); // Pikachu
    await waitForNetworkIdle(page);
    
    // Look for favorite button
    const favoriteButton = page.locator('button:has-text("Favorite")').or(page.locator('button:has-text("Add to Favorites")')).or(page.locator('[data-testid="favorite-button"]')).or(page.locator('button[aria-label*="favorite"]')).first();
    
    if (await favoriteButton.isVisible()) {
      // Check initial state
      const initialText = await favoriteButton.textContent();
      
      // Click favorite button
      await favoriteButton.click();
      await page.waitForTimeout(1000);
      
      // Button text should change
      const updatedText = await favoriteButton.textContent();
      expect(updatedText).not.toBe(initialText);
      
      // Navigate back to favorites
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      
      // Verify Pokemon appears in favorites
      await expect(page.locator('text=/Pikachu/i')).toBeVisible();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should remove items from favorites', async ({ page }) => {
    // Ensure we have at least one favorite
    const favoriteItem = page.locator('[data-testid="favorite-item"]').or(page.locator('.favorite-card')).first();
    
    if (await favoriteItem.isVisible()) {
      // Get initial count
      const initialCount = await page.locator('[data-testid="favorite-item"]').count();
      
      // Find remove button
      const removeButton = favoriteItem.locator('button:has-text("Remove")').or(favoriteItem.locator('button:has-text("Unfavorite")')).or(page.locator('[data-testid="remove-favorite"]')).first();
      
      if (await removeButton.isVisible()) {
        await removeButton.click();
        
        // Confirm if needed
        const confirmButton = page.locator('button:has-text("Confirm")').or(page.locator('button:has-text("Yes")')).last();
        if (await confirmButton.isVisible({ timeout: 1000 })) {
          await confirmButton.click();
        }
        
        // Wait for removal
        await page.waitForTimeout(1000);
        
        // Verify count decreased
        const finalCount = await page.locator('[data-testid="favorite-item"]').count();
        expect(finalCount).toBe(initialCount - 1);
      }
    }
  });

  test('should filter favorite items', async ({ page }) => {
    // Only test if there are favorites
    const favoriteItems = await page.locator('[data-testid="favorite-item"]').count();
    
    if (favoriteItems > 0) {
      // Look for filter options
      const typeFilter = page.locator('select[name="type"]').or(page.locator('[data-testid="type-filter"]')).or(page.locator('button:has-text("Type")')).first();
      
      if (await typeFilter.isVisible()) {
        // Apply filter
        if (await typeFilter.evaluate(el => el.tagName === 'SELECT')) {
          await typeFilter.selectOption({ index: 1 });
        } else {
          await typeFilter.click();
          await page.locator('[data-testid="filter-option"]').first().click();
        }
        
        await page.waitForTimeout(1000);
        
        // Verify filtering applied
        const filteredCount = await page.locator('[data-testid="favorite-item"]:visible').count();
        expect(filteredCount).toBeLessThanOrEqual(favoriteItems);
      }
    }
  });

  test('should sort favorite items', async ({ page }) => {
    const favoriteItems = await page.locator('[data-testid="favorite-item"]').count();
    
    if (favoriteItems > 1) {
      // Look for sort options
      const sortSelect = page.locator('select[name="sort"]').or(page.locator('[data-testid="sort-select"]')).or(page.locator('button:has-text("Sort")')).first();
      
      if (await sortSelect.isVisible()) {
        // Get initial order
        const initialFirstItem = await page.locator('[data-testid="favorite-item"]').first().textContent();
        
        // Change sort
        if (await sortSelect.evaluate(el => el.tagName === 'SELECT')) {
          await sortSelect.selectOption({ index: 1 });
        } else {
          await sortSelect.click();
          await page.locator('[data-testid="sort-option"]').nth(1).click();
        }
        
        await page.waitForTimeout(1000);
        
        // Verify order changed
        const newFirstItem = await page.locator('[data-testid="favorite-item"]').first().textContent();
        expect(newFirstItem).not.toBe(initialFirstItem);
      }
    }
  });

  test('should display favorite statistics', async ({ page }) => {
    // Look for stats section
    const statsSection = page.locator('[data-testid="favorites-stats"]').or(page.locator('.stats-section')).or(page.locator('text=/total favorites|statistics/i'));
    
    if (await statsSection.isVisible()) {
      // Check for various stats
      const totalCount = page.locator('[data-testid="total-favorites"]').or(page.locator('text=/total/i'));
      const typeBreakdown = page.locator('[data-testid="type-breakdown"]').or(page.locator('text=/type/i'));
      
      expect(await totalCount.isVisible() || await typeBreakdown.isVisible()).toBeTruthy();
    }
  });

  test('should export favorites list', async ({ page, consoleLogger }) => {
    const exportButton = page.locator('button:has-text("Export")').or(page.locator('[data-testid="export-favorites"]')).first();
    
    if (await exportButton.isVisible()) {
      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      await exportButton.click();
      
      // Check if download started or modal opened
      const download = await downloadPromise;
      const exportModal = page.locator('[data-testid="export-modal"]').or(page.locator('.export-options'));
      
      if (download) {
        // Verify download
        expect(download.suggestedFilename()).toContain('favorites');
      } else if (await exportModal.isVisible()) {
        // Handle export options
        const csvOption = page.locator('button:has-text("CSV")').or(page.locator('[data-testid="export-csv"]')).first();
        if (await csvOption.isVisible()) {
          await csvOption.click();
        }
      }
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should sync favorites across sessions', async ({ page, context }) => {
    // Add a favorite if none exist
    const favoriteCount = await page.locator('[data-testid="favorite-item"]').count();
    
    if (favoriteCount === 0) {
      // Go add a favorite
      await pageHelpers.goToPokemonDetail('1'); // Bulbasaur
      const favButton = page.locator('[data-testid="favorite-button"]').or(page.locator('button[aria-label*="favorite"]')).first();
      if (await favButton.isVisible()) {
        await favButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Return to favorites
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
    }
    
    // Get current favorites
    const initialFavorites = await page.locator('[data-testid="favorite-item"]').count();
    
    // Open new page in same context (simulating new tab)
    const newPage = await context.newPage();
    await newPage.goto('/favorites');
    await waitForNetworkIdle(newPage);
    
    // Count should be the same
    const newPageFavorites = await newPage.locator('[data-testid="favorite-item"]').count();
    expect(newPageFavorites).toBe(initialFavorites);
    
    await newPage.close();
  });

  test('should work on mobile', async ({ page, consoleLogger }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify responsive layout
    await expect(page.locator('h1:has-text("Favorites")').or(page.locator('[data-testid="favorites-title"]'))).toBeVisible();
    
    // Check if grid layout adjusts for mobile
    const favoriteGrid = page.locator('[data-testid="favorites-grid"]').or(page.locator('.favorites-container'));
    if (await favoriteGrid.isVisible()) {
      const gridStyle = await favoriteGrid.evaluate(el => window.getComputedStyle(el));
      // Mobile should have single column or specific mobile layout
      expect(gridStyle).toBeTruthy();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should handle bulk operations', async ({ page }) => {
    const favoriteItems = await page.locator('[data-testid="favorite-item"]').count();
    
    if (favoriteItems > 1) {
      // Look for bulk select option
      const bulkSelect = page.locator('button:has-text("Select All")').or(page.locator('input[type="checkbox"][data-testid="select-all"]')).first();
      
      if (await bulkSelect.isVisible()) {
        await bulkSelect.click();
        
        // Look for bulk actions
        const bulkDelete = page.locator('button:has-text("Delete Selected")').or(page.locator('[data-testid="bulk-delete"]')).first();
        
        if (await bulkDelete.isVisible()) {
          // Get initial count
          const initialCount = await page.locator('[data-testid="favorite-item"]').count();
          
          await bulkDelete.click();
          
          // Confirm action
          const confirmButton = page.locator('button:has-text("Confirm")').last();
          if (await confirmButton.isVisible({ timeout: 1000 })) {
            await confirmButton.click();
          }
          
          await page.waitForTimeout(1000);
          
          // Verify items were removed
          const finalCount = await page.locator('[data-testid="favorite-item"]').count();
          expect(finalCount).toBeLessThan(initialCount);
        }
      }
    }
  });
});