import { test, expect } from '@playwright/test';

test.describe('Pokemon Detail Page Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a Pokemon detail page
    await page.goto('/pokedex/25'); // Pikachu
    
    // Wait for the page to fully load - wait for Pokemon name
    await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 15000 });
    // Also wait for navigation to be ready
    await page.waitForTimeout(1000);
  });

  test('tabs should be clickable and persist selection', async ({ page }) => {
    // Wait for tabs to be visible
    await page.waitForSelector('[data-testid="tab-stats"]', { state: 'visible' });
    
    // Click on the Stats tab
    await page.click('[data-testid="tab-stats"]');
    
    // Verify the Stats tab content is visible
    await expect(page.locator('text=Base Stats')).toBeVisible({ timeout: 5000 });
    
    // Click on the Evolution tab
    await page.click('[data-testid="tab-evolution"]');
    
    // Verify the Evolution tab content is visible
    await expect(page.locator('text=Evolution Chain')).toBeVisible({ timeout: 5000 });
    
    // Reload the page
    await page.reload();
    
    // Wait for tabs to load
    await page.waitForSelector('[data-testid="tab-evolution"]', { state: 'visible' });
    
    // Verify the Evolution tab is still selected (persisted via localStorage)
    await expect(page.locator('text=Evolution Chain')).toBeVisible({ timeout: 5000 });
  });

  test('navigation arrows should work without interfering with tabs', async ({ page }) => {
    // Verify navigation arrows are visible
    await expect(page.locator('[data-testid="nav-prev"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-next"]')).toBeVisible();
    
    // Click on a tab
    await page.click('[data-testid="tab-moves"]');
    
    // Verify tab content loads
    await expect(page.locator('text=Level Up Moves')).toBeVisible({ timeout: 5000 });
    
    // Click next navigation arrow
    await page.click('[data-testid="nav-next"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/pokedex/26'); // Raichu
    
    // Verify we're on the next Pokemon page
    await expect(page.locator('h1:has-text("Raichu")')).toBeVisible({ timeout: 10000 });
  });

  test('no Fast Refresh loops should occur', async ({ page }) => {
    let refreshCount = 0;
    
    // Monitor for page reloads
    page.on('load', () => {
      refreshCount++;
    });
    
    // Wait for 5 seconds to ensure no unexpected reloads
    await page.waitForTimeout(5000);
    
    // Should only have the initial load
    expect(refreshCount).toBeLessThanOrEqual(1);
    
    // Interact with tabs to ensure no reload on interaction
    await page.click('[data-testid="tab-breeding"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="tab-locations"]');
    await page.waitForTimeout(1000);
    
    // Still should not have reloaded
    expect(refreshCount).toBeLessThanOrEqual(1);
  });

  test('floating stats widget should appear on scroll', async ({ page }) => {
    // Initially, floating widget should not be visible
    await expect(page.locator('.floating-stats-widget')).not.toBeVisible();
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 700));
    
    // Wait a moment for the animation
    await page.waitForTimeout(500);
    
    // Floating widget should now be visible
    await expect(page.locator('.floating-stats-widget')).toBeVisible();
    
    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Floating widget should be hidden again
    await expect(page.locator('.floating-stats-widget')).not.toBeVisible();
  });

  test('tab state should persist across Pokemon navigation', async ({ page }) => {
    // Select the Cards tab
    await page.click('[data-testid="tab-cards"]');
    await expect(page.locator('text=TCG Cards')).toBeVisible({ timeout: 5000 });
    
    // Navigate to next Pokemon
    await page.click('[data-testid="nav-next"]');
    await page.waitForURL('**/pokedex/26');
    
    // The Cards tab should still be selected
    await expect(page.locator('[data-testid="tab-cards"]')).toHaveClass(/tabActive/);
    await expect(page.locator('text=TCG Cards')).toBeVisible({ timeout: 5000 });
  });

  test('keyboard navigation should work', async ({ page }) => {
    // Press right arrow key
    await page.keyboard.press('ArrowRight');
    
    // Should navigate to next Pokemon
    await page.waitForURL('**/pokedex/26');
    await expect(page.locator('h1:has-text("Raichu")')).toBeVisible({ timeout: 10000 });
    
    // Press left arrow key
    await page.keyboard.press('ArrowLeft');
    
    // Should navigate back to Pikachu
    await page.waitForURL('**/pokedex/25');
    await expect(page.locator('h1:has-text("Pikachu")')).toBeVisible({ timeout: 10000 });
  });
});