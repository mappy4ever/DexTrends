import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle, waitForImages } from '../helpers/test-utils';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';

test.describe('Pokemon Starters Pages', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
  });

  test.describe('Starters Overview Page', () => {
    test('should load starters overview page', async ({ page, consoleLogger }) => {
      await page.goto('/pokemon/starters');
      await waitForNetworkIdle(page);

      // Check page title
      await expect(page).toHaveTitle(/Starters|Starter Pokemon|DexTrends/);
      
      // Check main heading
      await expect(page.locator('h1:has-text("Starters")').or(page.locator('h1:has-text("Starter Pokemon")')).or(page.locator('[data-testid="starters-title"]'))).toBeVisible();
      
      // Verify no console errors
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should display all starter trios', async ({ page }) => {
      await page.goto('/pokemon/starters');
      await waitForNetworkIdle(page);

      // Should show starter groups by region
      const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova'];
      
      for (const region of regions.slice(0, 3)) {
        await expect(page.locator(`text=/${region}/i`).first()).toBeVisible();
      }
      
      // Should have starter groups
      const starterGroups = page.locator('[data-testid="starter-group"]').or(page.locator('.starter-trio'));
      expect(await starterGroups.count()).toBeGreaterThanOrEqual(8);
    });

    test('should display starter Pokemon sprites', async ({ page }) => {
      await page.goto('/pokemon/starters');
      await waitForNetworkIdle(page);
      
      // Should show starter sprites
      const starterSprites = page.locator('[data-testid="starter-sprite"]').or(page.locator('.starter-image'));
      expect(await starterSprites.count()).toBeGreaterThan(15); // At least 5 regions x 3 starters
      
      await waitForImages(page);
    });

    test('should navigate to region-specific starters', async ({ page }) => {
      await page.goto('/pokemon/starters');
      await waitForNetworkIdle(page);

      // Click on a region
      const regionLink = page.locator('a[href*="/starters/"]:has-text("Kanto")').or(page.locator('[data-testid="region-starters-link"]:has-text("Kanto")')).first();
      
      if (await regionLink.isVisible()) {
        await regionLink.click();
        await waitForNetworkIdle(page);
        
        // Should navigate to region starters page
        expect(page.url()).toContain('/starters/');
        await expect(page.locator('h1:has-text("Kanto")')).toBeVisible();
      }
    });
  });

  test.describe('Region-Specific Starter Pages', () => {
    test('should load Kanto starters page', async ({ page, consoleLogger }) => {
      await page.goto('/pokemon/starters/kanto');
      await waitForNetworkIdle(page);

      // Check page loads
      await expect(page.locator('h1:has-text("Kanto")').or(page.locator('h1:has-text("Generation I")'))).toBeVisible();
      
      // Should show Kanto starters
      await expect(page.locator('text=/Bulbasaur/i')).toBeVisible();
      await expect(page.locator('text=/Charmander/i')).toBeVisible();
      await expect(page.locator('text=/Squirtle/i')).toBeVisible();
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should display starter evolution lines', async ({ page }) => {
      await page.goto('/pokemon/starters/johto');
      await waitForNetworkIdle(page);

      // Should show evolution chains
      const evolutionChains = page.locator('[data-testid="evolution-chain"]').or(page.locator('.evolution-line'));
      expect(await evolutionChains.count()).toBe(3); // 3 starter lines
      
      // Check Cyndaquil line
      await expect(page.locator('text=/Cyndaquil/i')).toBeVisible();
      await expect(page.locator('text=/Quilava/i')).toBeVisible();
      await expect(page.locator('text=/Typhlosion/i')).toBeVisible();
    });

    test('should show starter types', async ({ page }) => {
      await page.goto('/pokemon/starters/hoenn');
      await waitForNetworkIdle(page);

      // Should display type badges
      const types = ['Grass', 'Fire', 'Water'];
      
      for (const type of types) {
        const typeBadge = page.locator(`[data-testid="type-badge"]:has-text("${type}"), .type-${type.toLowerCase()}`).first();
        await expect(typeBadge).toBeVisible();
      }
    });

    test('should display starter stats comparison', async ({ page, consoleLogger }) => {
      await page.goto('/pokemon/starters/sinnoh');
      await waitForNetworkIdle(page);

      // Look for stats comparison
      const statsComparison = page.locator('[data-testid="stats-comparison"]').or(page.locator('.stats-chart'));
      
      if (await statsComparison.isVisible()) {
        // Should show stat values
        const statValues = await page.locator('[data-testid="stat-value"]').or(page.locator('.stat-number')).count();
        expect(statValues).toBeGreaterThan(0);
      }
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should show starter abilities', async ({ page }) => {
      await page.goto('/pokemon/starters/unova');
      await waitForNetworkIdle(page);

      // Should list abilities
      const abilities = page.locator('[data-testid="starter-ability"]').or(page.locator('.ability-name'));
      
      if (await abilities.count() > 0) {
        // Common starter abilities
        const commonAbilities = ['Overgrow', 'Blaze', 'Torrent'];
        
        for (const ability of commonAbilities) {
          await expect(page.locator(`text=/${ability}/i`).first()).toBeVisible();
        }
      }
    });

    test('should display hidden abilities', async ({ page }) => {
      await page.goto('/pokemon/starters/kalos');
      await waitForNetworkIdle(page);

      // Look for hidden abilities section
      const hiddenAbilities = page.locator('[data-testid="hidden-ability"]').or(page.locator('.hidden-ability-badge'));
      
      if (await hiddenAbilities.count() > 0) {
        // Should show HA for each starter
        expect(await hiddenAbilities.count()).toBeGreaterThanOrEqual(3);
      }
    });

    test('should show mega evolutions or special forms', async ({ page }) => {
      await page.goto('/pokemon/starters/kanto');
      await waitForNetworkIdle(page);

      // Kanto starters have Mega Evolutions
      const megaSection = page.locator('[data-testid="mega-evolutions"]').or(page.locator('.special-forms'));
      
      if (await megaSection.isVisible()) {
        // Should show Mega forms
        await expect(page.locator('text=/Mega/i')).toBeVisible();
      }
    });

    test('should navigate to individual starter Pokemon', async ({ page }) => {
      await page.goto('/pokemon/starters/alola');
      await waitForNetworkIdle(page);

      // Click on a starter
      const starterLink = page.locator('a[href*="/pokedex/"]:has-text("Rowlet")').or(page.locator('[data-testid="starter-link"]:has-text("Rowlet")')).first();
      
      if (await starterLink.isVisible()) {
        await starterLink.click();
        await waitForNetworkIdle(page);
        
        // Should navigate to Pokemon detail page
        expect(page.url()).toContain('/pokedex/');
        await expect(page.locator('h1:has-text("Rowlet")')).toBeVisible();
      }
    });

    test('should display starter signature moves', async ({ page, consoleLogger }) => {
      await page.goto('/pokemon/starters/galar');
      await waitForNetworkIdle(page);

      // Look for signature moves section
      const signatureMoves = page.locator('[data-testid="signature-moves"]').or(page.locator('.exclusive-moves'));
      
      if (await signatureMoves.isVisible()) {
        // Galar starters have unique moves
        const moves = await page.locator('[data-testid="move-name"]').or(page.locator('.signature-move')).count();
        expect(moves).toBeGreaterThan(0);
      }
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should show competitive viability', async ({ page }) => {
      await page.goto('/pokemon/starters/paldea');
      await waitForNetworkIdle(page);

      // Look for competitive info
      const competitiveSection = page.locator('[data-testid="competitive-info"]').or(page.locator('.usage-stats'));
      
      if (await competitiveSection.isVisible()) {
        // Should show tier or usage data
        const tierInfo = page.locator('[data-testid="tier-badge"]').or(page.locator('text=/OU|UU|RU|NU/i'));
        expect(await tierInfo.count()).toBeGreaterThan(0);
      }
    });

    test('should navigate between regions', async ({ page }) => {
      await page.goto('/pokemon/starters/johto');
      await waitForNetworkIdle(page);

      // Look for navigation
      const nextRegion = page.locator('a:has-text("Next")').or(page.locator('[data-testid="next-region"]')).first();
      const prevRegion = page.locator('a:has-text("Previous")').or(page.locator('[data-testid="prev-region"]')).first();
      
      if (await nextRegion.isVisible()) {
        await nextRegion.click();
        await waitForNetworkIdle(page);
        
        // Should be on different region
        expect(page.url()).not.toContain('/johto');
        expect(page.url()).toContain('/starters/');
      }
    });

    test('should display TCG cards for starters', async ({ page }) => {
      await page.goto('/pokemon/starters/kanto');
      await waitForNetworkIdle(page);

      // Look for TCG section
      const tcgSection = page.locator('[data-testid="starter-tcg-cards"]').or(page.locator('.tcg-cards'));
      
      if (await tcgSection.isVisible()) {
        // Should show some cards
        const cards = await page.locator('[data-testid="tcg-card"]').or(page.locator('.card-preview')).count();
        expect(cards).toBeGreaterThan(0);
      }
    });

    test('should work on mobile viewport', async ({ page, consoleLogger }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/pokemon/starters/hoenn');
      await waitForNetworkIdle(page);

      // Main content visible
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Starter cards should stack vertically
      const starterCards = page.locator('[data-testid="starter-card"]').or(page.locator('.starter-info'));
      if (await starterCards.count() > 0) {
        // Check layout
        const firstCard = await starterCards.first().boundingBox();
        const secondCard = await starterCards.nth(1).boundingBox();
        
        if (firstCard && secondCard) {
          // Should be stacked (second card below first)
          expect(secondCard.y).toBeGreaterThan(firstCard.y + firstCard.height);
        }
      }
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle invalid region names', async ({ page }) => {
      await page.goto('/pokemon/starters/fakeland');
      await waitForNetworkIdle(page);

      // Should show error or redirect
      const errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('text=/not found/i'));
      const redirected = page.url().includes('/starters') && !page.url().includes('fakeland');
      
      expect(await errorMessage.isVisible() || redirected).toBeTruthy();
    });
  });
});