import { test, expect } from '@playwright/test';

test.describe('Full Bleed Background Tests', () => {
  test('TCG Sets page has full-height background without cutoff', async ({ page }) => {
    await page.goto('/tcg-sets');
    
    // Wait for page to load
    await page.waitForSelector('h1');
    
    // Check that the FullBleedWrapper exists and has proper height
    const wrapper = await page.locator('.min-h-screen').first();
    await expect(wrapper).toBeVisible();
    
    // Get viewport and wrapper dimensions
    const viewportSize = await page.viewportSize();
    const wrapperBox = await wrapper.boundingBox();
    
    // Verify wrapper extends at least to viewport height
    expect(wrapperBox?.height).toBeGreaterThanOrEqual(viewportSize?.height || 0);
    
    // Check background gradient is applied
    const hasGradient = await wrapper.evaluate(el => {
      const computedStyle = window.getComputedStyle(el);
      return computedStyle.backgroundImage.includes('gradient') || 
             el.className.includes('gradient');
    });
    expect(hasGradient).toBeTruthy();
    
    // Scroll to bottom and verify background still extends
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Check no white space at bottom
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const htmlHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(bodyHeight).toBe(htmlHeight);
  });

  test('Pokemon detail page has full background coverage', async ({ page }) => {
    await page.goto('/pokedex/25'); // Pikachu
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 10000 }).catch(() => {
      // Fallback to any h1 if test-id not found
      return page.waitForSelector('h1');
    });
    
    // Check FullBleedWrapper
    const wrapper = await page.locator('.min-h-screen').first();
    await expect(wrapper).toBeVisible();
    
    // Verify background extends properly
    const wrapperBox = await wrapper.boundingBox();
    const viewportSize = await page.viewportSize();
    expect(wrapperBox?.height).toBeGreaterThanOrEqual(viewportSize?.height || 0);
  });

  test('Layout component applies fullBleed mode correctly', async ({ page }) => {
    await page.goto('/tcg-sets');
    
    // Check that main element doesn't have extra padding when fullBleed is true
    const main = await page.locator('main').first();
    const hasNoPaddingTop = await main.evaluate(el => {
      const computedStyle = window.getComputedStyle(el);
      return !el.className.includes('pt-20');
    });
    expect(hasNoPaddingTop).toBeTruthy();
  });

  test('Mobile view maintains full background', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tcg-sets');
    
    // Wait for page load
    await page.waitForSelector('h1');
    
    // Check wrapper height
    const wrapper = await page.locator('.min-h-screen').first();
    const wrapperBox = await wrapper.boundingBox();
    expect(wrapperBox?.height).toBeGreaterThanOrEqual(812);
    
    // Verify no cutoff at bottom
    const htmlElement = await page.locator('html');
    const htmlHeight = await htmlElement.evaluate(el => el.scrollHeight);
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(htmlHeight).toBe(bodyHeight);
  });
});