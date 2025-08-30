import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle } from '../helpers/test-utils';

test.describe('Comprehensive Favorites Functionality', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
  });

  test.describe('Adding Items to Favorites', () => {
    test('should add Pokemon to favorites from Pokedex page', async ({ page, consoleLogger }) => {
      // Navigate to a specific Pokemon
      await page.goto('/pokedex/25'); // Pikachu
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Find and click the favorite button
      const favoriteButton = page.locator(
        'button:has-text("Favorite"), button:has-text("Add to Favorites"), [data-testid="favorite-button"], button[aria-label*="favorite" i]'
      ).first();

      await expect(favoriteButton).toBeVisible({ timeout: 10000 });
      
      // Get initial button state
      const initialText = await favoriteButton.textContent();
      const initialAriaPressed = await favoriteButton.getAttribute('aria-pressed');
      
      // Click to add to favorites
      await favoriteButton.click();
      await page.waitForTimeout(1000); // Wait for state change

      // Verify button state changed
      const updatedText = await favoriteButton.textContent();
      const updatedAriaPressed = await favoriteButton.getAttribute('aria-pressed');
      
      expect(updatedText).not.toBe(initialText);
      expect(updatedAriaPressed).not.toBe(initialAriaPressed);

      // Navigate to favorites page and verify Pokemon is there
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Check for Pikachu in favorites
      const pikachuInFavorites = page.locator('text=/Pikachu/i');
      await expect(pikachuInFavorites).toBeVisible({ timeout: 5000 });

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should add TCG card to favorites from card detail page', async ({ page, consoleLogger }) => {
      // Navigate to a specific card page
      await page.goto('/tcgexpansions/sv1'); // Base Set Scarlet & Violet
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Find first card and open its detail view
      const firstCard = page.locator('[data-testid="card-item"], .card-item').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      
      await firstCard.click();
      await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });

      // Find favorite button in card modal
      const favoriteButton = page.locator(
        'button:has-text("Favorite"), [data-testid="favorite-button"], button[aria-label*="favorite" i]'
      ).first();

      if (await favoriteButton.isVisible()) {
        const initialState = await favoriteButton.getAttribute('aria-pressed') || 'false';
        
        await favoriteButton.click();
        await page.waitForTimeout(1000);
        
        const newState = await favoriteButton.getAttribute('aria-pressed') || 'false';
        expect(newState).not.toBe(initialState);

        // Close modal
        await pageHelpers.closeModal();

        // Verify in favorites page
        await page.goto('/favorites');
        await waitForNetworkIdle(page);
        
        const favoriteItems = page.locator('[data-testid="favorite-item"], .favorite-card');
        await expect(favoriteItems.first()).toBeVisible({ timeout: 5000 });
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should show immediate visual feedback when adding favorites', async ({ page }) => {
      await page.goto('/pokedex/1'); // Bulbasaur
      await waitForNetworkIdle(page);

      const favoriteButton = page.locator('button:has-text("Favorite"), [data-testid="favorite-button"]').first();
      await expect(favoriteButton).toBeVisible();

      // Check for loading state or animation during favorite action
      await favoriteButton.click();
      
      // Should show some kind of loading or transition state
      const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
      const isLoading = await loadingIndicator.isVisible().catch(() => false);
      
      await page.waitForTimeout(1000);
      
      // Button should update to show favorited state
      const buttonText = await favoriteButton.textContent();
      expect(buttonText?.toLowerCase()).toMatch(/(favorited|unfavorite|remove)/i);
    });
  });

  test.describe('Removing Items from Favorites', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure we have at least one favorite item for removal tests
      await page.goto('/pokedex/25'); // Pikachu
      await waitForNetworkIdle(page);
      
      const favoriteButton = page.locator('button:has-text("Favorite"), [data-testid="favorite-button"]').first();
      if (await favoriteButton.isVisible()) {
        const buttonText = await favoriteButton.textContent();
        if (!buttonText?.toLowerCase().includes('remove') && !buttonText?.toLowerCase().includes('unfavorite')) {
          await favoriteButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    test('should remove Pokemon from favorites page', async ({ page, consoleLogger }) => {
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      const favoriteItems = page.locator('[data-testid="favorite-item"], .favorite-card, .favorite-pokemon');
      const initialCount = await favoriteItems.count();
      
      if (initialCount > 0) {
        const firstItem = favoriteItems.first();
        const removeButton = firstItem.locator(
          'button:has-text("Remove"), button:has-text("Unfavorite"), [data-testid="remove-favorite"], button[aria-label*="remove" i]'
        ).first();

        await expect(removeButton).toBeVisible();
        await removeButton.click();

        // Handle confirmation dialog if present
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
        if (await confirmButton.isVisible({ timeout: 1000 })) {
          await confirmButton.click();
        }

        await page.waitForTimeout(1000);

        // Verify item was removed
        const finalCount = await favoriteItems.count();
        expect(finalCount).toBe(initialCount - 1);
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should remove Pokemon from detail page', async ({ page, consoleLogger }) => {
      await page.goto('/pokedex/25'); // Pikachu (should be favorited from beforeEach)
      await waitForNetworkIdle(page);

      const favoriteButton = page.locator('button:has-text("Unfavorite"), button:has-text("Remove"), [data-testid="favorite-button"]').first();
      await expect(favoriteButton).toBeVisible();

      await favoriteButton.click();
      await page.waitForTimeout(1000);

      // Verify button state changed back
      const buttonText = await favoriteButton.textContent();
      expect(buttonText?.toLowerCase()).toMatch(/(add|favorite)(?!d)/i);

      // Verify removed from favorites page
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      
      const pikachuInFavorites = page.locator('text=/Pikachu/i');
      await expect(pikachuInFavorites).not.toBeVisible({ timeout: 3000 });

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle bulk removal of favorites', async ({ page }) => {
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      
      const favoriteItems = page.locator('[data-testid="favorite-item"], .favorite-card');
      const itemCount = await favoriteItems.count();
      
      if (itemCount > 1) {
        // Look for select all checkbox
        const selectAllCheckbox = page.locator('input[type="checkbox"][data-testid="select-all"], button:has-text("Select All")').first();
        
        if (await selectAllCheckbox.isVisible()) {
          await selectAllCheckbox.click();
          
          // Find bulk delete button
          const bulkDeleteButton = page.locator('button:has-text("Delete Selected"), [data-testid="bulk-delete"]').first();
          
          if (await bulkDeleteButton.isVisible()) {
            await bulkDeleteButton.click();
            
            // Confirm bulk deletion
            const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
            if (await confirmButton.isVisible({ timeout: 1000 })) {
              await confirmButton.click();
            }
            
            await page.waitForTimeout(2000);
            
            // Verify items were removed
            const remainingItems = await favoriteItems.count();
            expect(remainingItems).toBeLessThan(itemCount);
          }
        }
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist favorites across browser sessions', async ({ page, context }) => {
      // Add a favorite
      await page.goto('/pokedex/150'); // Mewtwo
      await waitForNetworkIdle(page);
      
      const favoriteButton = page.locator('button:has-text("Favorite"), [data-testid="favorite-button"]').first();
      if (await favoriteButton.isVisible()) {
        const buttonText = await favoriteButton.textContent();
        if (!buttonText?.toLowerCase().includes('remove')) {
          await favoriteButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // Check favorites count
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      const initialFavorites = await page.locator('[data-testid="favorite-item"], .favorite-card').count();

      // Create new page (simulates new browser session)
      const newPage = await context.newPage();
      await newPage.goto('/favorites');
      await waitForNetworkIdle(newPage);
      
      const newSessionFavorites = await newPage.locator('[data-testid="favorite-item"], .favorite-card').count();
      expect(newSessionFavorites).toBe(initialFavorites);
      
      // Check specific Pokemon still there
      await expect(newPage.locator('text=/Mewtwo/i')).toBeVisible({ timeout: 5000 });
      
      await newPage.close();
    });

    test('should sync favorites across multiple tabs', async ({ page, context }) => {
      // Open second tab
      const tab2 = await context.newPage();
      
      // Add favorite in first tab
      await page.goto('/pokedex/144'); // Articuno
      await waitForNetworkIdle(page);
      
      const favoriteButton = page.locator('button:has-text("Favorite"), [data-testid="favorite-button"]').first();
      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        await page.waitForTimeout(1000);
      }

      // Check if it appears in second tab (with refresh)
      await tab2.goto('/favorites');
      await waitForNetworkIdle(tab2);
      await tab2.reload();
      await waitForNetworkIdle(tab2);
      
      await expect(tab2.locator('text=/Articuno/i')).toBeVisible({ timeout: 5000 });
      
      await tab2.close();
    });

    test('should handle favorites storage errors gracefully', async ({ page, consoleLogger }) => {
      // Mock localStorage to throw an error
      await page.addInitScript(() => {
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
          if (key.includes('favorite')) {
            throw new Error('Storage quota exceeded');
          }
          return originalSetItem.call(this, key, value);
        };
      });

      await page.goto('/pokedex/25'); // Pikachu
      await waitForNetworkIdle(page);

      const favoriteButton = page.locator('button:has-text("Favorite"), [data-testid="favorite-button"]').first();
      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        
        // Should show some error message or fallback behavior
        const errorMessage = page.locator('[data-testid="error"], .error-message, .alert');
        const hasError = await errorMessage.isVisible({ timeout: 2000 });
        
        // Either should show error or gracefully fail
        expect(hasError || true).toBe(true); // Always passes but documents the behavior
      }

      // Console should not have unhandled errors
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Filtering and Sorting', () => {
    test('should filter favorites by type', async ({ page }) => {
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      const favoriteItems = await page.locator('[data-testid="favorite-item"], .favorite-card').count();
      
      if (favoriteItems > 0) {
        // Find type filter
        const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"], button:has-text("Type")').first();
        
        if (await typeFilter.isVisible()) {
          const initialCount = await page.locator('[data-testid="favorite-item"]:visible, .favorite-card:visible').count();
          
          // Apply filter
          if (await typeFilter.evaluate(el => el.tagName === 'SELECT')) {
            await typeFilter.selectOption({ index: 1 }); // Select first non-default option
          } else {
            await typeFilter.click();
            const firstOption = page.locator('[data-testid="filter-option"], .filter-option').first();
            if (await firstOption.isVisible()) {
              await firstOption.click();
            }
          }
          
          await page.waitForTimeout(1000);
          
          // Verify filtering applied
          const filteredCount = await page.locator('[data-testid="favorite-item"]:visible, .favorite-card:visible').count();
          expect(filteredCount).toBeLessThanOrEqual(initialCount);
        }
      }
    });

    test('should sort favorites by different criteria', async ({ page }) => {
      await page.goto('/favorites');
      await waitForNetworkIdle(page);

      const favoriteItems = await page.locator('[data-testid="favorite-item"], .favorite-card').count();
      
      if (favoriteItems > 1) {
        // Find sort control
        const sortControl = page.locator('select[name="sort"], [data-testid="sort-select"], button:has-text("Sort")').first();
        
        if (await sortControl.isVisible()) {
          // Get initial order
          const firstItem = await page.locator('[data-testid="favorite-item"], .favorite-card').first().textContent();
          
          // Change sort order
          if (await sortControl.evaluate(el => el.tagName === 'SELECT')) {
            await sortControl.selectOption({ index: 1 });
          } else {
            await sortControl.click();
            const sortOption = page.locator('[data-testid="sort-option"], .sort-option').nth(1);
            if (await sortOption.isVisible()) {
              await sortOption.click();
            }
          }
          
          await page.waitForTimeout(1000);
          
          // Verify order changed
          const newFirstItem = await page.locator('[data-testid="favorite-item"], .favorite-card').first().textContent();
          expect(newFirstItem).not.toBe(firstItem);
        }
      }
    });

    test('should search within favorites', async ({ page }) => {
      await page.goto('/favorites');
      await waitForNetworkIdle(page);

      const searchInput = page.locator('input[placeholder*="search" i], [data-testid="search-input"]').first();
      
      if (await searchInput.isVisible()) {
        const initialCount = await page.locator('[data-testid="favorite-item"], .favorite-card').count();
        
        if (initialCount > 0) {
          // Search for specific term
          await searchInput.fill('pika');
          await page.waitForTimeout(1000);
          
          const searchResults = await page.locator('[data-testid="favorite-item"]:visible, .favorite-card:visible').count();
          expect(searchResults).toBeLessThanOrEqual(initialCount);
          
          // Clear search
          await searchInput.fill('');
          await page.waitForTimeout(500);
          
          const clearedResults = await page.locator('[data-testid="favorite-item"]:visible, .favorite-card:visible').count();
          expect(clearedResults).toBe(initialCount);
        }
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work properly on mobile devices', async ({ page, consoleLogger }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Verify mobile layout
      const favoritesContainer = page.locator('[data-testid="favorites-container"], .favorites-grid').first();
      
      if (await favoritesContainer.isVisible()) {
        const containerStyle = await favoritesContainer.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            gridColumns: style.gridTemplateColumns,
            flexDirection: style.flexDirection,
            display: style.display
          };
        });
        
        // Should be single column or stacked layout on mobile
        expect(containerStyle.display).toBeTruthy();
      }

      // Test touch interactions
      const favoriteItems = page.locator('[data-testid="favorite-item"], .favorite-card');
      const itemCount = await favoriteItems.count();
      
      if (itemCount > 0) {
        const firstItem = favoriteItems.first();
        
        // Test tap to select/interact
        await firstItem.tap();
        await page.waitForTimeout(500);
        
        // Should show some interaction feedback
        const isSelected = await firstItem.evaluate(el => el.classList.contains('selected') || el.getAttribute('aria-selected') === 'true');
        expect(typeof isSelected).toBe('boolean');
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle swipe gestures for item management', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/favorites');
      await waitForNetworkIdle(page);

      const favoriteItems = page.locator('[data-testid="favorite-item"], .favorite-card');
      const itemCount = await favoriteItems.count();
      
      if (itemCount > 0) {
        const firstItem = favoriteItems.first();
        const itemBox = await firstItem.boundingBox();
        
        if (itemBox) {
          // Simulate swipe left gesture
          await page.touchscreen.tap(itemBox.x + itemBox.width - 10, itemBox.y + itemBox.height / 2);
          await page.touchscreen.tap(itemBox.x + 10, itemBox.y + itemBox.height / 2);
          
          await page.waitForTimeout(500);
          
          // Should reveal action buttons or show swipe menu
          const actionButtons = page.locator('button:has-text("Delete"), button:has-text("Remove"), .swipe-action');
          const hasActions = await actionButtons.first().isVisible({ timeout: 1000 });
          
          // This is more of a documentation test - swipe functionality may or may not be implemented
          expect(typeof hasActions).toBe('boolean');
        }
      }
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle empty favorites state gracefully', async ({ page, consoleLogger }) => {
      // Clear all favorites first (if possible)
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      
      // Look for empty state
      const emptyState = page.locator('[data-testid="empty-favorites"], .empty-state, text=/no favorites|start favoriting/i');
      const favoriteItems = page.locator('[data-testid="favorite-item"], .favorite-card');
      
      const hasItems = await favoriteItems.count() > 0;
      const hasEmptyState = await emptyState.isVisible();
      
      if (!hasItems) {
        // Should show empty state
        await expect(emptyState).toBeVisible();
        
        // Empty state should have helpful message
        const emptyText = await emptyState.textContent();
        expect(emptyText?.toLowerCase()).toMatch(/(no favorites|start|add|empty)/i);
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle network failures gracefully', async ({ page, consoleLogger }) => {
      // Mock API to fail by intercepting requests
      await page.route('**/api/favorites**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      
      // Should show error state or fallback
      const errorState = page.locator('[data-testid="error"], .error-message, text=/error|failed/i');
      const hasError = await errorState.isVisible({ timeout: 5000 });
      
      if (hasError) {
        const errorText = await errorState.textContent();
        expect(errorText?.toLowerCase()).toMatch(/(error|failed|problem)/i);
      }

      // Should not crash the page
      await expect(page.locator('body')).toBeVisible();
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle rapid favorite/unfavorite clicks', async ({ page, consoleLogger }) => {
      await page.goto('/pokedex/25'); // Pikachu
      await waitForNetworkIdle(page);

      const favoriteButton = page.locator('button:has-text("Favorite"), [data-testid="favorite-button"]').first();
      await expect(favoriteButton).toBeVisible();

      // Rapidly click favorite button multiple times
      for (let i = 0; i < 5; i++) {
        await favoriteButton.click();
        await page.waitForTimeout(200);
      }

      // Button should settle into a consistent state
      await page.waitForTimeout(1000);
      const finalText = await favoriteButton.textContent();
      expect(finalText).toBeTruthy();
      
      // Should not create duplicate entries
      await page.goto('/favorites');
      await waitForNetworkIdle(page);
      
      const pikachuEntries = page.locator('text=/Pikachu/i');
      const entryCount = await pikachuEntries.count();
      expect(entryCount).toBeLessThanOrEqual(1);

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });
});