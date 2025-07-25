import { test, expect, devices } from '@playwright/test';

// Run these tests only on mobile viewports
test.use(devices['iPhone 12']);

test.describe('Mobile Experience', () => {
  test('should have mobile-friendly navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for hamburger menu or mobile nav
    const mobileMenuButton = page.locator('[aria-label*="menu" i]').or(page.locator('button:has-text("Menu")')).or(page.locator('[data-testid="mobile-menu"]'));
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Navigation should be visible after clicking menu
      await expect(page.getByRole('link', { name: /pokedex/i })).toBeVisible();
    }
  });

  test('should have touch-friendly card interactions', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Wait for Pokemon cards
    const firstCard = page.locator('[data-testid="pokemon-card"]').or(page.locator('.pokemon-card')).first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    
    // Tap on card
    await firstCard.tap();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/pokedex\/\d+/);
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport width
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThan(768);
    
    // Content should fit within viewport
    const body = page.locator('body');
    const boundingBox = await body.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(viewportSize?.width || 0);
  });

  test('should support pull-to-refresh if implemented', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Try pull-to-refresh gesture
    await page.locator('body').evaluate((element) => {
      // Simulate pull down gesture
      const touch = new Touch({
        identifier: 1,
        target: element,
        clientX: 100,
        clientY: 100,
      });
      
      const touchStart = new TouchEvent('touchstart', {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
      });
      
      element.dispatchEvent(touchStart);
    });
    
    // This is just a basic test - actual pull-to-refresh would need more complex gesture simulation
  });
});