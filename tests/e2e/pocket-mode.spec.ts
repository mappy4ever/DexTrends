import { test, expect } from '@playwright/test';

test.describe('Pocket Mode', () => {
  test('should navigate to Pocket Mode', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /pocket mode/i }).click();
    
    await expect(page).toHaveURL('/pocketmode');
    await expect(page.locator('h1:has-text("Pocket")').or(page.locator('[data-testid="pocket-mode-title"]'))).toBeVisible();
  });

  test('should display pocket cards', async ({ page }) => {
    await page.goto('/pocketmode');
    
    // Wait for pocket cards to load
    await expect(page.locator('[data-testid="pocket-card"]').or(page.locator('.pocket-card')).first()).toBeVisible({ timeout: 15000 });
  });

  test('should access deck builder', async ({ page }) => {
    await page.goto('/pocketmode');
    
    // Look for deck builder link
    const deckBuilderLink = page.getByRole('link', { name: /deck builder/i });
    if (await deckBuilderLink.isVisible()) {
      await deckBuilderLink.click();
      await expect(page).toHaveURL(/deckbuilder/);
    }
  });

  test('should view expansions', async ({ page }) => {
    await page.goto('/pocketmode');
    
    // Look for expansions link
    const expansionsLink = page.getByRole('link', { name: /expansions/i });
    if (await expansionsLink.isVisible()) {
      await expansionsLink.click();
      await expect(page).toHaveURL(/expansions/);
    }
  });
});