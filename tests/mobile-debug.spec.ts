import { test, expect } from '@playwright/test';

test.describe('Mobile Debug', () => {
  test('Check mobile at 430px breakpoint', async ({ page }) => {
    // Set viewport to iPhone 16 Pro Max width
    await page.setViewportSize({ width: 430, height: 932 });
    
    // Navigate to Pokedex page
    await page.goto('http://localhost:3001/pokedex');
    
    // Wait for any content to load
    await page.waitForTimeout(2000);
    
    // Debug: Check window.innerWidth
    const innerWidth = await page.evaluate(() => window.innerWidth);
    console.log('Window innerWidth:', innerWidth);
    
    // Check if the condition for mobile is met
    const shouldBeMobile = innerWidth < 430;
    console.log('Should render mobile (< 430):', shouldBeMobile);
    
    // Debug: Check what major containers exist
    const hasMobileLayout = await page.locator('.mobile-layout').count();
    const hasMobilePokedex = await page.locator('.mobile-pokedex').count();
    const hasDesktopLayout = await page.locator('.max-w-7xl').count();
    
    console.log('Has .mobile-layout:', hasMobileLayout);
    console.log('Has .mobile-pokedex:', hasMobilePokedex);
    console.log('Has desktop layout (.max-w-7xl):', hasDesktopLayout);
    
    // Debug: Get all class names on body
    const bodyClasses = await page.locator('body').getAttribute('class');
    console.log('Body classes:', bodyClasses);
    
    // Debug: Check viewport size
    const viewportSize = page.viewportSize();
    console.log('Viewport size:', viewportSize);
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'mobile-debug-pokedex-430px.png' });
    
    // The test should find the mobile layout
    expect(hasMobileLayout).toBeGreaterThan(0);
  });
});