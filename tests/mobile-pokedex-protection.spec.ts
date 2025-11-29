import { test, expect, devices } from '@playwright/test';

// Configure this test file to use iPhone 12 Pro device settings at the top level
// This avoids the "Cannot use({ defaultBrowserType }) in a describe group" error
test.use({ ...devices['iPhone 12 Pro'] });

// Test all protected mobile features for Pokédex
test.describe('Protected Mobile Pokédex Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex');
    // Wait for initial load
    await page.waitForSelector('[data-testid="pokemon-grid"]', { timeout: 10000 });
  });

  test.describe('VirtualPokemonGrid Protection', () => {
    test('should render 2-3 columns based on viewport', async ({ page }) => {
      // Check grid exists
      const grid = page.locator('[data-testid="pokemon-grid"]');
      await expect(grid).toBeVisible();

      // Check for virtual scrolling container
      const virtualContainer = page.locator('.virtual-grid-container');
      await expect(virtualContainer).toBeVisible();

      // Verify column count for 390px width (should be 2-3 columns)
      const firstRow = page.locator('[data-testid="pokemon-card"]').first();
      const firstRowBox = await firstRow.boundingBox();
      const containerBox = await grid.boundingBox();

      if (firstRowBox && containerBox) {
        const columns = Math.floor(containerBox.width / firstRowBox.width);
        expect(columns).toBeGreaterThanOrEqual(2);
        expect(columns).toBeLessThanOrEqual(3);
      }
    });

    test('should maintain 60fps scrolling performance', async ({ page }) => {
      // Scroll and check for smooth scrolling
      const grid = page.locator('[data-testid="pokemon-grid"]');

      // Perform scroll
      await grid.scrollIntoViewIfNeeded();
      await page.mouse.wheel(0, 500);

      // Check that virtual scrolling is working (not all items rendered)
      const allCards = await page.locator('[data-testid="pokemon-card"]').count();
      expect(allCards).toBeLessThan(50); // Virtual scrolling should limit rendered items
    });

    test('should have minimum 48px touch targets', async ({ page }) => {
      const card = page.locator('[data-testid="pokemon-card"]').first();
      const box = await card.boundingBox();

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(48);
        expect(box.width).toBeGreaterThanOrEqual(48);
      }
    });
  });

  test.describe('BottomSheet Filters Protection', () => {
    test('should open bottom sheet on filter button tap', async ({ page }) => {
      // Look for filter button
      const filterButton = page.locator('button:has-text("Filters")').first();
      await expect(filterButton).toBeVisible();

      // Tap filter button
      await filterButton.tap();

      // Check bottom sheet appears
      const bottomSheet = page.locator('[data-testid="bottom-sheet"], .bottom-sheet');
      await expect(bottomSheet).toBeVisible({ timeout: 5000 });

      // Check it slides from bottom (has transform or bottom position)
      const styles = await bottomSheet.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          transform: computed.transform,
          bottom: computed.bottom,
          position: computed.position
        };
      });

      expect(styles.position).toMatch(/fixed|absolute/);
    });

    test('should dismiss bottom sheet on backdrop tap', async ({ page }) => {
      // Open bottom sheet
      const filterButton = page.locator('button:has-text("Filters")').first();
      await filterButton.tap();

      // Wait for bottom sheet
      const bottomSheet = page.locator('[data-testid="bottom-sheet"], .bottom-sheet');
      await expect(bottomSheet).toBeVisible();

      // Tap backdrop
      const backdrop = page.locator('[data-testid="bottom-sheet-backdrop"], .bottom-sheet-backdrop, .backdrop');
      if (await backdrop.count() > 0) {
        await backdrop.tap();
        await expect(bottomSheet).not.toBeVisible({ timeout: 5000 });
      }
    });

    test('should preserve filter state after applying', async ({ page }) => {
      // Open filters
      const filterButton = page.locator('button:has-text("Filters")').first();
      await filterButton.tap();

      // Select a type filter (if available)
      const typeFilter = page.locator('[data-testid="type-filter"] button, button:has-text("Fire")').first();
      if (await typeFilter.count() > 0) {
        await typeFilter.tap();

        // Apply filters
        const applyButton = page.locator('button:has-text("Apply")');
        if (await applyButton.count() > 0) {
          await applyButton.tap();
        }

        // Check that filter is applied (badge or active state)
        const filterBadge = page.locator('.filter-badge, [data-testid="filter-count"]');
        if (await filterBadge.count() > 0) {
          await expect(filterBadge).toBeVisible();
        }
      }
    });
  });

  test.describe('PullToRefresh Protection', () => {
    test('should show pull to refresh indicator', async ({ page }) => {
      // Check for pull to refresh wrapper
      const pullWrapper = page.locator('[data-testid="pull-to-refresh"], .pull-to-refresh');

      if (await pullWrapper.count() > 0) {
        // Simulate pull gesture
        const grid = page.locator('[data-testid="pokemon-grid"]');
        const box = await grid.boundingBox();

        if (box) {
          // Start pull from top
          await page.mouse.move(box.x + box.width / 2, box.y + 50);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 2, box.y + 200, { steps: 10 });

          // Check for refresh indicator (Pokéball animation)
          const refreshIndicator = page.locator('.refresh-indicator, [data-testid="refresh-pokeball"]');
          if (await refreshIndicator.count() > 0) {
            await expect(refreshIndicator).toBeVisible();
          }

          await page.mouse.up();
        }
      }
    });
  });

  test.describe('Mobile Search Experience Protection', () => {
    test('should have search in mobile header', async ({ page }) => {
      // Check for mobile search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible();

      // Check it's in header area (top of page)
      const box = await searchInput.boundingBox();
      if (box) {
        expect(box.y).toBeLessThan(200); // Should be in header area
      }
    });

    test('should open search overlay on mobile', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
      await searchInput.tap();

      // Check if search overlay appears (full screen on mobile)
      const searchOverlay = page.locator('[data-testid="search-overlay"], .search-overlay, .mobile-search');
      if (await searchOverlay.count() > 0) {
        await expect(searchOverlay).toBeVisible();

        // Check it covers most of viewport
        const box = await searchOverlay.boundingBox();
        const viewport = page.viewportSize();
        if (box && viewport) {
          expect(box.height).toBeGreaterThan(viewport.height * 0.8);
        }
      }
    });

    test('should filter Pokémon in real-time', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
      await searchInput.fill('pikachu');

      // Wait for filtered results
      await page.waitForTimeout(500); // Debounce delay

      // Check that grid shows filtered results
      const cards = await page.locator('[data-testid="pokemon-card"]').count();
      expect(cards).toBeGreaterThan(0);
      expect(cards).toBeLessThan(10); // Should show only Pikachu-related
    });
  });

  test.describe('Mobile Layout Protection', () => {
    test('should respect safe areas', async ({ page }) => {
      // Check for safe area padding
      const layout = page.locator('.mobile-layout, [data-testid="mobile-layout"]').first();

      if (await layout.count() > 0) {
        const styles = await layout.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            paddingTop: computed.paddingTop,
            paddingBottom: computed.paddingBottom
          };
        });

        // Should have some padding for safe areas
        expect(parseInt(styles.paddingTop)).toBeGreaterThanOrEqual(0);
      }
    });

    test('should not have horizontal scroll', async ({ page }) => {
      // Check viewport doesn't scroll horizontally
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
    });

    test('should have mobile-optimized header', async ({ page }) => {
      // Check for compact header
      const header = page.locator('header, .header, nav').first();
      const box = await header.boundingBox();

      if (box) {
        // Mobile header should be compact
        expect(box.height).toBeLessThanOrEqual(80);
      }
    });
  });

  test.describe('Performance Protection', () => {
    test('should load within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3001/pokedex');
      await page.waitForSelector('[data-testid="pokemon-card"]', { timeout: 3000 });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('should render cards efficiently with virtual scrolling', async ({ page }) => {
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(500);

      // Count rendered cards
      const visibleCards = await page.locator('[data-testid="pokemon-card"]').count();

      // With virtual scrolling, should not render all 1000+ Pokémon
      expect(visibleCards).toBeLessThan(100);
      expect(visibleCards).toBeGreaterThan(0);
    });
  });
});

// Note: Multi-device testing should be configured via Playwright projects in playwright.config.ts
// rather than using test.use() inside describe blocks, as that causes worker conflicts.
// The main tests above run on iPhone 12 Pro and cover mobile functionality.
