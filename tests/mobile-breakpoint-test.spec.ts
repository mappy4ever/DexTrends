import { test, expect } from '@playwright/test';

test.describe('Mobile Breakpoint Tests', () => {
  // Test at iPhone 16 Pro Max viewport (430x932)
  test('iPhone 16 Pro Max - Shows mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto('http://localhost:3001/pokedex');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Should show mobile layout
    const mobileLayout = await page.locator('.mobile-layout').count();
    expect(mobileLayout).toBeGreaterThan(0);
    
    // Header should be compact (44px)
    const header = await page.locator('header.mobile-header').first();
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBeLessThanOrEqual(44);
  });
  
  // Test at iPhone SE viewport (375x667)
  test('iPhone SE - Shows mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/pokedex');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Should show mobile layout
    const mobileLayout = await page.locator('.mobile-layout').count();
    expect(mobileLayout).toBeGreaterThan(0);
  });
  
  // Test at 431px (just above breakpoint)
  test('431px width - Shows desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 431, height: 932 });
    await page.goto('http://localhost:3001/pokedex');
    
    // Should NOT show mobile layout
    const mobileLayout = await page.locator('.mobile-layout').count();
    expect(mobileLayout).toBe(0);
  });
  
  // Test Pokemon detail page for overlapping issues
  test('Pokemon detail - No overlapping on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto('http://localhost:3001/pokedex/25'); // Pikachu
    
    // Wait for content to load
    await page.waitForSelector('.mobile-pokemon-detail', { timeout: 5000 });
    
    // Check that image gallery is compact
    const imageGallery = await page.locator('.image-gallery');
    const galleryBox = await imageGallery.boundingBox();
    expect(galleryBox?.height).toBeLessThanOrEqual(180);
    
    // Check that content sections don't overlap
    const header = await page.locator('.mobile-header').boundingBox();
    const content = await page.locator('.mobile-content').first().boundingBox();
    
    if (header && content) {
      // Content should start below header
      expect(content.y).toBeGreaterThanOrEqual(header.y + header.height);
    }
  });
  
  // Test for horizontal scrolling (should not exist)
  test('No horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto('http://localhost:3001/pokedex');
    
    // Check document width doesn't exceed viewport
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(430);
  });
  
  // Test navigation takes minimal space
  test('Navigation is compact on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto('http://localhost:3001/');
    
    // Total navigation should not exceed 44px
    const navElements = await page.locator('.mobile-header, .mobile-nav, nav').all();
    let totalNavHeight = 0;
    
    for (const element of navElements) {
      const box = await element.boundingBox();
      if (box) {
        totalNavHeight += box.height;
      }
    }
    
    // Navigation should be compact
    expect(totalNavHeight).toBeLessThanOrEqual(50);
  });
});