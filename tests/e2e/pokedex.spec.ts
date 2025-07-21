import { test, expect } from '../fixtures/test-base';

test.describe('Pokedex', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pokedex');
  });

  test('should display Pokemon grid', async ({ page, waitStrategies }) => {
    // Wait for Pokemon cards to load properly
    await waitStrategies.waitForPokemonCards();
    
    // Should show multiple Pokemon
    const pokemonCards = page.locator('[data-testid="pokemon-card"]').or(page.locator('.pokemon-card')).or(page.locator('article'));
    await expect(pokemonCards).toHaveCount(20, { timeout: 15000 });
  });

  test('should filter Pokemon by type', async ({ page, waitStrategies }) => {
    // Wait for initial load
    await waitStrategies.waitForPokemonCards();
    
    // Find type filter
    const typeFilter = page.locator('select[name="type"]').or(page.locator('[data-testid="type-filter"]')).or(page.locator('button:has-text("Type")')).first();
    
    if (await typeFilter.evaluate(el => el.tagName === 'SELECT')) {
      await typeFilter.selectOption('fire');
    } else {
      await typeFilter.click();
      await page.locator('button:has-text("Fire")').or(page.locator('[data-value="fire"]')).click();
    }
    
    // Wait for search results
    await waitStrategies.waitForSearchResults();
    
    // Check that results are filtered
    const firstPokemon = page.locator('[data-testid="pokemon-card"]').or(page.locator('.pokemon-card')).first();
    await expect(firstPokemon).toBeVisible();
  });

  test('should navigate to Pokemon detail page', async ({ page, waitStrategies }) => {
    // Wait for cards to load
    await waitStrategies.waitForPokemonCards();
    
    // Click on first Pokemon with smart wait
    await waitStrategies.clickAndWait('[data-testid="pokemon-card"], .pokemon-card, article');
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/pokedex\/\d+/);
    
    // Wait for page to be ready
    await waitStrategies.waitForPageReady();
    
    // Should show Pokemon details
    await expect(page.locator('h1').or(page.locator('[data-testid="pokemon-name"]'))).toBeVisible();
    await expect(page.locator('[data-testid="pokemon-stats"]').or(page.locator('text=/HP|Attack|Defense/i'))).toBeVisible();
  });

  test('should search for specific Pokemon', async ({ page }) => {
    // Find search input on Pokedex page
    const searchInput = page.locator('input[placeholder*="search" i]').or(page.locator('input[type="search"]')).first();
    await searchInput.fill('Charizard');
    await searchInput.press('Enter');
    
    // Should show Charizard in results
    await expect(page.locator('text=/charizard/i')).toBeVisible({ timeout: 10000 });
  });
});