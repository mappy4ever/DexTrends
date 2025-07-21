import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle, waitForImages, checkBrokenImages } from '../helpers/test-utils';

test.describe('Pokemon Detail Page', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
  });

  test('should load Pokemon detail page with all sections', async ({ page, consoleLogger }) => {
    // Test with Pikachu
    await pageHelpers.goToPokemonDetail('25');
    await waitForNetworkIdle(page);

    // Check page title
    await expect(page).toHaveTitle(/Pikachu|#025|DexTrends/);

    // Verify main sections are visible
    await expect(page.locator('h1:has-text("Pikachu")').or(page.locator('[data-testid="pokemon-name"]'))).toBeVisible();
    await expect(page.locator('[data-testid="pokemon-number"]').or(page.locator(':text("#025")')).or(page.locator(':text("025")'))).toBeVisible();
    
    // Check Pokemon image
    const pokemonImage = page.locator('[data-testid="pokemon-sprite"]').or(page.locator('img[alt*="Pikachu"]')).first();
    await expect(pokemonImage).toBeVisible();
    await waitForImages(page);

    // Verify no broken images
    const brokenImages = await checkBrokenImages(page);
    expect(brokenImages.length).toBe(0);

    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display Pokemon stats correctly', async ({ page }) => {
    await pageHelpers.goToPokemonDetail('6'); // Charizard
    await waitForNetworkIdle(page);

    // Check stats section
    const statsSection = page.locator('[data-testid="pokemon-stats"]').or(page.locator('.stats-section'));
    await expect(statsSection).toBeVisible();

    // Verify all base stats are shown
    const statNames = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'];
    for (const stat of statNames) {
      await expect(page.locator(`text=/${stat}/i`).first()).toBeVisible();
    }

    // Check stat values are numbers
    const statValues = await page.locator('[data-testid="stat-value"]').or(page.locator('.stat-value')).allTextContents();
    statValues.forEach(value => {
      expect(parseInt(value)).toBeGreaterThan(0);
    });
  });

  test('should show Pokemon types and weaknesses', async ({ page }) => {
    await pageHelpers.goToPokemonDetail('25'); // Pikachu (Electric type)
    await waitForNetworkIdle(page);

    // Check type display
    await expect(page.locator('text=/Electric/i')).toBeVisible();

    // Check weaknesses section
    const weaknessSection = page.locator('[data-testid="type-weaknesses"]').or(page.locator('.weaknesses-section'));
    if (await weaknessSection.isVisible()) {
      // Should show Ground as weakness for Electric
      await expect(page.locator('text=/Ground/i')).toBeVisible();
    }
  });

  test('should display evolution chain', async ({ page, consoleLogger }) => {
    await pageHelpers.goToPokemonDetail('1'); // Bulbasaur
    await waitForNetworkIdle(page);

    // Check evolution chain
    const evolutionChain = page.locator('[data-testid="evolution-chain"]').or(page.locator('.evolution-chain'));
    await expect(evolutionChain).toBeVisible();

    // Should show Bulbasaur -> Ivysaur -> Venusaur
    await expect(page.locator('text=/Bulbasaur/i')).toBeVisible();
    await expect(page.locator('text=/Ivysaur/i')).toBeVisible();
    await expect(page.locator('text=/Venusaur/i')).toBeVisible();

    // Evolution images should load
    await waitForImages(page);
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should handle Pokemon with forms/variants', async ({ page }) => {
    await pageHelpers.goToPokemonDetail('386'); // Deoxys (multiple forms)
    await waitForNetworkIdle(page);

    // Look for form selector
    const formSelector = page.locator('[data-testid="form-selector"]').or(page.locator('.form-selector')).or(page.locator('select[name*="form"]'));
    await expect(formSelector).toBeVisible();

    // Try changing form
    if (await formSelector.evaluate(el => el.tagName === 'SELECT')) {
      await formSelector.selectOption({ index: 1 });
    } else {
      await formSelector.click();
      await page.locator('[data-testid="form-option"]').nth(1).click();
    }

    await page.waitForTimeout(1000);
    
    // Stats should update for different form
    const statsAfterChange = await page.locator('[data-testid="stat-value"]').first().textContent();
    expect(statsAfterChange).toBeTruthy();
  });

  test('should show moves and abilities', async ({ page }) => {
    await pageHelpers.goToPokemonDetail('150'); // Mewtwo
    await waitForNetworkIdle(page);

    // Check abilities section
    const abilitiesSection = page.locator('[data-testid="pokemon-abilities"]').or(page.locator('.abilities-section'));
    if (await abilitiesSection.isVisible()) {
      await expect(page.locator('text=/Pressure/i')).toBeVisible();
    }

    // Check moves section
    const movesSection = page.locator('[data-testid="pokemon-moves"]').or(page.locator('.moves-section'));
    if (await movesSection.isVisible()) {
      // Should have some moves listed
      const moves = await page.locator('[data-testid="move-item"]').or(page.locator('.move-name')).count();
      expect(moves).toBeGreaterThan(0);
    }
  });

  test('should handle navigation between Pokemon', async ({ page }) => {
    await pageHelpers.goToPokemonDetail('25'); // Pikachu (#25)
    await waitForNetworkIdle(page);

    // Look for next/previous buttons
    const nextButton = page.locator('button:has-text("Next")').or(page.locator('[data-testid="next-pokemon"]')).or(page.locator('a[href*="/26"]')).first();
    const prevButton = page.locator('button:has-text("Previous")').or(page.locator('[data-testid="prev-pokemon"]')).or(page.locator('a[href*="/24"]')).first();

    if (await nextButton.isVisible()) {
      await nextButton.click();
      await waitForNetworkIdle(page);
      
      // Should now be on Raichu (#26)
      await expect(page).toHaveURL(/\/26/);
      await expect(page.locator('text=/Raichu/i')).toBeVisible();
    }
  });

  test('should add Pokemon to favorites', async ({ page, consoleLogger }) => {
    await pageHelpers.goToPokemonDetail('143'); // Snorlax
    await waitForNetworkIdle(page);

    // Find favorite button
    const favoriteButton = page.locator('button:has-text("Favorite")').or(page.locator('[data-testid="favorite-button"]')).or(page.locator('button[aria-label*="favorite"]')).first();
    
    if (await favoriteButton.isVisible()) {
      const initialText = await favoriteButton.textContent();
      await favoriteButton.click();
      await page.waitForTimeout(1000);

      // Button should change state
      const updatedText = await favoriteButton.textContent();
      expect(updatedText).not.toBe(initialText);

      // Should show success message or change icon
      const successIndicator = page.locator('[data-testid="favorite-success"]').or(page.locator('.success-message')).or(page.locator('.favorited'));
      const hasSuccess = await successIndicator.isVisible().catch(() => false);
      expect(hasSuccess || updatedText !== initialText).toBeTruthy();
    }

    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display TCG cards for Pokemon', async ({ page }) => {
    await pageHelpers.goToPokemonDetail('25'); // Pikachu (has many cards)
    await waitForNetworkIdle(page);

    // Look for TCG cards section
    const tcgSection = page.locator('[data-testid="tcg-cards"]').or(page.locator('.tcg-cards-section'));
    if (await tcgSection.isVisible()) {
      // Should show some Pikachu cards
      const cards = await page.locator('[data-testid="tcg-card"]').or(page.locator('.card-item')).count();
      expect(cards).toBeGreaterThan(0);

      // Click on a card
      const firstCard = page.locator('[data-testid="tcg-card"]').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        
        // Should open modal or navigate
        const modal = page.locator('[role="dialog"]').or(page.locator('.card-modal'));
        const navigated = page.url().includes('/cards/');
        
        expect(await modal.isVisible() || navigated).toBeTruthy();
      }
    }
  });

  test('should handle invalid Pokemon IDs', async ({ page }) => {
    // Try invalid ID
    await page.goto('/pokedex/99999');
    await waitForNetworkIdle(page);

    // Should show error or redirect
    const errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('.error')).or(page.locator('text=/not found/i'));
    const redirected = page.url().includes('/pokedex') && !page.url().includes('99999');
    
    expect(await errorMessage.isVisible() || redirected).toBeTruthy();
  });

  test('should work on mobile viewport', async ({ page, consoleLogger }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await pageHelpers.goToPokemonDetail('1'); // Bulbasaur
    await waitForNetworkIdle(page);

    // Main content should be visible
    await expect(page.locator('h1:has-text("Bulbasaur")').or(page.locator('[data-testid="pokemon-name"]'))).toBeVisible();
    
    // Check mobile layout
    const mobileLayout = await page.evaluate(() => {
      const container = document.querySelector('.container, main');
      if (!container) return true;
      
      const styles = window.getComputedStyle(container);
      return parseInt(styles.maxWidth) <= 768;
    });
    
    expect(mobileLayout).toBeTruthy();
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should load shiny sprites when available', async ({ page }) => {
    await pageHelpers.goToPokemonDetail('25'); // Pikachu
    await waitForNetworkIdle(page);

    // Look for shiny toggle
    const shinyToggle = page.locator('button:has-text("Shiny")').or(page.locator('[data-testid="shiny-toggle"]')).or(page.locator('input[type="checkbox"][name*="shiny"]')).first();
    
    if (await shinyToggle.isVisible()) {
      await shinyToggle.click();
      await page.waitForTimeout(500);

      // Image source should change
      const spriteImage = page.locator('[data-testid="pokemon-sprite"]').or(page.locator('.pokemon-image')).first();
      const imageSrc = await spriteImage.getAttribute('src');
      expect(imageSrc).toContain('shiny');
    }
  });

  test('should display game appearances', async ({ page }) => {
    await pageHelpers.goToPokemonDetail('150'); // Mewtwo
    await waitForNetworkIdle(page);

    // Look for game appearances section
    const gamesSection = page.locator('[data-testid="game-appearances"]').or(page.locator('.games-section'));
    if (await gamesSection.isVisible()) {
      // Should list games where Mewtwo appears
      const games = await page.locator('[data-testid="game-item"]').or(page.locator('.game-name')).count();
      expect(games).toBeGreaterThan(0);
    }
  });

  test('should handle special characters in names', async ({ page, consoleLogger }) => {
    await pageHelpers.goToPokemonDetail('83'); // Farfetch'd
    await waitForNetworkIdle(page);

    // Should handle the apostrophe correctly
    await expect(page.locator('h1:has-text("Farfetch\\\'d"), h1:has-text("Farfetch\\\'d")')).toBeVisible();
    
    // Page should load without errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });
});