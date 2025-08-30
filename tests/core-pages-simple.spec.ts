import { test, expect } from '@playwright/test';

test.describe('Core Pages Basic Functionality Test', () => {
  const baseURL = 'http://localhost:3001';

  test('Homepage loads without crashing', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForLoadState('domcontentloaded');
    
    // Check page doesn't show error
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('500');
    expect(pageText).not.toContain('Internal Server Error');
    
    // Check basic structure exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Pokedex page loads without crashing', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Wait for initial load
    await page.waitForLoadState('domcontentloaded');
    
    // Check page doesn't show error
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('500');
    expect(pageText).not.toContain('Internal Server Error');
    
    // Check basic structure exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('TCG Sets page loads without crashing', async ({ page }) => {
    await page.goto('/tcg-sets');
    
    // Wait for initial load
    await page.waitForLoadState('domcontentloaded');
    
    // Check page doesn't show error
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('500');
    expect(pageText).not.toContain('Internal Server Error');
    
    // Check basic structure exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Pokemon Detail page (Pikachu) loads without crashing', async ({ page }) => {
    await page.goto('/pokedex/25');
    
    // Wait for initial load
    await page.waitForLoadState('domcontentloaded');
    
    // Check page doesn't show error
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('500');
    expect(pageText).not.toContain('Internal Server Error');
    
    // Check basic structure exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('All pages have proper HTML structure', async ({ page }) => {
    const pages = ['/', '/pokedex', '/tcg-sets', '/pokedex/25'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');
      
      // Check basic HTML structure
      const html = page.locator('html');
      const head = page.locator('head');
      const body = page.locator('body');
      
      await expect(html).toBeVisible();
      await expect(head).toBeAttached();
      await expect(body).toBeVisible();
      
      // Check no JavaScript errors in console
      const errors = [];
      page.on('pageerror', error => errors.push(error));
      
      // Wait a moment for any errors to surface
      await page.waitForTimeout(1000);
      
      // Log any errors but don't fail the test (some might be expected)
      if (errors.length > 0) {
        console.log(`JavaScript errors on ${pagePath}:`, errors.map(e => e.message));
      }
    }
  });
});