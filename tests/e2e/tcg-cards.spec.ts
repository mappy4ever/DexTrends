import { test, expect } from '@playwright/test';

test.describe('TCG Cards and Sets', () => {
  test('should navigate to TCG sets page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /tcg sets/i }).click();
    
    await expect(page).toHaveURL('/tcgsets');
    await expect(page.locator('h1:has-text("TCG Sets")').or(page.locator('[data-testid="page-title"]'))).toBeVisible();
  });

  test('should display TCG sets', async ({ page }) => {
    await page.goto('/tcgsets');
    
    // Wait for sets to load
    await expect(page.locator('[data-testid="tcg-set"]').or(page.locator('.set-card')).or(page.locator('article')).first()).toBeVisible({ timeout: 15000 });
    
    // Should show multiple sets
    const setCards = page.locator('[data-testid="tcg-set"]').or(page.locator('.set-card')).or(page.locator('article'));
    const count = await setCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should view cards in a specific set', async ({ page }) => {
    await page.goto('/tcgsets');
    
    // Click on first set
    await page.locator('[data-testid="tcg-set"]').or(page.locator('.set-card')).or(page.locator('article')).first().click();
    
    // Should navigate to set detail page
    await expect(page).toHaveURL(/\/tcgsets\/[^\/]+/);
    
    // Should show cards from that set
    await expect(page.locator('[data-testid="card-item"]').or(page.locator('.card-item')).or(page.locator('article')).first()).toBeVisible({ timeout: 15000 });
  });

  test('should display card prices and market data', async ({ page }) => {
    await page.goto('/tcgsets');
    
    // Navigate to a set with cards
    await page.locator('[data-testid="tcg-set"]').or(page.locator('.set-card')).first().click();
    
    // Look for price information
    const priceElement = page.locator('[data-testid="card-price"]').or(page.locator('.price')).or(page.locator('text=/$\\d+/')).first();
    await expect(priceElement).toBeVisible({ timeout: 15000 });
  });
});