import { test, expect } from '@playwright/test';

test.describe('Navigation Click Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('Card clicks should navigate to detail pages', async ({ page }) => {
    // Go to a page with cards
    await page.goto('http://localhost:3001/pokedex');
    
    // Wait for cards to load
    await page.waitForSelector('[data-testid="pokemon-card"], .pokemon-card, [class*="card"]', { 
      timeout: 10000 
    });
    
    // Get the first card's link
    const firstCard = await page.locator('[data-testid="pokemon-card"], .pokemon-card, [class*="card"]').first();
    
    // Get the href attribute if it exists
    const href = await firstCard.getAttribute('href').catch(() => null);
    
    // Click the card
    await firstCard.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify we're on a different page
    const newUrl = page.url();
    expect(newUrl).not.toBe('http://localhost:3001/pokedex');
    
    // Verify we're on a detail page (should contain /pokedex/ followed by an ID)
    expect(newUrl).toMatch(/\/pokedex\/\d+/);
  });

  test('Pokemon list navigation should work', async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex');
    
    // Wait for Pokemon cards to load
    await page.waitForSelector('a[href*="/pokedex/"]', { timeout: 10000 });
    
    // Get the first Pokemon link
    const pokemonLink = await page.locator('a[href*="/pokedex/"]').first();
    const expectedHref = await pokemonLink.getAttribute('href');
    
    // Click the link
    await pokemonLink.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify navigation occurred
    const currentPath = new URL(page.url()).pathname;
    expect(currentPath).toBe(expectedHref);
  });

  test('TCG card navigation should work', async ({ page }) => {
    await page.goto('http://localhost:3001/tcg-sets');
    
    // Wait for set cards to load
    await page.waitForSelector('a[href*="/tcgsets/"], [class*="set-card"]', { 
      timeout: 10000 
    });
    
    // Get the first set card
    const setCard = await page.locator('a[href*="/tcgsets/"], [class*="set-card"]').first();
    
    // Click the card
    await setCard.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify we navigated to a set detail page
    const newUrl = page.url();
    expect(newUrl).toMatch(/\/tcgsets\/.+/);
  });

  test('Navigation should update URL and load new content', async ({ page }) => {
    // Start on home page
    await page.goto('http://localhost:3001');
    
    // Navigate to Pokedex
    await page.click('a[href="/pokedex"]');
    await page.waitForLoadState('networkidle');
    
    // Verify URL changed
    expect(page.url()).toBe('http://localhost:3001/pokedex');
    
    // Verify new content loaded
    const pageTitle = await page.textContent('h1, h2, [class*="title"]');
    expect(pageTitle?.toLowerCase()).toContain('pok');
  });

  test('Back navigation should work after clicking cards', async ({ page }) => {
    // Go to pokedex
    await page.goto('http://localhost:3001/pokedex');
    const initialUrl = page.url();
    
    // Wait for and click a Pokemon card
    await page.waitForSelector('a[href*="/pokedex/"]', { timeout: 10000 });
    await page.locator('a[href*="/pokedex/"]').first().click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    const detailUrl = page.url();
    
    // Verify we navigated
    expect(detailUrl).not.toBe(initialUrl);
    
    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on the list page
    expect(page.url()).toBe(initialUrl);
  });

  test('Custom onClick handlers should still work', async ({ page }) => {
    // This test verifies that cards with custom onClick handlers
    // (like modals, tooltips) still function correctly
    
    await page.goto('http://localhost:3001/favorites');
    
    // Look for cards with action buttons (like remove from favorites)
    const hasActionButtons = await page.locator('button[aria-label*="remove"], button[aria-label*="delete"]').count();
    
    if (hasActionButtons > 0) {
      // Click an action button
      await page.locator('button[aria-label*="remove"], button[aria-label*="delete"]').first().click();
      
      // Verify the action occurred (item removed or modal appeared)
      // This would depend on your specific implementation
      await page.waitForTimeout(500); // Small delay to allow for state update
      
      // Check that we're still on the same page (no navigation occurred)
      expect(page.url()).toBe('http://localhost:3001/favorites');
    }
  });
});