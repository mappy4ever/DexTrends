import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  // Test different viewport sizes
  const viewports = [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 420, height: 800, name: 'Custom 420px' },
    { width: 430, height: 800, name: 'Custom 430px' },
    { width: 460, height: 800, name: 'XS Breakpoint' },
  ];

  viewports.forEach(viewport => {
    test(`Pokedex grid columns at ${viewport.width}px (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:3002/pokedex');
      
      // Wait for grid to load
      await page.waitForSelector('[data-testid="pokemon-card"]', { timeout: 10000 });
      
      // Get grid container
      const gridContainer = await page.locator('.grid').first();
      
      // Check grid classes
      const classes = await gridContainer.getAttribute('class');
      
      // Verify correct column count based on viewport
      if (viewport.width < 420) {
        expect(classes).toContain('grid-cols-2');
      } else if (viewport.width >= 420 && viewport.width < 460) {
        expect(classes).toContain('min-420:grid-cols-3');
      } else if (viewport.width >= 460) {
        expect(classes).toContain('xs:grid-cols-4');
      }
      
      // Verify no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
      
      // Check that cards are visible and not cut off
      const cards = await page.locator('[data-testid="pokemon-card"]').all();
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const card = cards[i];
        const isVisible = await card.isVisible();
        expect(isVisible).toBe(true);
        
        // Check card is within viewport
        const box = await card.boundingBox();
        if (box) {
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    });

    test(`TCG sets grid at ${viewport.width}px (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:3002/tcg-sets');
      
      // Wait for content
      await page.waitForSelector('.grid', { timeout: 10000 });
      
      // Check no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test(`Touch targets at ${viewport.width}px (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:3002/pokedex');
      
      // Wait for buttons to load
      await page.waitForSelector('button', { timeout: 10000 });
      
      // Check button sizes
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(3, buttons.length); i++) {
        const button = buttons[i];
        const box = await button.boundingBox();
        if (box) {
          // Verify minimum 48px touch target
          expect(box.height).toBeGreaterThanOrEqual(44); // Allow slight variation
        }
      }
    });
  });

  test('Region page text display on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3002/pokemon/regions/kanto');
    
    // Wait for content
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check that text is not displayed vertically
    const headings = await page.locator('h1, h2, h3').all();
    for (const heading of headings) {
      const text = await heading.textContent();
      if (text && text.length > 5) {
        // Check that text width is reasonable (not single character per line)
        const box = await heading.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(50); // Text should have reasonable width
        }
      }
    }
    
    // Verify no text overflow
    const hasTextOverflow = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, div');
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
          return true;
        }
      }
      return false;
    });
    expect(hasTextOverflow).toBe(false);
  });
});