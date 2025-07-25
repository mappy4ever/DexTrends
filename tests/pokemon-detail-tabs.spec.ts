import { test, expect } from '@playwright/test';

test.describe('Pokemon Detail Page - Tab Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Pikachu's detail page
    await page.goto('/pokedex/pikachu');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 10000 });
  });

  test('should load Overview tab without errors', async ({ page }) => {
    // Overview is the default tab
    await expect(page.locator('[data-testid="tab-overview"]')).toHaveClass(/bg-gradient-to-r/);
    
    // Check if basic info is visible
    await expect(page.locator('[data-testid="pokemon-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="pokemon-types"]')).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should load Stats tab without errors', async ({ page }) => {
    await page.click('[data-testid="tab-stats"]');
    await page.waitForTimeout(500);
    
    // Check if stats content is visible
    await expect(page.locator('text=Base Stats')).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should load Moves tab without errors', async ({ page }) => {
    await page.click('[data-testid="tab-moves"]');
    await page.waitForTimeout(500);
    
    // Check if moves content is visible
    await expect(page.locator('text=Level Up Moves').or(page.locator('text=Moves'))).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should load Evolution tab without errors', async ({ page }) => {
    await page.click('[data-testid="tab-evolution"]');
    await page.waitForTimeout(500);
    
    // Check if evolution content is visible
    await expect(page.locator('text=Evolution').first()).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should load Locations tab without errors', async ({ page }) => {
    await page.click('[data-testid="tab-locations"]');
    await page.waitForTimeout(500);
    
    // Check if locations content is visible
    await expect(page.locator('text=Locations').or(page.locator('text=Where to Find'))).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should load Cards tab without errors', async ({ page }) => {
    await page.click('[data-testid="tab-cards"]');
    await page.waitForTimeout(500);
    
    // Check if cards content is visible
    await expect(page.locator('text=TCG Cards').or(page.locator('text=Cards'))).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should load Competitive tab without errors', async ({ page }) => {
    await page.click('[data-testid="tab-competitive"]');
    await page.waitForTimeout(500);
    
    // Check if competitive content is visible
    await expect(page.locator('text=Competitive').or(page.locator('text=Battle Strategy'))).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should load Breeding tab without errors', async ({ page }) => {
    await page.click('[data-testid="tab-breeding"]');
    await page.waitForTimeout(500);
    
    // Check if breeding content is visible
    await expect(page.locator('text=Breeding').or(page.locator('text=Egg Groups'))).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should test with a dual-type Pokemon', async ({ page }) => {
    // Navigate to Bulbasaur (grass/poison type)
    await page.goto('/pokedex/bulbasaur');
    await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 10000 });
    
    // Check if dual types are displayed
    await expect(page.locator('[data-testid="pokemon-types"]')).toBeVisible();
    
    // Check console for errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});