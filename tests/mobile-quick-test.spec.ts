import { test, expect } from '@playwright/test';

test.describe('Mobile Layout Quick Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport to 375px
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Set shorter timeout for these quick tests
    page.setDefaultTimeout(5000);
  });

  test('Pokemon detail page shows mobile layout', async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex/25');
    
    // Wait for page load with short timeout
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    // Check for mobile Pokemon detail class
    const mobileDetail = page.locator('.mobile-pokemon-detail');
    await expect(mobileDetail).toBeVisible({ timeout: 5000 });
  });

  test('TCG set detail page shows mobile layout', async ({ page }) => {
    await page.goto('http://localhost:3001/tcgexpansions/base1');
    
    // Wait for page load with short timeout
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    // Check for mobile TCG set detail class
    const mobileSetDetail = page.locator('.mobile-tcg-set-detail');
    await expect(mobileSetDetail).toBeVisible({ timeout: 5000 });
  });

  test('Pokemon moves page shows mobile layout', async ({ page }) => {
    await page.goto('http://localhost:3001/pokemon/moves');
    
    // Wait for page load with short timeout
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    // Check for mobile moves page class
    const mobileMovesPage = page.locator('.mobile-moves-page');
    await expect(mobileMovesPage).toBeVisible({ timeout: 5000 });
  });
});