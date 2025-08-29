import { test, expect, devices } from '@playwright/test';

// Test different iPhone sizes
const mobileDevices = [
  { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
  { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
  { name: 'iPhone 14 Pro', viewport: { width: 393, height: 852 } },
  { name: 'iPhone 14 Plus', viewport: { width: 428, height: 926 } },
  { name: 'iPhone 14 Pro Max', viewport: { width: 430, height: 932 } }
];

test.describe('Mobile Homepage Implementation', () => {
  for (const device of mobileDevices) {
    test(`works on ${device.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: device.viewport,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      const page = await context.newPage();
      
      await page.goto('http://localhost:3001');
      
      // Wait for mobile layout to render
      await page.waitForSelector('.mobile-layout', { timeout: 5000 });
      
      // Check mobile-specific elements exist
      await expect(page.locator('.mobile-container')).toBeVisible();
      // Check at least one mobile section exists
      const mobileSections = await page.locator('.mobile-section').count();
      expect(mobileSections).toBeGreaterThan(0);
      
      // Check that desktop layout is NOT visible
      const desktopElements = await page.$$('.container.mx-auto.px-4.sm\\:px-6');
      expect(desktopElements.length).toBe(0);
      
      // Test search button
      const searchButton = page.locator('button:has-text("Search everything")');
      await expect(searchButton).toBeVisible();
      await searchButton.click();
      
      // Check mobile search experience opens
      await expect(page.locator('text="Search Pokémon, cards, moves..."')).toBeVisible({ timeout: 5000 });
      
      // Close search
      const closeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await closeButton.click();
      
      // Check stats grid (should be 2x2)
      const statsGrid = page.locator('.grid.grid-cols-2.gap-3');
      await expect(statsGrid).toBeVisible();
      const statCards = await statsGrid.locator('> div').count();
      expect(statCards).toBe(4);
      
      // Check feature cards are vertical
      const featureSection = page.locator('.mobile-section:has-text("Explore")');
      await expect(featureSection).toBeVisible();
      const featureCards = await featureSection.locator('.space-y-4 > a').count();
      expect(featureCards).toBeGreaterThan(0);
      
      // Check quick access grid (should be 2 columns)
      const quickAccess = page.locator('.mobile-section:has-text("Quick Access")');
      await expect(quickAccess).toBeVisible();
      const quickGrid = quickAccess.locator('.grid.grid-cols-2');
      await expect(quickGrid).toBeVisible();
      
      await context.close();
    });
  }

  test('mobile detection works correctly', async ({ page }) => {
    // Test desktop first
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3001');
    
    // Should show desktop layout
    await expect(page.locator('.container.mx-auto')).toBeVisible();
    const mobileLayout = await page.$$('.mobile-layout');
    expect(mobileLayout.length).toBe(0);
    
    // Switch to mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    
    // Should show mobile layout
    await expect(page.locator('.mobile-layout')).toBeVisible();
  });

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001');
    
    // Check viewport width matches body width
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('text is readable without zooming', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001');
    
    // Check font sizes are appropriate
    const title = page.locator('h1:has-text("Everything Pokémon")');
    const fontSize = await title.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Should be at least 16px (1rem)
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
  });

  test('touch targets are large enough', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3001');
    
    // Check button heights
    const buttons = page.locator('button, a[href]');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        // Minimum 44px for Apple, we use 48px
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('Region Pages Mobile Fix', () => {
  test('text displays horizontally on region pages', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3001/pokemon/regions/kanto');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for any vertical text
    const elements = await page.$$('*');
    for (const element of elements.slice(0, 50)) { // Check first 50 elements
      const writingMode = await element.evaluate(el => 
        window.getComputedStyle(el).writingMode
      );
      expect(writingMode).not.toContain('vertical');
    }
  });
});