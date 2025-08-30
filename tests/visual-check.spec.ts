import { test, expect } from '@playwright/test';

test.describe('Visual Check - Unified Pokédex', () => {
  test('capture screenshots at different viewports', async ({ page }) => {
    // Navigate to new unified Pokédex
    await page.goto('/pokedex-new');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="unified-grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000); // Let images load
    
    // Mobile viewport (iPhone 12)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/pokedex-mobile.png', 
      fullPage: false 
    });
    
    // Tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/pokedex-tablet.png', 
      fullPage: false 
    });
    
    // Desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/pokedex-desktop.png', 
      fullPage: false 
    });
    
    // Wide desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/pokedex-wide.png', 
      fullPage: false 
    });
    
    console.log('Screenshots saved to screenshots/ directory');
  });
});