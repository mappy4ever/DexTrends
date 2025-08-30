import { test, expect } from '@playwright/test';

test.describe('Unified Homepage', () => {
  test('responsive layout test - all viewports', async ({ page }) => {
    // Navigate to unified homepage
    await page.goto('/index-unified');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Mobile viewport (iPhone 12)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    
    // Check mobile-specific elements
    const mobileSearchButton = await page.locator('button:has-text("Search everything")').count();
    console.log(`Mobile: Search button visible = ${mobileSearchButton > 0}`);
    
    // Check feature cards are in mobile layout (horizontal)
    const mobileCards = await page.locator('.flex.sm\\:flex-col').count();
    console.log(`Mobile: Found ${mobileCards} responsive cards`);
    
    await page.screenshot({ 
      path: 'screenshots/homepage-mobile.png',
      fullPage: false
    });
    
    // Tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Check tablet layout (2 columns)
    const tabletGrid = await page.locator('.grid.grid-cols-1.sm\\:grid-cols-2').count();
    console.log(`Tablet: Grid layout visible = ${tabletGrid > 0}`);
    
    await page.screenshot({ 
      path: 'screenshots/homepage-tablet.png',
      fullPage: false
    });
    
    // Desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
    
    // Check desktop-specific elements
    const desktopSearch = await page.locator('.hidden.sm\\:block').count();
    console.log(`Desktop: Search bar visible = ${desktopSearch > 0}`);
    
    // Check 4-column grid on desktop
    const desktopGrid = await page.locator('.lg\\:grid-cols-4').count();
    console.log(`Desktop: 4-column grid = ${desktopGrid > 0}`);
    
    await page.screenshot({ 
      path: 'screenshots/homepage-desktop.png',
      fullPage: false
    });
    
    // Test interactions
    // Click on a feature card
    const pokedexCard = page.locator('h3:has-text("Pokédex")').locator('..');
    if (await pokedexCard.isVisible()) {
      await pokedexCard.click();
      await page.waitForTimeout(500);
      const url = page.url();
      console.log(`Navigation test: Clicked Pokédex, URL = ${url}`);
    }
    
    console.log('Homepage responsive test completed successfully');
  });
});