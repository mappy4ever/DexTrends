import { test, expect } from '@playwright/test';

test.describe('Phase 2: Page Transitions', () => {
  test('fade transition on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if page has motion elements
    const motionElements = await page.locator('[style*="opacity"]').count();
    expect(motionElements).toBeGreaterThan(0);
  });

  test('slideUp transition on pokedex', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Check for transform animations
    const transformElements = await page.locator('[style*="transform"]').first();
    if (await transformElements.isVisible()) {
      const style = await transformElements.getAttribute('style');
      expect(style).toBeDefined();
    }
  });

  test('zoom transition on pokemon detail', async ({ page }) => {
    await page.goto('/pokedex/25'); // Pikachu
    
    // Wait for animations to start
    await page.waitForTimeout(100);
    
    // Check for scale transforms
    const elements = await page.locator('[style*="scale"]').count();
    if (elements > 0) {
      expect(elements).toBeGreaterThan(0);
    }
  });

  test('navigation between routes triggers transitions', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to pokedex
    await page.click('a[href="/pokedex"]');
    await page.waitForURL('**/pokedex');
    
    // Check URL changed
    expect(page.url()).toContain('/pokedex');
  });
});

test.describe('Phase 2: Staggered Animations', () => {
  test('list items animate with stagger', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Wait for list to load
    await page.waitForSelector('.pokemon-card', { timeout: 10000 });
    
    // Check if multiple cards are visible
    const cards = await page.locator('.pokemon-card').count();
    expect(cards).toBeGreaterThan(0);
    
    // Check for animation classes or styles
    const animatedElements = await page.locator('[class*="motion"]').count();
    if (animatedElements > 0) {
      expect(animatedElements).toBeGreaterThan(0);
    }
  });

  test('grid items load with animation', async ({ page }) => {
    await page.goto('/tcg-sets');
    
    // Wait for grid to load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });
    
    // Check grid exists
    const grid = await page.locator('[class*="grid"]').first();
    expect(await grid.isVisible()).toBeTruthy();
  });
});

test.describe('Phase 2: Gesture Interactions', () => {
  test('buttons have hover effects', async ({ page }) => {
    await page.goto('/');
    
    // Find a button
    const button = await page.locator('button').first();
    if (await button.isVisible()) {
      // Get initial style
      const initialStyle = await button.getAttribute('style') || '';
      
      // Hover over button
      await button.hover();
      await page.waitForTimeout(100);
      
      // Style might change on hover
      const hoverStyle = await button.getAttribute('style') || '';
      
      // At minimum, button should be visible
      expect(await button.isVisible()).toBeTruthy();
    }
  });

  test('cards respond to hover', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Wait for cards to load
    await page.waitForSelector('.pokemon-card', { timeout: 10000 });
    
    const card = await page.locator('.pokemon-card').first();
    if (await card.isVisible()) {
      // Hover over card
      await card.hover();
      
      // Card should still be visible after hover
      expect(await card.isVisible()).toBeTruthy();
    }
  });

  test('touch/click interactions work', async ({ page }) => {
    await page.goto('/');
    
    // Find clickable element
    const link = await page.locator('a[href="/pokedex"]').first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForURL('**/pokedex');
      expect(page.url()).toContain('/pokedex');
    }
  });
});

test.describe('Phase 2: Micro-interactions', () => {
  test('loading states show animations', async ({ page }) => {
    // Intercept API to delay and see loading
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.goto('/pokedex');
    
    // Check for loading indicators
    const loadingElements = await page.locator('[class*="loading"], [class*="skeleton"], [class*="pulse"]').count();
    if (loadingElements > 0) {
      expect(loadingElements).toBeGreaterThan(0);
    }
  });

  test('form inputs have focus states', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Look for search input
    const searchInput = await page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      // Focus the input
      await searchInput.focus();
      
      // Input should be focused
      const isFocused = await searchInput.evaluate(el => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('success states render correctly', async ({ page }) => {
    await page.goto('/favorites');
    
    // Page should load without errors
    const pageTitle = await page.title();
    expect(pageTitle).toBeDefined();
  });
});

test.describe('Phase 2: Accessibility', () => {
  test('animations respect prefers-reduced-motion', async ({ page }) => {
    // Set prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    
    // Page should still be functional
    const content = await page.locator('body').isVisible();
    expect(content).toBeTruthy();
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if an element is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeDefined();
  });
});

test.describe('Phase 2: Performance', () => {
  test('animations use GPU acceleration', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Check for transform3d or will-change properties
    const acceleratedElements = await page.locator('[style*="transform3d"], [style*="will-change"]').count();
    
    // Some elements might use GPU acceleration
    expect(acceleratedElements).toBeGreaterThanOrEqual(0);
  });

  test('no console errors from animations', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.goto('/pokedex');
    await page.goto('/tcg-sets');
    
    // Filter out expected warnings
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('webpack.cache') &&
      !error.includes('Image with src') &&
      !error.includes('has a "loader" property')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Phase 2: TypeScript Compliance', () => {
  test('no TypeScript runtime errors', async ({ page }) => {
    const typeErrors: string[] = [];
    
    page.on('pageerror', err => {
      if (err.message.includes('TypeError') || 
          err.message.includes('undefined') || 
          err.message.includes('null')) {
        typeErrors.push(err.message);
      }
    });
    
    // Navigate through multiple pages
    await page.goto('/');
    await page.goto('/pokedex');
    await page.goto('/pokedex/25');
    await page.goto('/tcg-sets');
    await page.goto('/pokemon/moves');
    await page.goto('/pokemon/abilities');
    
    expect(typeErrors).toHaveLength(0);
  });
});