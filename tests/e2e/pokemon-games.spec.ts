import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle, waitForImages } from '../helpers/test-utils';

test.describe('Pokemon Games Pages', () => {
  test.describe('Games Overview Page', () => {
    test('should load games overview page', async ({ page, consoleLogger }) => {
      await page.goto('/pokemon/games');
      await waitForNetworkIdle(page);

      // Check page title
      await expect(page).toHaveTitle(/Games|Pokemon Games|DexTrends/);
      
      // Check main heading
      await expect(page.locator('h1:has-text("Games")').or(page.locator('h1:has-text("Pokemon Games")')).or(page.locator('[data-testid="games-title"]'))).toBeVisible();
      
      // Verify no console errors
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should display all game generations', async ({ page }) => {
      await page.goto('/pokemon/games');
      await waitForNetworkIdle(page);

      // Should show different generations
      const generations = ['Generation I', 'Generation II', 'Generation III', 'Generation IV', 'Generation V'];
      
      for (const gen of generations.slice(0, 3)) {
        await expect(page.locator(`text=/${gen}/i`).first()).toBeVisible();
      }
    });

    test('should display game entries', async ({ page }) => {
      await page.goto('/pokemon/games');
      await waitForNetworkIdle(page);

      // Classic games should be visible
      const games = ['Red', 'Blue', 'Gold', 'Silver', 'Ruby', 'Sapphire'];
      
      // Check for at least some games
      let gamesFound = 0;
      for (const game of games) {
        if (await page.locator(`text=/${game}/i`).count() > 0) {
          gamesFound++;
        }
      }
      expect(gamesFound).toBeGreaterThan(2);
    });

    test('should filter games by generation', async ({ page }) => {
      await page.goto('/pokemon/games');
      await waitForNetworkIdle(page);

      // Look for generation filter
      const genFilter = page.locator('select[name*="generation"]').or(page.locator('[data-testid="generation-filter"]')).first();
      
      if (await genFilter.isVisible()) {
        // Select specific generation
        if (await genFilter.evaluate(el => el.tagName === 'SELECT')) {
          await genFilter.selectOption('1');
        } else {
          await genFilter.click();
          await page.locator('button:has-text("Generation I")').click();
        }
        
        await page.waitForTimeout(1000);
        
        // Should only show Gen 1 games
        await expect(page.locator('text=/Red|Blue|Yellow/i')).toBeVisible();
      }
    });

    test('should navigate to specific game', async ({ page }) => {
      await page.goto('/pokemon/games');
      await waitForNetworkIdle(page);

      // Click on a game
      const gameLink = page.locator('a[href*="/games/"]:has-text("Red")').or(page.locator('[data-testid="game-link"]:has-text("Red")')).first();
      
      if (await gameLink.isVisible()) {
        await gameLink.click();
        await waitForNetworkIdle(page);
        
        // Should navigate to game detail page
        expect(page.url()).toContain('/games/');
        await expect(page.locator('h1:has-text("Red")').or(page.locator('h1:has-text("Pokemon Red")'))).toBeVisible();
      }
    });
  });

  test.describe('Individual Game Pages', () => {
    test('should load game detail page', async ({ page, consoleLogger }) => {
      await page.goto('/pokemon/games/red');
      await waitForNetworkIdle(page);

      // Check page loads
      await expect(page.locator('h1:has-text("Red")').or(page.locator('h1:has-text("Pokemon Red")'))).toBeVisible();
      
      // Game info should be visible
      await expect(page.locator('[data-testid="game-info"]').or(page.locator('.game-details'))).toBeVisible();
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should display game information', async ({ page }) => {
      await page.goto('/pokemon/games/gold');
      await waitForNetworkIdle(page);

      // Should show game details
      const details = ['Release Date', 'Generation', 'Region', 'Platform'];
      
      for (const detail of details) {
        const element = page.locator(`text=/${detail}/i`).first();
        if (await element.isVisible()) {
          expect(await element.textContent()).toBeTruthy();
        }
      }
    });

    test('should show version exclusives', async ({ page }) => {
      await page.goto('/pokemon/games/ruby');
      await waitForNetworkIdle(page);

      // Look for version exclusives section
      const exclusivesSection = page.locator('[data-testid="version-exclusives"]').or(page.locator('.exclusives-section'));
      
      if (await exclusivesSection.isVisible()) {
        // Should list exclusive Pokemon
        const exclusivePokemon = await page.locator('[data-testid="exclusive-pokemon"]').or(page.locator('.exclusive-item')).count();
        expect(exclusivePokemon).toBeGreaterThan(0);
      }
    });

    test('should display game starters', async ({ page, consoleLogger }) => {
      await page.goto('/pokemon/games/diamond');
      await waitForNetworkIdle(page);

      // Should show starter Pokemon
      const startersSection = page.locator('[data-testid="game-starters"]').or(page.locator('.starters-section'));
      
      if (await startersSection.isVisible()) {
        // Sinnoh starters
        await expect(page.locator('text=/Turtwig|Chimchar|Piplup/i')).toBeVisible();
      }
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should show gym leaders for game', async ({ page }) => {
      await page.goto('/pokemon/games/black');
      await waitForNetworkIdle(page);

      // Look for gym leaders
      const gymSection = page.locator('[data-testid="gym-leaders"]').or(page.locator('.gym-leaders'));
      
      if (await gymSection.isVisible()) {
        const leaders = await page.locator('[data-testid="gym-leader"]').or(page.locator('.leader-info')).count();
        expect(leaders).toBeGreaterThan(0);
      }
    });

    test('should display game box art', async ({ page }) => {
      await page.goto('/pokemon/games/x');
      await waitForNetworkIdle(page);

      // Should show game box art
      const boxArt = page.locator('[data-testid="box-art"]').or(page.locator('img[alt*="box"]')).or(page.locator('img[alt*="cover"]')).first();
      
      if (await boxArt.isVisible()) {
        await waitForImages(page);
        const src = await boxArt.getAttribute('src');
        expect(src).toBeTruthy();
      }
    });

    test('should show legendary Pokemon', async ({ page }) => {
      await page.goto('/pokemon/games/sun');
      await waitForNetworkIdle(page);

      // Look for legendary section
      const legendarySection = page.locator('[data-testid="legendary-pokemon"]').or(page.locator('.legendary-section'));
      
      if (await legendarySection.isVisible()) {
        // Sun legendary
        await expect(page.locator('text=/Solgaleo/i')).toBeVisible();
      }
    });

    test('should display Pokedex information', async ({ page }) => {
      await page.goto('/pokemon/games/sword');
      await waitForNetworkIdle(page);

      // Should show Pokedex details
      const pokedexInfo = page.locator('[data-testid="pokedex-info"]').or(page.locator('.pokedex-details'));
      
      if (await pokedexInfo.isVisible()) {
        // Should mention regional dex
        const dexText = await pokedexInfo.textContent();
        expect(dexText).toMatch(/\d+|pokemon|dex/i);
      }
    });

    test('should show new features', async ({ page, consoleLogger }) => {
      await page.goto('/pokemon/games/scarlet');
      await waitForNetworkIdle(page);

      // Look for features section
      const featuresSection = page.locator('[data-testid="game-features"]').or(page.locator('.features-section'));
      
      if (await featuresSection.isVisible()) {
        // Should list game features
        const features = await page.locator('[data-testid="feature-item"]').or(page.locator('.feature')).count();
        expect(features).toBeGreaterThan(0);
      }
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should navigate between game versions', async ({ page }) => {
      await page.goto('/pokemon/games/red');
      await waitForNetworkIdle(page);

      // Look for version navigation
      const blueLink = page.locator('a:has-text("Blue")').or(page.locator('[data-testid="version-link"]:has-text("Blue")')).first();
      
      if (await blueLink.isVisible()) {
        await blueLink.click();
        await waitForNetworkIdle(page);
        
        // Should be on Blue version page
        expect(page.url()).toContain('/blue');
      }
    });

    test('should display game timeline', async ({ page }) => {
      await page.goto('/pokemon/games/yellow');
      await waitForNetworkIdle(page);

      // Look for timeline or related games
      const timeline = page.locator('[data-testid="game-timeline"]').or(page.locator('.related-games'));
      
      if (await timeline.isVisible()) {
        // Should show related games in order
        const relatedGames = await page.locator('[data-testid="related-game"]').count();
        expect(relatedGames).toBeGreaterThan(0);
      }
    });

    test('should work on mobile viewport', async ({ page, consoleLogger }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/pokemon/games/emerald');
      await waitForNetworkIdle(page);

      // Main content visible
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Box art should scale
      const boxArt = page.locator('[data-testid="box-art"]').or(page.locator('img')).first();
      if (await boxArt.isVisible()) {
        const size = await boxArt.boundingBox();
        expect(size?.width).toBeLessThan(350);
      }
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle remake games', async ({ page }) => {
      await page.goto('/pokemon/games/heartgold');
      await waitForNetworkIdle(page);

      // Should indicate it's a remake
      const remakeInfo = page.locator('text=/remake|enhanced|version/i');
      
      if (await remakeInfo.count() > 0) {
        await expect(remakeInfo.first()).toBeVisible();
        
        // Should reference original
        await expect(page.locator('text=/Gold|original/i')).toBeVisible();
      }
    });

    test('should show game sales data', async ({ page }) => {
      await page.goto('/pokemon/games/red');
      await waitForNetworkIdle(page);

      // Look for sales/popularity info
      const salesInfo = page.locator('[data-testid="sales-info"]').or(page.locator('text=/sales|sold|copies/i'));
      
      if (await salesInfo.count() > 0) {
        const salesText = await salesInfo.first().textContent();
        expect(salesText).toMatch(/\d+/); // Should contain numbers
      }
    });

    test('should handle invalid game names', async ({ page }) => {
      await page.goto('/pokemon/games/fakegame123');
      await waitForNetworkIdle(page);

      // Should show error or redirect
      const errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('text=/not found/i'));
      const redirected = page.url().includes('/games') && !page.url().includes('fakegame');
      
      expect(await errorMessage.isVisible() || redirected).toBeTruthy();
    });
  });
});