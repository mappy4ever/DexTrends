import { test, expect } from '@playwright/test';

test.describe('TCG Sets Mobile Tests', () => {
  test('Should display TCG sets on mobile (320px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Go to TCG sets page
    await page.goto('http://localhost:3001/tcgexpansions');
    
    // Wait for sets to load
    await page.waitForTimeout(3000);
    
    // Check that sets are visible
    const gridItems = await page.locator('.grid > div').count();
    console.log(`Mobile 320px - Grid items: ${gridItems}`);
    
    // Take screenshot
    await page.screenshot({ path: 'tcg-mobile-320.png', fullPage: true });
    
    expect(gridItems).toBeGreaterThan(0);
  });
  
  test('Should display TCG sets on tablet (768px)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Go to TCG sets page
    await page.goto('http://localhost:3001/tcgexpansions');
    
    // Wait for sets to load
    await page.waitForTimeout(3000);
    
    // Check that sets are visible
    const gridItems = await page.locator('.grid > div').count();
    console.log(`Tablet 768px - Grid items: ${gridItems}`);
    
    // Take screenshot
    await page.screenshot({ path: 'tcg-tablet-768.png', fullPage: true });
    
    expect(gridItems).toBeGreaterThan(0);
  });
});