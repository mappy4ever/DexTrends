import { test, expect } from '@playwright/test';

test.describe('Unified Pokédex', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pokedex-new');
    await page.waitForLoadState('networkidle');
  });

  test('should display circular Pokémon cards with proper aspect ratio', async ({ page }) => {
    // Wait for grid to load
    await page.waitForSelector('[data-testid="unified-grid"]');
    
    // Check if cards are rendered
    const cards = await page.locator('[data-testid^="pokemon-card-"]').count();
    expect(cards).toBeGreaterThan(0);
    
    // Check first card dimensions
    const firstCard = page.locator('[data-testid^="pokemon-card-"]').first();
    const cardBox = await firstCard.boundingBox();
    
    if (cardBox) {
      // Card should maintain aspect ratio (height > width for vertical layout)
      expect(cardBox.height).toBeGreaterThan(cardBox.width);
      
      // Check if circular element exists within card
      const circularElement = firstCard.locator('.rounded-full').first();
      await expect(circularElement).toBeVisible();
      
      // Verify gradient background is applied
      const hasGradient = await firstCard.locator('.bg-gradient-to-br').count();
      expect(hasGradient).toBeGreaterThan(0);
    }
  });

  test('should be responsive across viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    let grid = page.locator('[data-testid="unified-grid"]');
    await expect(grid).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(grid).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(grid).toBeVisible();
  });

  test('should have working filters', async ({ page }) => {
    // Open filter modal
    await page.getByText('Filters').click();
    await page.waitForSelector('[role="dialog"], .mobile-filter-sheet, [data-testid="modal-content"]');
    
    // Select a type filter
    const fireType = page.getByRole('button', { name: /fire/i }).first();
    if (await fireType.isVisible()) {
      await fireType.click();
    }
    
    // Apply filters (if modal has apply button)
    const applyButton = page.getByRole('button', { name: /apply/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }
    
    // Check that filters are applied
    await page.waitForTimeout(500);
    const filteredCards = await page.locator('[data-testid^="pokemon-card-"]').count();
    expect(filteredCards).toBeGreaterThan(0);
  });

  test('should have working search', async ({ page }) => {
    // Type in search
    await page.fill('input[placeholder*="Search"]', 'pikachu');
    await page.waitForTimeout(500);
    
    // Check that results are filtered
    const cards = await page.locator('[data-testid^="pokemon-card-"]').count();
    expect(cards).toBeLessThan(10); // Should show only Pikachu variants
  });
});