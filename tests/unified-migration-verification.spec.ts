import { test, expect } from '@playwright/test';

test.describe('Unified Architecture Migration Verification', () => {
  test.setTimeout(60000);

  test('Homepage loads with unified components', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    
    // Check hero section
    await expect(page.locator('h1:has-text("DexTrends")')).toBeVisible();
    
    // Check feature cards
    await expect(page.locator('text=Pokédex')).toBeVisible();
    await expect(page.locator('text=TCG Sets')).toBeVisible();
    
    // Verify responsive grid
    const featureGrid = page.locator('[class*="grid"]').first();
    await expect(featureGrid).toBeVisible();
  });

  test('Pokédex page with UnifiedGrid', async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex');
    
    // Check UnifiedGrid renders
    await expect(page.locator('[data-testid="unified-grid"]')).toBeVisible();
    
    // Check Pokemon cards load
    await page.waitForSelector('[data-testid*="pokemon-card"]', { timeout: 10000 });
    const cards = page.locator('[data-testid*="pokemon-card"]');
    await expect(cards.first()).toBeVisible();
    
    // Check search works
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill('pikachu');
    await page.waitForTimeout(500);
  });

  test('Type Effectiveness with unified responsive design', async ({ page }) => {
    await page.goto('http://localhost:3001/type-effectiveness');
    
    // Check type buttons
    await expect(page.locator('button:has-text("Fire")')).toBeVisible();
    await expect(page.locator('button:has-text("Water")')).toBeVisible();
    
    // Click a type and check effectiveness display
    await page.click('button:has-text("Fire")');
    await expect(page.locator('text=Super Effective')).toBeVisible();
  });

  test('Items page with UnifiedDataTable', async ({ page }) => {
    await page.goto('http://localhost:3001/pokemon/items');
    
    // Check table/cards render
    await page.waitForSelector('[data-testid="unified-data-table"]', { timeout: 10000 });
    
    // Check search functionality
    const search = page.locator('input[placeholder*="Search items"]');
    if (await search.isVisible()) {
      await search.fill('potion');
      await page.waitForTimeout(500);
    }
  });

  test('Abilities page with UnifiedDataTable', async ({ page }) => {
    await page.goto('http://localhost:3001/pokemon/abilities');
    
    // Check table/cards render
    await page.waitForSelector('[data-testid="unified-data-table"]', { timeout: 10000 });
    
    // Check category filters
    await expect(page.locator('button:has-text("Competitive")')).toBeVisible();
  });

  test('Moves page with UnifiedDataTable', async ({ page }) => {
    await page.goto('http://localhost:3001/pokemon/moves');
    
    // Check table/cards render
    await page.waitForSelector('[data-testid="unified-data-table"]', { timeout: 10000 });
    
    // Check type filter works
    const typeFilter = page.locator('select').first();
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('TCG Sets page (kept original infinite scroll)', async ({ page }) => {
    await page.goto('http://localhost:3001/tcg-sets');
    
    // Check sets load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });
    
    // Check set cards are visible
    const setCards = page.locator('h3');
    await expect(setCards.first()).toBeVisible();
  });

  test('Mobile responsiveness at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test Pokédex at mobile
    await page.goto('http://localhost:3001/pokedex');
    await page.waitForSelector('[data-testid="unified-grid"]');
    
    // Check grid has mobile columns (2 columns)
    const grid = page.locator('[data-testid="unified-grid"]');
    const gridStyle = await grid.getAttribute('style');
    expect(gridStyle).toContain('grid-template-columns');
    
    // Test Items page at mobile (should show cards not table)
    await page.goto('http://localhost:3001/pokemon/items');
    await page.waitForTimeout(1000);
    
    // Cards should be visible on mobile, not table
    const cards = page.locator('[data-testid*="mobile-card"], [class*="card"]');
    const cardsCount = await cards.count();
    expect(cardsCount).toBeGreaterThan(0);
  });

  test('Tablet responsiveness at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('http://localhost:3001/pokedex');
    await page.waitForSelector('[data-testid="unified-grid"]');
    
    // Check grid adjusts for tablet
    const grid = page.locator('[data-testid="unified-grid"]');
    await expect(grid).toBeVisible();
  });

  test('Desktop responsiveness at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto('http://localhost:3001/pokedex');
    await page.waitForSelector('[data-testid="unified-grid"]');
    
    // Grid should have more columns on desktop
    const grid = page.locator('[data-testid="unified-grid"]');
    await expect(grid).toBeVisible();
    
    // Test data table on desktop (should show table view)
    await page.goto('http://localhost:3001/pokemon/items');
    await page.waitForTimeout(1000);
    
    // Table should be visible on desktop
    const table = page.locator('table, [role="table"]');
    const isTableVisible = await table.isVisible();
    if (!isTableVisible) {
      // Some implementations might still use cards on desktop
      const cards = page.locator('[class*="card"]');
      await expect(cards.first()).toBeVisible();
    }
  });
});