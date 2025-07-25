import { test, expect } from '@playwright/test';

test.describe('Pokemon Detail Page - Final Check', () => {
  test('Pikachu page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/pokedex/pikachu');
    await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 10000 });
    
    // Check if page loaded successfully
    await expect(page.locator('[data-testid="pokemon-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="pokemon-name"]')).toContainText('Pikachu');
    
    // Check tabs are visible
    await expect(page.locator('[data-testid="tab-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-moves"]')).toBeVisible();
    
    expect(errors).toHaveLength(0);
  });
  
  test('Dual-type Pokemon (Bulbasaur) loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/pokedex/bulbasaur');
    await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 10000 });
    
    // Check if page loaded successfully
    await expect(page.locator('[data-testid="pokemon-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="pokemon-name"]')).toContainText('Bulbasaur');
    
    // Check types (should have 2 for Bulbasaur)
    const types = await page.locator('[data-testid="pokemon-types"] .type-badge').count();
    expect(types).toBe(2);
    
    expect(errors).toHaveLength(0);
  });
  
  test('All tabs load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/pokedex/pikachu');
    await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 10000 });
    
    const tabs = [
      'overview',
      'stats', 
      'moves',
      'evolution',
      'locations',
      'cards',
      'competitive',
      'breeding'
    ];
    
    for (const tab of tabs) {
      await page.click(`[data-testid="tab-${tab}"]`);
      await page.waitForTimeout(500); // Wait for tab content to load
      
      // Check no errors occurred
      expect(errors).toHaveLength(0);
    }
  });
});