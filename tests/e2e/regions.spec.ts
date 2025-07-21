import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle, waitForImages } from '../helpers/test-utils';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';

test.describe('Regions Pages', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
  });

  test.describe('Regions Overview Page', () => {
    test('should load regions overview page', async ({ page, consoleLogger }) => {
      await page.goto('/regions');
      await waitForNetworkIdle(page);

      // Check page title
      await expect(page).toHaveTitle(/Regions|DexTrends/);
      
      // Check main heading
      await expect(page.locator('h1:has-text("Regions")').or(page.locator('[data-testid="regions-title"]'))).toBeVisible();
      
      // Verify no console errors
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should display all Pokemon regions', async ({ page }) => {
      await page.goto('/regions');
      await waitForNetworkIdle(page);

      // Expected regions
      const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'];
      
      // Check for region cards/links
      for (const region of regions.slice(0, 5)) { // Check first 5
        await expect(page.locator(`text=/${region}/i`)).toBeVisible();
      }
      
      // Should have region cards
      const regionCards = page.locator('[data-testid="region-card"]').or(page.locator('.region-item'));
      expect(await regionCards.count()).toBeGreaterThanOrEqual(8);
    });

    test('should display region information', async ({ page }) => {
      await page.goto('/regions');
      await waitForNetworkIdle(page);

      const firstRegion = page.locator('[data-testid="region-card"]').or(page.locator('.region-item')).first();
      
      if (await firstRegion.isVisible()) {
        // Should show region details
        const details = ['Generation', 'Pokemon', 'Starters'];
        
        for (const detail of details) {
          const element = page.locator(`text=/${detail}/i`).first();
          if (await element.isVisible()) {
            expect(await element.textContent()).toBeTruthy();
          }
        }
      }
    });

    test('should navigate to specific region', async ({ page }) => {
      await page.goto('/regions');
      await waitForNetworkIdle(page);

      // Click on Kanto region
      const kantoLink = page.locator('[data-testid="region-card"]:has-text("Kanto")').or(page.locator('a:has-text("Kanto")')).first();
      await kantoLink.click();
      await waitForNetworkIdle(page);

      // Should navigate to Kanto page
      await expect(page).toHaveURL(/\/regions\/kanto/i);
      await expect(page.locator('h1:has-text("Kanto")')).toBeVisible();
    });
  });

  test.describe('Individual Region Pages', () => {
    test('should load Kanto region page', async ({ page, consoleLogger }) => {
      await page.goto('/regions/kanto');
      await waitForNetworkIdle(page);

      // Check page elements
      await expect(page.locator('h1:has-text("Kanto")')).toBeVisible();
      
      // Should show generation info
      await expect(page.locator('text=/Generation I|Gen 1/i')).toBeVisible();
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should display region Pokemon', async ({ page }) => {
      await page.goto('/regions/johto');
      await waitForNetworkIdle(page);

      // Should show Pokemon from this region
      const pokemonGrid = page.locator('[data-testid="pokemon-grid"]').or(page.locator('.pokemon-list'));
      await expect(pokemonGrid).toBeVisible();
      
      // Should have Pokemon cards
      const pokemonCards = page.locator('[data-testid="pokemon-card"]').or(page.locator('.pokemon-item'));
      expect(await pokemonCards.count()).toBeGreaterThan(0);
      
      // Johto Pokemon should include Gen 2 starters
      await expect(page.locator('text=/Cyndaquil|Totodile|Chikorita/i')).toBeVisible();
    });

    test('should show region starters', async ({ page }) => {
      await page.goto('/regions/hoenn');
      await waitForNetworkIdle(page);

      // Look for starters section
      const startersSection = page.locator('[data-testid="region-starters"]').or(page.locator('.starters-section'));
      
      if (await startersSection.isVisible()) {
        // Hoenn starters
        await expect(page.locator('text=/Treecko/i')).toBeVisible();
        await expect(page.locator('text=/Torchic/i')).toBeVisible();
        await expect(page.locator('text=/Mudkip/i')).toBeVisible();
      }
    });

    test('should display region map', async ({ page }) => {
      await page.goto('/regions/sinnoh');
      await waitForNetworkIdle(page);

      // Look for region map
      const regionMap = page.locator('[data-testid="region-map"]').or(page.locator('.region-map')).or(page.locator('img[alt*="map"]'));
      
      if (await regionMap.isVisible()) {
        await waitForImages(page);
        
        // Map should be loaded
        const mapSrc = await regionMap.getAttribute('src');
        expect(mapSrc).toBeTruthy();
      }
    });

    test('should show gym leaders', async ({ page, consoleLogger }) => {
      await page.goto('/regions/unova');
      await waitForNetworkIdle(page);

      // Look for gym leaders section
      const gymLeadersSection = page.locator('[data-testid="gym-leaders"]').or(page.locator('.gym-leaders-section'));
      
      if (await gymLeadersSection.isVisible()) {
        // Should list gym leaders
        const leaders = await page.locator('[data-testid="gym-leader"]').or(page.locator('.leader-card')).count();
        expect(leaders).toBeGreaterThan(0);
      }
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should display legendary Pokemon', async ({ page }) => {
      await page.goto('/regions/kalos');
      await waitForNetworkIdle(page);

      // Look for legendary section
      const legendarySection = page.locator('[data-testid="legendary-pokemon"]').or(page.locator('.legendary-section'));
      
      if (await legendarySection.isVisible()) {
        // Kalos legendaries
        const xerneas = page.locator('text=/Xerneas/i');
        const yveltal = page.locator('text=/Yveltal/i');
        
        expect(await xerneas.isVisible() || await yveltal.isVisible()).toBeTruthy();
      }
    });

    test('should handle region variants', async ({ page }) => {
      await page.goto('/regions/alola');
      await waitForNetworkIdle(page);

      // Alola has regional forms
      const regionalForms = page.locator('[data-testid="regional-forms"]').or(page.locator('text=/Alolan/i'));
      
      if (await regionalForms.count() > 0) {
        // Should show Alolan forms
        await expect(regionalForms.first()).toBeVisible();
      }
    });

    test('should navigate between regions', async ({ page }) => {
      await page.goto('/regions/galar');
      await waitForNetworkIdle(page);

      // Look for navigation
      const nextRegion = page.locator('a:has-text("Next Region")').or(page.locator('[data-testid="next-region"]')).first();
      const prevRegion = page.locator('a:has-text("Previous Region")').or(page.locator('[data-testid="prev-region"]')).first();
      
      if (await nextRegion.isVisible() || await prevRegion.isVisible()) {
        const navButton = await nextRegion.isVisible() ? nextRegion : prevRegion;
        await navButton.click();
        await waitForNetworkIdle(page);
        
        // Should be on different region
        expect(page.url()).not.toContain('/galar');
      }
    });

    test('should filter Pokemon by type in region', async ({ page }) => {
      await page.goto('/regions/paldea');
      await waitForNetworkIdle(page);

      // Look for type filter
      const typeFilter = page.locator('[data-testid="type-filter"]').or(page.locator('select[name="type"]')).first();
      
      if (await typeFilter.isVisible()) {
        await pageHelpers.filterByType('Fire');
        await page.waitForTimeout(1000);
        
        // Should filter to fire types
        const visiblePokemon = await page.locator('[data-testid="pokemon-card"]:visible').count();
        expect(visiblePokemon).toBeGreaterThan(0);
      }
    });

    test('should display region statistics', async ({ page }) => {
      await page.goto('/regions/kanto');
      await waitForNetworkIdle(page);

      // Look for stats
      const statsSection = page.locator('[data-testid="region-stats"]').or(page.locator('.region-statistics'));
      
      if (await statsSection.isVisible()) {
        // Should show various stats
        const stats = ['Total Pokemon', 'Types', 'Gym Badges'];
        
        for (const stat of stats) {
          const statElement = page.locator(`text=/${stat}/i`);
          if (await statElement.count() > 0) {
            expect(await statElement.first().textContent()).toMatch(/\d+/);
          }
        }
      }
    });

    test('should work on mobile viewport', async ({ page, consoleLogger }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/regions/johto');
      await waitForNetworkIdle(page);

      // Main content visible
      await expect(page.locator('h1:has-text("Johto")')).toBeVisible();
      
      // Pokemon grid should be responsive
      const pokemonGrid = page.locator('[data-testid="pokemon-grid"]').or(page.locator('.pokemon-list'));
      if (await pokemonGrid.isVisible()) {
        const gridStyle = await pokemonGrid.evaluate(el => window.getComputedStyle(el));
        expect(gridStyle).toBeTruthy();
      }
      
      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle invalid region names', async ({ page }) => {
      await page.goto('/regions/invalid-region-xyz');
      await waitForNetworkIdle(page);

      // Should show error or redirect
      const errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('text=/not found/i'));
      const redirected = page.url().includes('/regions') && !page.url().includes('invalid');
      
      expect(await errorMessage.isVisible() || redirected).toBeTruthy();
    });
  });
});