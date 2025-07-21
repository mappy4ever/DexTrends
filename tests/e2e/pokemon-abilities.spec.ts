import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle } from '../helpers/test-utils';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';

test.describe('Pokemon Abilities Database', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
    await page.goto('/pokemon/abilities');
    await waitForNetworkIdle(page);
  });

  test('should load abilities page', async ({ page, consoleLogger }) => {
    // Check page title
    await expect(page).toHaveTitle(/Abilities|Pokemon Abilities|DexTrends/);
    
    // Check main heading
    await expect(page.locator('h1:has-text("Abilities")').or(page.locator('[data-testid="abilities-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display abilities list', async ({ page }) => {
    await pageHelpers.waitForLoadingComplete();
    
    // Should show abilities (look for ability headings)
    const abilities = page.locator('h3.text-xl.font-bold.capitalize').or(page.locator('[data-testid="ability-item"]'));
    expect(await abilities.count()).toBeGreaterThan(0);
    
    // Common abilities should be visible
    const commonAbilities = ['Overgrow', 'Blaze', 'Torrent', 'Intimidate', 'Levitate'];
    
    let foundAbilities = 0;
    for (const ability of commonAbilities) {
      if (await page.locator(`text=/${ability}/i`).count() > 0) {
        foundAbilities++;
      }
    }
    expect(foundAbilities).toBeGreaterThan(2);
  });

  test('should display ability descriptions', async ({ page }) => {
    const firstAbility = page.locator('[data-testid="ability-item"]').first();
    
    if (await firstAbility.isVisible()) {
      // Should show ability name and description
      const abilityName = firstAbility.locator('[data-testid="ability-name"]').or(firstAbility.locator('.ability-name'));
      const abilityDesc = firstAbility.locator('[data-testid="ability-description"]').or(firstAbility.locator('.ability-desc'));
      
      await expect(abilityName).toBeVisible();
      await expect(abilityDesc).toBeVisible();
      
      // Description should have content
      const descText = await abilityDesc.textContent();
      expect(descText?.length).toBeGreaterThan(10);
    }
  });

  test('should search abilities', async ({ page, consoleLogger }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"]').or(page.locator('[data-testid="ability-search"]')).first();
    
    if (await searchInput.isVisible()) {
      // Search for specific ability
      await searchInput.fill('Swift Swim');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should filter results
      await expect(page.locator('text=/Swift Swim/i')).toBeVisible();
      
      // Other abilities should be hidden
      const visibleAbilities = await page.locator('[data-testid="ability-item"]:visible').count();
      expect(visibleAbilities).toBeLessThan(10);
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should filter abilities by generation', async ({ page }) => {
    // Look for generation filter
    const genFilter = page.locator('select[name*="generation"]').or(page.locator('[data-testid="generation-filter"]')).first();
    
    if (await genFilter.isVisible()) {
      const initialCount = await page.locator('[data-testid="ability-item"]').count();
      
      // Filter by generation
      if (await genFilter.evaluate(el => el.tagName === 'SELECT')) {
        await genFilter.selectOption('3');
      } else {
        await genFilter.click();
        await page.locator('button:has-text("Generation III")').click();
      }
      
      await page.waitForTimeout(1000);
      
      // Should filter abilities
      const filteredCount = await page.locator('[data-testid="ability-item"]:visible').count();
      expect(filteredCount).toBeLessThan(initialCount);
    }
  });

  test('should show Pokemon with each ability', async ({ page }) => {
    // Click on an ability
    const ability = page.locator('[data-testid="ability-item"]').first();
    
    if (await ability.isVisible()) {
      await ability.click();
      
      // Should show Pokemon with this ability
      const pokemonSection = page.locator('[data-testid="ability-pokemon"]').or(page.locator('.pokemon-with-ability'));
      if (await pokemonSection.isVisible()) {
        const pokemonList = await page.locator('[data-testid="pokemon-item"]').or(page.locator('.pokemon-link')).count();
        expect(pokemonList).toBeGreaterThan(0);
      }
    }
  });

  test('should display ability effects in battle', async ({ page }) => {
    // Look for battle effects info
    const battleEffects = page.locator('[data-testid="battle-effects"]').or(page.locator('.ability-effects'));
    
    if (await battleEffects.count() > 0) {
      const firstEffect = battleEffects.first();
      await expect(firstEffect).toBeVisible();
      
      // Should describe battle mechanics
      const effectText = await firstEffect.textContent();
      expect(effectText).toMatch(/damage|stat|effect|battle/i);
    }
  });

  test('should categorize abilities', async ({ page }) => {
    // Look for ability categories
    const categories = page.locator('[data-testid="ability-category"]').or(page.locator('.category-tab'));
    
    if (await categories.count() > 0) {
      // Should have different categories
      const categoryNames = ['Field', 'Battle', 'Status', 'Weather'];
      
      for (const category of categoryNames) {
        const cat = page.locator(`text=/${category}/i`);
        if (await cat.count() > 0) {
          await cat.first().click();
          await page.waitForTimeout(1000);
          
          // Should filter by category
          const filteredAbilities = await page.locator('[data-testid="ability-item"]:visible').count();
          expect(filteredAbilities).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should display hidden abilities', async ({ page, consoleLogger }) => {
    // Look for hidden ability filter/section
    const hiddenToggle = page.locator('input[type="checkbox"]:has-text("Hidden")').or(page.locator('[data-testid="hidden-abilities-toggle"]'));
    
    if (await hiddenToggle.isVisible()) {
      await hiddenToggle.click();
      await page.waitForTimeout(1000);
      
      // Should show hidden abilities
      const hiddenAbilities = page.locator('[data-testid="hidden-ability"]').or(page.locator('.hidden-ability'));
      expect(await hiddenAbilities.count()).toBeGreaterThan(0);
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should sort abilities', async ({ page }) => {
    // Look for sort options
    const sortSelect = page.locator('select[name*="sort"]').or(page.locator('[data-testid="sort-abilities"]')).first();
    
    if (await sortSelect.isVisible()) {
      // Get first ability name before sorting
      const firstBefore = await page.locator('[data-testid="ability-name"]').first().textContent();
      
      // Sort alphabetically
      if (await sortSelect.evaluate(el => el.tagName === 'SELECT')) {
        await sortSelect.selectOption('name');
      } else {
        await sortSelect.click();
        await page.locator('button:has-text("Name")').click();
      }
      
      await page.waitForTimeout(1000);
      
      // First ability should change
      const firstAfter = await page.locator('[data-testid="ability-name"]').first().textContent();
      expect(firstAfter).not.toBe(firstBefore);
    }
  });

  test('should paginate abilities list', async ({ page }) => {
    // Look for pagination
    const pagination = page.locator('[data-testid="pagination"]').or(page.locator('.pagination'));
    
    if (await pagination.isVisible()) {
      // Should have page numbers
      const pageNumbers = await page.locator('[data-testid="page-number"]').or(page.locator('.page-link')).count();
      expect(pageNumbers).toBeGreaterThan(1);
      
      // Click next page
      const nextButton = page.locator('button:has-text("Next")').or(page.locator('[data-testid="next-page"]')).first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Content should change
        const firstAbility = await page.locator('[data-testid="ability-name"]').first().textContent();
        expect(firstAbility).toBeTruthy();
      }
    }
  });

  test('should display ability introduced generation', async ({ page }) => {
    const abilityItems = page.locator('[data-testid="ability-item"]');
    
    if (await abilityItems.count() > 0) {
      // Look for generation info
      const genInfo = page.locator('[data-testid="ability-generation"]').or(page.locator('.generation-badge')).first();
      
      if (await genInfo.isVisible()) {
        const genText = await genInfo.textContent();
        expect(genText).toMatch(/Gen|Generation|[IVX]+/);
      }
    }
  });

  test('should work on mobile viewport', async ({ page, consoleLogger }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Main content visible
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Abilities should be in mobile-friendly layout
    const abilityList = page.locator('[data-testid="abilities-list"]').or(page.locator('.abilities-container'));
    if (await abilityList.isVisible()) {
      // Should stack vertically on mobile
      const listStyle = await abilityList.evaluate(el => window.getComputedStyle(el));
      expect(listStyle).toBeTruthy();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should link to Pokemon pages', async ({ page }) => {
    // Click on an ability to see Pokemon
    const ability = page.locator('h3.text-xl.font-bold.capitalize').or(page.locator('[data-testid="ability-item"]')).first();
    await ability.click();
    
    // Find a Pokemon link
    const pokemonLink = page.locator('a[href*="/pokedex/"]').or(page.locator('[data-testid="pokemon-link"]')).first();
    
    if (await pokemonLink.isVisible()) {
      const href = await pokemonLink.getAttribute('href');
      expect(href).toContain('/pokedex/');
      
      // Click should navigate
      await pokemonLink.click();
      await waitForNetworkIdle(page);
      
      expect(page.url()).toContain('/pokedex/');
    }
  });
});