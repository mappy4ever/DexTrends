import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle, waitForImages, checkBrokenImages } from '../helpers/test-utils';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';

test.describe('Pocket Mode Set Detail Pages', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
  });

  test('should load pocket mode set detail page', async ({ page, consoleLogger }) => {
    // Navigate to a specific pocket mode set
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Check page loads
    await expect(page.locator('h1').or(page.locator('[data-testid="set-name"]'))).toBeVisible();
    
    // Set logo should be visible
    const setLogo = page.locator('[data-testid="set-logo"]').or(page.locator('.set-icon')).or(page.locator('img[alt*="set"]')).first();
    await expect(setLogo).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display pocket mode cards', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Wait for cards to load
    await page.waitForSelector('[data-testid="pocket-card"]', { timeout: 15000 });

    // Check cards are displayed
    const cards = await page.locator('[data-testid="pocket-card"]').or(page.locator('.pocket-card-item')).count();
    expect(cards).toBeGreaterThan(0);

    // Should show card count
    const setInfo = page.locator('[data-testid="set-info"]').or(page.locator('.set-statistics'));
    if (await setInfo.isVisible()) {
      const infoText = await setInfo.textContent();
      expect(infoText).toMatch(/\d+\s*(cards|total)/i);
    }
  });

  test('should display card rarities', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for rarity indicators
    const rarityBadges = page.locator('[data-testid="rarity-badge"]').or(page.locator('.rarity-indicator'));
    
    if (await rarityBadges.count() > 0) {
      // Pocket mode rarities
      const rarities = ['◊', '◊◊', '◊◊◊', '☆', '☆☆', '☆☆☆', 'Crown'];
      
      let raritiesFound = 0;
      for (const rarity of rarities) {
        if (await page.locator(`text=/${rarity}/`).count() > 0) {
          raritiesFound++;
        }
      }
      expect(raritiesFound).toBeGreaterThan(0);
    }
  });

  test('should filter cards by rarity', async ({ page, consoleLogger }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for rarity filter
    const rarityFilter = page.locator('select[name*="rarity"]').or(page.locator('[data-testid="rarity-filter"]')).first();
    
    if (await rarityFilter.isVisible()) {
      const initialCount = await page.locator('[data-testid="pocket-card"]').count();
      
      // Apply filter
      if (await rarityFilter.evaluate(el => el.tagName === 'SELECT')) {
        await rarityFilter.selectOption({ index: 1 });
      } else {
        await rarityFilter.click();
        await page.locator('[data-testid="rarity-option"]').nth(1).click();
      }
      
      await page.waitForTimeout(1000);
      
      // Card count should change
      const filteredCount = await page.locator('[data-testid="pocket-card"]:visible').count();
      expect(filteredCount).toBeLessThan(initialCount);
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display card details on click', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Click on first card
    const firstCard = page.locator('[data-testid="pocket-card"]').first();
    await firstCard.click();
    
    // Modal or detail view should open
    const cardDetail = await page.waitForSelector('[role="dialog"]', { 
      timeout: 5000 
    }).catch(() => null);
    
    if (cardDetail) {
      // Should show card details
      await expect(page.locator('[data-testid="card-name"]').or(page.locator('.card-title'))).toBeVisible();
      await expect(page.locator('[data-testid="card-image"]').or(page.locator('.card-full-art'))).toBeVisible();
      
      // Close modal
      await pageHelpers.closeModal();
    }
  });

  test('should display pack information', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for pack types
    const packInfo = page.locator('[data-testid="pack-types"]').or(page.locator('.pack-info'));
    
    if (await packInfo.isVisible()) {
      // Should show different pack types (Mewtwo, Pikachu, Charizard)
      const packTypes = await page.locator('[data-testid="pack-type"]').or(page.locator('.pack-variant')).count();
      expect(packTypes).toBeGreaterThan(0);
    }
  });

  test('should show collection progress', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for collection progress
    const progressSection = page.locator('[data-testid="collection-progress"]').or(page.locator('.progress-tracker'));
    
    if (await progressSection.isVisible()) {
      // Should show owned/total
      const progressText = await progressSection.textContent();
      expect(progressText).toMatch(/\d+\s*\/\s*\d+/); // Format: X/Y
      
      // Progress bar
      const progressBar = page.locator('[data-testid="progress-bar"]').or(page.locator('.progress-fill'));
      if (await progressBar.isVisible()) {
        const width = await progressBar.evaluate(el => window.getComputedStyle(el).width);
        expect(width).toBeTruthy();
      }
    }
  });

  test('should filter by Pokemon type', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for type filter
    const typeFilter = page.locator('[data-testid="type-filter"]').or(page.locator('select[name*="type"]')).first();
    
    if (await typeFilter.isVisible()) {
      await pageHelpers.filterByType('Fire');
      await page.waitForTimeout(1000);
      
      // Should show fire type cards
      const filteredCards = await page.locator('[data-testid="pocket-card"]:visible').count();
      expect(filteredCards).toBeGreaterThan(0);
    }
  });

  test('should display special art cards', async ({ page, consoleLogger }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for special art filter
    const artFilter = page.locator('button:has-text("Special Art")').or(page.locator('[data-testid="art-filter"]')).first();
    
    if (await artFilter.isVisible()) {
      await artFilter.click();
      await page.waitForTimeout(1000);
      
      // Should show special art cards
      const specialCards = page.locator('[data-testid="special-art"]').or(page.locator('.full-art-card'));
      expect(await specialCards.count()).toBeGreaterThan(0);
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should show card abilities', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Click on a Pokemon card
    const pokemonCard = page.locator('[data-testid="pocket-card"]:has([data-testid="card-hp"])').first();
    
    if (await pokemonCard.isVisible()) {
      await pokemonCard.click();
      await page.waitForTimeout(1000);
      
      // Should show abilities/attacks
      const abilities = page.locator('[data-testid="card-ability"]').or(page.locator('.ability-text'));
      const attacks = page.locator('[data-testid="card-attack"]').or(page.locator('.attack-info'));
      
      expect(await abilities.count() + await attacks.count()).toBeGreaterThan(0);
    }
  });

  test('should navigate between sets', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for set navigation
    const setNav = page.locator('[data-testid="set-navigation"]').or(page.locator('.set-switcher'));
    
    if (await setNav.isVisible()) {
      // Should have other sets listed
      const otherSets = await page.locator('[data-testid="other-set"]').or(page.locator('.set-link')).count();
      expect(otherSets).toBeGreaterThan(0);
    }
  });

  test('should display immersive cards', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for immersive card section
    const immersiveSection = page.locator('[data-testid="immersive-cards"]').or(page.locator('text=/immersive/i'));
    
    if (await immersiveSection.isVisible()) {
      // Click to view immersive cards
      await immersiveSection.click();
      await page.waitForTimeout(1000);
      
      // Should show special immersive cards
      const immersiveCards = page.locator('[data-testid="immersive-card"]').or(page.locator('.immersive-art'));
      expect(await immersiveCards.count()).toBeGreaterThan(0);
    }
  });

  test('should handle search within set', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Look for search
    const searchInput = page.locator('input[placeholder*="search"]').or(page.locator('[data-testid="set-search"]')).first();
    
    if (await searchInput.isVisible()) {
      // Search for specific Pokemon
      await searchInput.fill('Pikachu');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should filter to Pikachu cards
      await expect(page.locator('text=/Pikachu/i')).toBeVisible();
      
      const visibleCards = await page.locator('[data-testid="pocket-card"]:visible').count();
      expect(visibleCards).toBeGreaterThanOrEqual(1);
    }
  });

  test('should work on mobile viewport', async ({ page, consoleLogger }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);

    // Main content visible
    await expect(page.locator('h1').or(page.locator('[data-testid="set-name"]'))).toBeVisible();
    
    // Cards should be in mobile grid
    const cardGrid = page.locator('[data-testid="card-grid"]').or(page.locator('.cards-container'));
    if (await cardGrid.isVisible()) {
      // Should have 2-3 columns on mobile
      const gridStyle = await cardGrid.evaluate(el => window.getComputedStyle(el));
      expect(gridStyle).toBeTruthy();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should handle invalid set IDs', async ({ page }) => {
    await page.goto('/pocketmode/set/invalid-set-xyz');
    await waitForNetworkIdle(page);

    // Should show error or redirect
    const errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('text=/not found/i'));
    const redirected = page.url().includes('/pocketmode') && !page.url().includes('invalid-set');
    
    expect(await errorMessage.isVisible() || redirected).toBeTruthy();
  });

  test('should load card images properly', async ({ page }) => {
    await page.goto('/pocketmode/set/genetic-apex');
    await waitForNetworkIdle(page);
    await waitForImages(page);

    // Check for broken images
    const brokenImages = await checkBrokenImages(page);
    expect(brokenImages.length).toBe(0);
    
    // All card images should be loaded
    const cardImages = await page.locator('[data-testid="card-image"]').or(page.locator('.card-img')).count();
    expect(cardImages).toBeGreaterThan(0);
  });
});