import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle, waitForImages } from '../helpers/test-utils';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';

test.describe('Pokemon Items Database', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
    await page.goto('/pokemon/items');
    await waitForNetworkIdle(page);
  });

  test('should load items page', async ({ page, consoleLogger }) => {
    // Check page title
    await expect(page).toHaveTitle(/Items|Pokemon Items|DexTrends/);
    
    // Check main heading
    await expect(page.locator('h1:has-text("Items")').or(page.locator('[data-testid="items-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display items list', async ({ page }) => {
    await pageHelpers.waitForLoadingComplete();
    
    // Should show items (look for item headings)
    const items = page.locator('h3.text-xl.font-bold.capitalize').or(page.locator('[data-testid="item-entry"]'));
    expect(await items.count()).toBeGreaterThan(0);
    
    // Common items should be visible (check actual displayed names)
    const commonItems = ['potion', 'ball', 'rare candy', 'revive', 'master'];
    
    let foundItems = 0;
    for (const item of commonItems) {
      if (await page.locator(`text=/${item}/i`).count() > 0) {
        foundItems++;
      }
    }
    expect(foundItems).toBeGreaterThanOrEqual(2);
  });

  test('should display item details', async ({ page }) => {
    const firstItem = page.locator('[data-testid="item-entry"]').first();
    
    if (await firstItem.isVisible()) {
      // Should show item info
      const itemName = firstItem.locator('[data-testid="item-name"]').or(firstItem.locator('.item-name'));
      const itemDesc = firstItem.locator('[data-testid="item-description"]').or(firstItem.locator('.item-desc'));
      const itemSprite = firstItem.locator('[data-testid="item-sprite"]').or(firstItem.locator('img'));
      
      await expect(itemName).toBeVisible();
      await expect(itemDesc).toBeVisible();
      await expect(itemSprite).toBeVisible();
      
      // Wait for sprites to load
      await waitForImages(page);
    }
  });

  test('should filter items by category', async ({ page, consoleLogger }) => {
    // Look for category filter
    const categoryFilter = page.locator('select[name*="category"]').or(page.locator('[data-testid="category-filter"]')).first();
    
    if (await categoryFilter.isVisible()) {
      // Select healing items
      if (await categoryFilter.evaluate(el => el.tagName === 'SELECT')) {
        await categoryFilter.selectOption('healing');
      } else {
        await categoryFilter.click();
        await page.locator('button:has-text("Healing")').or(page.locator('[data-value="healing"]')).click();
      }
      
      await page.waitForTimeout(1000);
      
      // Should show healing items
      await expect(page.locator('text=/Potion|Restore|Heal/i')).toBeVisible();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should search for items', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"]').or(page.locator('[data-testid="item-search"]')).first();
    
    if (await searchInput.isVisible()) {
      // Search for specific item
      await searchInput.fill('Master Ball');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should show Master Ball
      await expect(page.locator('text=/Master Ball/i')).toBeVisible();
      
      // Other items should be filtered out
      const visibleItems = await page.locator('[data-testid="item-entry"]:visible').count();
      expect(visibleItems).toBeLessThan(5);
    }
  });

  test('should display item effects', async ({ page }) => {
    // Look for items with battle effects
    const battleItem = page.locator('[data-testid="item-entry"]:has-text("X Attack")').first();
    
    if (await battleItem.isVisible()) {
      // Should show effect description
      const effectText = battleItem.locator('[data-testid="item-effect"]').or(page.locator('.item-effect'));
      await expect(effectText).toBeVisible();
      
      // Effect should mention stat boost
      const effect = await effectText.textContent();
      expect(effect).toMatch(/attack|boost|increase/i);
    }
  });

  test('should show item prices', async ({ page }) => {
    const itemsWithPrice = page.locator('[data-testid="item-price"]').or(page.locator('.item-price'));
    
    if (await itemsWithPrice.count() > 0) {
      const firstPrice = itemsWithPrice.first();
      await expect(firstPrice).toBeVisible();
      
      // Price should be a number
      const priceText = await firstPrice.textContent();
      expect(priceText).toMatch(/\d+|₽|¥|\$/);
    }
  });

  test('should categorize items by pocket', async ({ page }) => {
    // Look for pocket/bag categories
    const pocketTabs = page.locator('[data-testid="pocket-tab"]').or(page.locator('.pocket-category'));
    
    if (await pocketTabs.count() > 0) {
      // Should have different pockets
      const pockets = ['Items', 'Medicine', 'Poke Balls', 'TMs', 'Berries', 'Key Items'];
      
      for (const pocket of pockets.slice(0, 3)) {
        const tab = page.locator(`text=/${pocket}/i`);
        if (await tab.count() > 0) {
          await tab.first().click();
          await page.waitForTimeout(1000);
          
          // Should filter items by pocket
          const items = await page.locator('[data-testid="item-entry"]:visible').count();
          expect(items).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should display held item effects', async ({ page, consoleLogger }) => {
    // Look for held items section
    const heldItemsFilter = page.locator('button:has-text("Held Items")').or(page.locator('[data-testid="held-items-filter"]')).first();
    
    if (await heldItemsFilter.isVisible()) {
      await heldItemsFilter.click();
      await page.waitForTimeout(1000);
      
      // Should show items that can be held
      const heldItems = page.locator('[data-testid="held-item"]').or(page.locator('.held-item-indicator'));
      expect(await heldItems.count()).toBeGreaterThan(0);
      
      // Should describe held effects
      const effectDesc = page.locator('[data-testid="held-effect"]').or(page.locator('text=/when held/i')).first();
      await expect(effectDesc).toBeVisible();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should show evolution items', async ({ page }) => {
    // Filter or search for evolution items
    const searchInput = page.locator('[data-testid="item-search"]').or(page.locator('input[type="search"]')).first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Stone');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should show evolution stones
      const stones = ['Fire Stone', 'Water Stone', 'Thunder Stone'];
      let stonesFound = 0;
      
      for (const stone of stones) {
        if (await page.locator(`text=/${stone}/i`).count() > 0) {
          stonesFound++;
        }
      }
      expect(stonesFound).toBeGreaterThan(0);
    }
  });

  test('should display berry information', async ({ page }) => {
    // Look for berries category
    const berryFilter = page.locator('button:has-text("Berries")').or(page.locator('[data-value="berries"]')).first();
    
    if (await berryFilter.isVisible()) {
      await berryFilter.click();
      await page.waitForTimeout(1000);
      
      // Should show berries
      const berries = page.locator('[data-testid="item-entry"]:has-text("Berry")');
      expect(await berries.count()).toBeGreaterThan(0);
      
      // Berries should have specific info
      const berryEffect = page.locator('text=/restore|cure|heal/i').first();
      await expect(berryEffect).toBeVisible();
    }
  });

  test('should show TMs and HMs', async ({ page }) => {
    // Look for TM category
    const tmFilter = page.locator('button:has-text("TMs")').or(page.locator('[data-value="machines"]')).first();
    
    if (await tmFilter.isVisible()) {
      await tmFilter.click();
      await page.waitForTimeout(1000);
      
      // Should show TMs
      await expect(page.locator('text=/TM\d+|HM\d+/i')).toBeVisible();
      
      // TMs should show move info
      const moveInfo = page.locator('[data-testid="tm-move"]').or(page.locator('.tm-move-name')).first();
      if (await moveInfo.isVisible()) {
        const moveName = await moveInfo.textContent();
        expect(moveName).toBeTruthy();
      }
    }
  });

  test('should display generation introduced', async ({ page }) => {
    const items = page.locator('[data-testid="item-entry"]');
    
    if (await items.count() > 0) {
      // Look for generation badges
      const genBadge = page.locator('[data-testid="item-generation"]').or(page.locator('.generation-badge')).first();
      
      if (await genBadge.isVisible()) {
        const genText = await genBadge.textContent();
        expect(genText).toMatch(/Gen|Generation|[IVX]+/);
      }
    }
  });

  test('should paginate items list', async ({ page }) => {
    // Look for pagination
    const pagination = page.locator('[data-testid="pagination"]').or(page.locator('.pagination'));
    
    if (await pagination.isVisible()) {
      // Click next page
      const nextButton = page.locator('button:has-text("Next")').or(page.locator('[data-testid="next-page"]')).first();
      
      if (await nextButton.isEnabled()) {
        const firstItemBefore = await page.locator('[data-testid="item-name"]').first().textContent();
        
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        const firstItemAfter = await page.locator('[data-testid="item-name"]').first().textContent();
        expect(firstItemAfter).not.toBe(firstItemBefore);
      }
    }
  });

  test('should work on mobile viewport', async ({ page, consoleLogger }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Main content visible
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Items should be in mobile layout
    const itemGrid = page.locator('[data-testid="items-grid"]').or(page.locator('.items-container'));
    if (await itemGrid.isVisible()) {
      // Check responsive layout
      const gridStyle = await itemGrid.evaluate(el => window.getComputedStyle(el));
      expect(gridStyle).toBeTruthy();
    }
    
    // Item sprites should be appropriately sized
    const sprite = page.locator('[data-testid="item-sprite"]').first();
    if (await sprite.isVisible()) {
      const size = await sprite.boundingBox();
      expect(size?.width).toBeLessThan(100);
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });
});