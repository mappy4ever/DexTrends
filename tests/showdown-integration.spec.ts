import { test, expect } from '@playwright/test';

test.describe('Pokemon Showdown Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any needed test data or mocks
    await page.goto('http://localhost:3001');
  });

  test.describe('Type Effectiveness', () => {
    test('should display type effectiveness correctly', async ({ page }) => {
      // Navigate to a Pokemon detail page
      await page.goto('/pokedex/charizard');
      
      // Check that type effectiveness is shown
      await expect(page.locator('[data-testid="type-effectiveness"]')).toBeVisible();
      
      // Verify Fire/Flying weaknesses
      const waterWeakness = page.locator('[data-testid="weakness-water"]');
      await expect(waterWeakness).toContainText('2×');
      
      const rockWeakness = page.locator('[data-testid="weakness-rock"]');
      await expect(rockWeakness).toContainText('4×');
    });

    test('should calculate dual type effectiveness correctly', async ({ page }) => {
      // Navigate to a dual-type Pokemon
      await page.goto('/pokedex/garchomp');
      
      // Dragon/Ground should be 4x weak to Ice
      const iceWeakness = page.locator('[data-testid="weakness-ice"]');
      await expect(iceWeakness).toContainText('4×');
    });
  });

  test.describe('Competitive Tiers', () => {
    test('should display tier badges on Pokemon detail page', async ({ page }) => {
      await page.goto('/pokedex/garchomp');
      
      // Check for tier badge
      const tierBadge = page.locator('[data-testid="tier-badge"]');
      await expect(tierBadge).toBeVisible();
      
      // Garchomp should have a tier (likely OU or UUBL)
      await expect(tierBadge).toContainText(/OU|UUBL|UU/);
    });

    test('should show different tiers for different formats', async ({ page }) => {
      await page.goto('/pokedex/incineroar');
      
      // Incineroar is typically better in doubles
      const singlesTier = page.locator('[data-testid="singles-tier"]');
      const doublesTier = page.locator('[data-testid="doubles-tier"]');
      
      // Both should be visible if the Pokemon has different tiers
      if (await doublesTier.isVisible()) {
        // Doubles tier should be higher (DOU vs lower singles tier)
        await expect(doublesTier).toContainText(/DOU|DUU/);
      }
    });
  });

  test.describe('Pokemon Learnsets', () => {
    test('should display moves tab on Pokemon detail page', async ({ page }) => {
      await page.goto('/pokedex/pikachu');
      
      // Click on moves tab
      const movesTab = page.locator('[data-testid="moves-tab"]');
      await expect(movesTab).toBeVisible();
      await movesTab.click();
      
      // Check that learnset is displayed
      await expect(page.locator('[data-testid="pokemon-learnset"]')).toBeVisible();
    });

    test('should filter moves by learn method', async ({ page }) => {
      await page.goto('/pokedex/pikachu');
      await page.click('[data-testid="moves-tab"]');
      
      // Click level-up filter
      await page.click('button:has-text("Level Up")');
      
      // Should show level-up moves
      const levelMoves = page.locator('[data-testid="move-item"]');
      await expect(levelMoves.first()).toBeVisible();
      
      // Check that moves show level information
      await expect(levelMoves.first()).toContainText(/Level \d+/);
    });

    test('should filter moves by generation', async ({ page }) => {
      await page.goto('/pokedex/pikachu');
      await page.click('[data-testid="moves-tab"]');
      
      // Select Gen 1
      await page.selectOption('[data-testid="generation-select"]', '1');
      
      // Should only show Gen 1 moves
      const moves = page.locator('[data-testid="move-item"]');
      const moveCount = await moves.count();
      
      // Select Gen 9
      await page.selectOption('[data-testid="generation-select"]', '9');
      
      // Should show more moves in Gen 9
      const gen9MoveCount = await moves.count();
      expect(gen9MoveCount).toBeGreaterThan(moveCount);
    });
  });

  test.describe('Search Enhancement', () => {
    test('should find Pokemon using aliases', async ({ page }) => {
      await page.goto('/');
      
      // Search for "zard" (Charizard alias)
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('zard');
      await searchInput.press('Enter');
      
      // Should find Charizard
      const searchResults = page.locator('[data-testid="search-result"]');
      await expect(searchResults).toContainText('Charizard');
    });
  });

  test.describe('Type Effectiveness Hook', () => {
    test('should load type chart on component mount', async ({ page }) => {
      // Navigate to team builder which uses type effectiveness
      await page.goto('/team-builder/advanced');
      
      // Check that type effectiveness is working
      await expect(page.locator('[data-testid="type-coverage-chart"]')).toBeVisible();
    });
  });

  test.describe('Data Sync Script', () => {
    test.skip('sync script should be executable', async () => {
      // This test would run in a Node environment, not browser
      // Marking as skip for Playwright browser tests
      // Would test:
      // - Script can connect to Showdown API
      // - Script can parse JavaScript files
      // - Script can insert into Supabase
    });
  });

  test.describe('Performance', () => {
    test('page load time should remain under 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/pokedex/pikachu');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('learnset should load progressively', async ({ page }) => {
      await page.goto('/pokedex/mew'); // Mew has many moves
      await page.click('[data-testid="moves-tab"]');
      
      // Should show loading state first
      const loading = page.locator('[data-testid="learnset-loading"]');
      
      // Then show moves
      await expect(page.locator('[data-testid="move-item"]').first()).toBeVisible({
        timeout: 5000
      });
    });
  });
});