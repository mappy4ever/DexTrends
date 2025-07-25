import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle } from '../helpers/test-utils';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';

test.describe('Pokemon Moves Database', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
    await page.goto('/pokemon/moves');
    await waitForNetworkIdle(page);
  });

  test('should load moves page', async ({ page, consoleLogger }) => {
    // Check page title
    await expect(page).toHaveTitle(/Moves|Pokemon Moves|DexTrends/);
    
    // Check main heading
    await expect(page.locator('h1:has-text("Moves")').or(page.locator('[data-testid="moves-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display moves list', async ({ page }) => {
    await pageHelpers.waitForLoadingComplete();
    
    // Should show moves (look for move headings)
    const moves = page.locator('h3.text-xl.font-bold.capitalize').or(page.locator('[data-testid="move-entry"]'));
    expect(await moves.count()).toBeGreaterThan(0);
    
    // Common moves should be visible
    const commonMoves = ['Tackle', 'Thunder Bolt', 'Flamethrower', 'Surf', 'Earthquake'];
    
    let foundMoves = 0;
    for (const move of commonMoves) {
      if (await page.locator(`text=/${move}/i`).count() > 0) {
        foundMoves++;
      }
    }
    expect(foundMoves).toBeGreaterThan(2);
  });

  test('should display move details', async ({ page }) => {
    const firstMove = page.locator('[data-testid="move-entry"]').first();
    
    if (await firstMove.isVisible()) {
      // Should show move information
      const moveName = firstMove.locator('[data-testid="move-name"]').or(page.locator('.move-name'));
      const moveType = firstMove.locator('[data-testid="move-type"]').or(page.locator('.type-badge'));
      const movePower = firstMove.locator('[data-testid="move-power"]').or(page.locator('.power'));
      const moveAccuracy = firstMove.locator('[data-testid="move-accuracy"]').or(page.locator('.accuracy'));
      
      await expect(moveName).toBeVisible();
      await expect(moveType).toBeVisible();
      
      // Power and accuracy should be numbers or "-"
      if (await movePower.isVisible()) {
        const power = await movePower.textContent();
        expect(power).toMatch(/\d+|-/);
      }
      
      if (await moveAccuracy.isVisible()) {
        const accuracy = await moveAccuracy.textContent();
        expect(accuracy).toMatch(/\d+%?|-/);
      }
    }
  });

  test('should filter moves by type', async ({ page, consoleLogger }) => {
    // Look for type filter
    const typeFilter = page.locator('select[name*="type"]').or(page.locator('[data-testid="type-filter"]')).first();
    
    if (await typeFilter.isVisible()) {
      // Filter by Electric type
      await pageHelpers.filterByType('Electric');
      await page.waitForTimeout(1000);
      
      // Should show electric moves
      await expect(page.locator('text=/Thunder|Electric|Spark/i')).toBeVisible();
      
      // Type badges should show Electric
      const typeBadges = page.locator('[data-testid="move-type"]:visible');
      const firstType = await typeBadges.first().textContent();
      expect(firstType).toMatch(/Electric/i);
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should filter moves by category', async ({ page }) => {
    // Look for category filter (Physical/Special/Status)
    const categoryFilter = page.locator('select[name*="category"]').or(page.locator('[data-testid="category-filter"]')).first();
    
    if (await categoryFilter.isVisible()) {
      // Filter by Physical
      if (await categoryFilter.evaluate(el => el.tagName === 'SELECT')) {
        await categoryFilter.selectOption('physical');
      } else {
        await categoryFilter.click();
        await page.locator('button:has-text("Physical")').click();
      }
      
      await page.waitForTimeout(1000);
      
      // Should show physical moves
      const categories = page.locator('[data-testid="move-category"]:visible');
      if (await categories.count() > 0) {
        const firstCategory = await categories.first().textContent();
        expect(firstCategory).toMatch(/Physical/i);
      }
    }
  });

  test('should search for moves', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"]').or(page.locator('[data-testid="move-search"]')).first();
    
    if (await searchInput.isVisible()) {
      // Search for specific move
      await searchInput.fill('Hyper Beam');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should show Hyper Beam
      await expect(page.locator('text=/Hyper Beam/i')).toBeVisible();
      
      // Should filter other moves
      const visibleMoves = await page.locator('[data-testid="move-entry"]:visible').count();
      expect(visibleMoves).toBeLessThan(5);
    }
  });

  test('should display move effects', async ({ page }) => {
    const moves = page.locator('[data-testid="move-entry"]');
    
    if (await moves.count() > 0) {
      // Find a move with special effect
      const statusMove = moves.filter({ hasText: /Sleep|Paralyze|Burn|Freeze/i }).first();
      
      if (await statusMove.isVisible()) {
        const effectText = statusMove.locator('[data-testid="move-effect"]').or(page.locator('.effect-description'));
        await expect(effectText).toBeVisible();
        
        // Effect should describe the status
        const effect = await effectText.textContent();
        expect(effect?.length).toBeGreaterThan(10);
      }
    }
  });

  test('should show PP information', async ({ page }) => {
    const moveEntries = page.locator('[data-testid="move-entry"]');
    
    if (await moveEntries.count() > 0) {
      // Look for PP info
      const ppInfo = page.locator('[data-testid="move-pp"]').or(page.locator('.pp-count')).first();
      
      if (await ppInfo.isVisible()) {
        const ppText = await ppInfo.textContent();
        expect(ppText).toMatch(/\d+/); // Should be a number
      }
    }
  });

  test('should display priority moves', async ({ page, consoleLogger }) => {
    // Search for priority moves
    const searchInput = page.locator('[data-testid="move-search"]').or(page.locator('input[type="search"]')).first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Quick Attack');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should show priority indicator
      const priorityBadge = page.locator('[data-testid="move-priority"]').or(page.locator('.priority-badge')).or(page.locator('text=/priority/i'));
      
      if (await priorityBadge.count() > 0) {
        await expect(priorityBadge.first()).toBeVisible();
      }
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should show Pokemon that learn each move', async ({ page }) => {
    // Click on a move
    const move = page.locator('[data-testid="move-entry"]').first();
    
    if (await move.isVisible()) {
      await move.click();
      
      // Should show Pokemon that can learn this move
      const pokemonSection = page.locator('[data-testid="move-pokemon"]').or(page.locator('.pokemon-learn-list'));
      if (await pokemonSection.isVisible()) {
        const pokemonList = await page.locator('[data-testid="pokemon-item"]').or(page.locator('.pokemon-link')).count();
        expect(pokemonList).toBeGreaterThan(0);
        
        // Should show learn method
        const learnMethod = page.locator('[data-testid="learn-method"]').or(page.locator('text=/level|TM|egg|tutor/i')).first();
        await expect(learnMethod).toBeVisible();
      }
    }
  });

  test('should filter by generation', async ({ page }) => {
    // Look for generation filter
    const genFilter = page.locator('select[name*="generation"]').or(page.locator('[data-testid="generation-filter"]')).first();
    
    if (await genFilter.isVisible()) {
      // Filter by Gen 1
      if (await genFilter.evaluate(el => el.tagName === 'SELECT')) {
        await genFilter.selectOption('1');
      } else {
        await genFilter.click();
        await page.locator('button:has-text("Generation I")').click();
      }
      
      await page.waitForTimeout(1000);
      
      // Should show Gen 1 moves
      const moves = await page.locator('[data-testid="move-entry"]:visible').count();
      expect(moves).toBeGreaterThan(0);
      expect(moves).toBeLessThan(200); // Gen 1 had limited moves
    }
  });

  test('should display Z-Moves and Max Moves', async ({ page }) => {
    // Look for special move categories
    const specialMoveFilter = page.locator('button:has-text("Z-Moves")').or(page.locator('[data-testid="z-moves-filter"]')).first();
    
    if (await specialMoveFilter.isVisible()) {
      await specialMoveFilter.click();
      await page.waitForTimeout(1000);
      
      // Should show Z-Moves
      const zMoves = page.locator('[data-testid="z-move"]').or(page.locator('text=/Z-/i'));
      expect(await zMoves.count()).toBeGreaterThan(0);
    }
    
    // Check for Max Moves
    const maxMoveFilter = page.locator('button:has-text("Max Moves")').or(page.locator('[data-testid="max-moves-filter"]')).first();
    
    if (await maxMoveFilter.isVisible()) {
      await maxMoveFilter.click();
      await page.waitForTimeout(1000);
      
      // Should show Max Moves
      const maxMoves = page.locator('[data-testid="max-move"]').or(page.locator('text=/Max/i'));
      expect(await maxMoves.count()).toBeGreaterThan(0);
    }
  });

  test('should sort moves', async ({ page }) => {
    // Look for sort options
    const sortSelect = page.locator('select[name*="sort"]').or(page.locator('[data-testid="sort-moves"]')).first();
    
    if (await sortSelect.isVisible()) {
      // Get first move before sorting
      const firstBefore = await page.locator('[data-testid="move-name"]').first().textContent();
      
      // Sort by power
      if (await sortSelect.evaluate(el => el.tagName === 'SELECT')) {
        await sortSelect.selectOption('power');
      } else {
        await sortSelect.click();
        await page.locator('button:has-text("Power")').click();
      }
      
      await page.waitForTimeout(1000);
      
      // First move should change
      const firstAfter = await page.locator('[data-testid="move-name"]').first().textContent();
      expect(firstAfter).not.toBe(firstBefore);
    }
  });

  test('should display move animations', async ({ page }) => {
    // Look for animation preview
    const animationButton = page.locator('button:has-text("Preview")').or(page.locator('[data-testid="move-animation"]')).first();
    
    if (await animationButton.isVisible()) {
      await animationButton.click();
      
      // Should show animation or video
      const animation = page.locator('[data-testid="animation-preview"]').or(page.locator('video')).or(page.locator('.animation-container'));
      await expect(animation).toBeVisible({ timeout: 5000 });
    }
  });

  test('should work on mobile viewport', async ({ page, consoleLogger }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Main content visible
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Moves table should be scrollable
    const movesTable = page.locator('[data-testid="moves-table"]').or(page.locator('.moves-list'));
    if (await movesTable.isVisible()) {
      const tableStyle = await movesTable.evaluate(el => window.getComputedStyle(el));
      // Should have horizontal scroll on mobile
      expect(tableStyle.overflowX === 'auto' || tableStyle.overflowX === 'scroll').toBeTruthy();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });
});