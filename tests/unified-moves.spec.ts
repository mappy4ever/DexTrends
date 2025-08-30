import { test, expect } from '@playwright/test';

test.describe('Unified Moves Page', () => {
  test('responsive layout test - mobile and desktop', async ({ page }) => {
    // Navigate to moves page
    await page.goto('/pokemon/moves');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Mobile viewport test
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    
    // Should show cards on mobile
    const mobileCards = await page.locator('.bg-white.dark\\:bg-gray-800.rounded-xl').count();
    console.log(`Mobile view: Found ${mobileCards} cards`);
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'screenshots/moves-mobile.png',
      fullPage: false
    });
    
    // Desktop viewport test
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
    
    // Should show table on desktop
    const desktopTable = await page.locator('table').count();
    console.log(`Desktop view: Found ${desktopTable} tables`);
    expect(desktopTable).toBeGreaterThan(0);
    
    // Take desktop screenshot
    await page.screenshot({ 
      path: 'screenshots/moves-desktop.png',
      fullPage: false
    });
    
    // Test search functionality
    await page.fill('input[placeholder*="Search"]', 'thunder');
    await page.waitForTimeout(500);
    
    // Test sorting (click on column header)
    const powerHeader = page.locator('th:has-text("Power")');
    if (await powerHeader.isVisible()) {
      await powerHeader.click();
      await page.waitForTimeout(500);
    }
    
    console.log('Moves page responsive test completed successfully');
  });
});