import { test, expect } from '@playwright/test';

// Helper to wait for API calls
async function waitForAPI(page: any, pattern: string | RegExp) {
  return page.waitForResponse((response: any) => {
    const url = response.url();
    return typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url);
  });
}

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage loads and navigates to main sections', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Check main elements are visible
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=Explore Pokemon')).toBeVisible();
    await expect(page.locator('text=TCG Sets')).toBeVisible();
    
    // Test navigation to Pokedex
    await page.click('text=Explore Pokemon');
    await expect(page).toHaveURL(/\/pokedex/);
    await expect(page.locator('h1:has-text("Pokédex")')).toBeVisible();
    
    // Navigate back
    await page.goBack();
    
    // Test navigation to TCG
    await page.click('text=TCG Sets');
    await expect(page).toHaveURL(/\/tcgexpansions/);
    await expect(page.locator('h1').first()).toContainText('TCG');
  });

  test('Pokedex search and filter functionality', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Wait for Pokemon to load
    await page.waitForSelector('[data-testid="pokemon-card"]', { timeout: 10000 });
    
    // Test search
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('Pikachu');
    await searchInput.press('Enter');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check that Pikachu appears
    const pikachuCard = page.locator('text=Pikachu').first();
    await expect(pikachuCard).toBeVisible({ timeout: 10000 });
    
    // Test type filter
    const fireTypeButton = page.locator('button:has-text("Fire")').first();
    if (await fireTypeButton.isVisible()) {
      await fireTypeButton.click();
      await page.waitForTimeout(500);
      
      // Verify filter is applied
      const activeFilter = page.locator('.bg-red-500, .bg-orange-500').first();
      await expect(activeFilter).toBeVisible();
    }
    
    // Clear filters
    const clearButton = page.locator('button:has-text("Clear")').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  });

  test('Pokemon detail page displays information', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Wait for cards to load
    await page.waitForSelector('[data-testid="pokemon-card"]', { timeout: 10000 });
    
    // Click first Pokemon card
    const firstPokemon = page.locator('[data-testid="pokemon-card"]').first();
    await firstPokemon.click();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/pokemon\/\d+/);
    
    // Check essential information is displayed
    await expect(page.locator('h1').first()).toBeVisible(); // Pokemon name
    await expect(page.locator('text=/HP|Stats|Abilities/i').first()).toBeVisible();
    
    // Check if tabs exist
    const statsTab = page.locator('text=Stats').first();
    if (await statsTab.isVisible()) {
      await statsTab.click();
      await expect(page.locator('text=/Attack|Defense|Speed/i').first()).toBeVisible();
    }
  });

  test('TCG Expansions loads and displays sets', async ({ page }) => {
    await page.goto('/tcgexpansions');
    
    // Wait for sets to load
    await page.waitForSelector('img[alt*="logo"], img[alt*="set"]', { timeout: 15000 });
    
    // Check that sets are displayed
    const setCards = page.locator('a[href*="/tcgexpansions/"]');
    await expect(setCards.first()).toBeVisible();
    
    // Click on first set
    await setCards.first().click();
    
    // Should navigate to set detail
    await expect(page).toHaveURL(/\/tcgexpansions\/.+/);
    
    // Wait for cards to load
    await page.waitForSelector('img[src*="pokemontcg"], img[src*="pokemon"]', { timeout: 15000 });
    
    // Check filter options exist
    const rarityFilter = page.locator('text=/Common|Rare|Holo/i').first();
    await expect(rarityFilter).toBeVisible();
  });

  test('Battle Simulator loads and allows Pokemon selection', async ({ page }) => {
    await page.goto('/battle-simulator');
    
    // Check main battle UI loads
    await expect(page.locator('h1:has-text("Battle"), h1:has-text("Simulator")')).toBeVisible();
    
    // Look for Pokemon selection buttons
    const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose")').first();
    if (await selectButton.isVisible()) {
      await selectButton.click();
      
      // Modal should open
      await expect(page.locator('role=dialog, [role="dialog"]')).toBeVisible({ timeout: 5000 });
      
      // Search for a Pokemon
      const modalSearch = page.locator('dialog input[type="search"], [role="dialog"] input').first();
      if (await modalSearch.isVisible()) {
        await modalSearch.fill('Charizard');
        await modalSearch.press('Enter');
        
        // Select Charizard
        const charizardOption = page.locator('text=Charizard').first();
        await charizardOption.click();
      }
      
      // Close modal
      await page.keyboard.press('Escape');
    }
    
    // Check battle controls exist
    const battleButton = page.locator('button:has-text("Battle"), button:has-text("Start")').first();
    await expect(battleButton).toBeVisible();
  });

  test('Type Effectiveness chart displays correctly', async ({ page }) => {
    await page.goto('/type-effectiveness');
    
    // Check title
    await expect(page.locator('h1:has-text("Type"), h1:has-text("Effectiveness")')).toBeVisible();
    
    // Check type chart loads
    const typeChart = page.locator('text=/Normal|Fire|Water|Grass/i').first();
    await expect(typeChart).toBeVisible();
    
    // Test type selection if available
    const typeButton = page.locator('button:has-text("Fire")').first();
    if (await typeButton.isVisible()) {
      await typeButton.click();
      
      // Check effectiveness display
      await expect(page.locator('text=/Super Effective|Not Very Effective/i').first()).toBeVisible();
    }
  });

  test('Team Builder allows adding Pokemon', async ({ page }) => {
    await page.goto('/team-builder');
    
    // Check page loads
    await expect(page.locator('h1:has-text("Team"), h1:has-text("Builder")')).toBeVisible();
    
    // Look for add Pokemon button
    const addButton = page.locator('button:has-text("Add"), button:has-text("+")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Search modal should open
      const searchModal = page.locator('input[placeholder*="Search"]').first();
      if (await searchModal.isVisible()) {
        await searchModal.fill('Blastoise');
        await searchModal.press('Enter');
        
        // Select Pokemon
        const blastoiseOption = page.locator('text=Blastoise').first();
        if (await blastoiseOption.isVisible()) {
          await blastoiseOption.click();
        }
      }
    }
    
    // Check team slots
    const teamSlots = page.locator('[data-testid="team-slot"], .team-slot');
    await expect(teamSlots.first()).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Mobile navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for mobile menu or bottom navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"], [aria-label="Menu"]').first();
    const bottomNav = page.locator('nav[class*="bottom"], [class*="fixed bottom"]').first();
    
    // Either mobile menu or bottom nav should be visible
    const hasNavigation = await mobileMenu.isVisible() || await bottomNav.isVisible();
    expect(hasNavigation).toBeTruthy();
    
    // If bottom nav exists, test it
    if (await bottomNav.isVisible()) {
      const pokedexButton = bottomNav.locator('a[href="/pokedex"], button:has-text("Pokédex")').first();
      if (await pokedexButton.isVisible()) {
        await pokedexButton.click();
        await expect(page).toHaveURL(/\/pokedex/);
      }
    }
  });

  test('Touch targets are appropriately sized', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Wait for content
    await page.waitForSelector('button, a', { timeout: 10000 });
    
    // Check button sizes
    const buttons = await page.locator('button').all();
    for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
      const box = await button.boundingBox();
      if (box) {
        // Touch targets should be at least 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('Performance', () => {
  test('Pages load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check Core Web Vitals (if available)
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    
    // DOM should be ready quickly
    expect(metrics.domContentLoaded).toBeLessThan(2000);
  });

  test('Images lazy load correctly', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Check for lazy-loaded images
    const images = page.locator('img[loading="lazy"]');
    const lazyCount = await images.count();
    
    // Should have lazy-loaded images
    expect(lazyCount).toBeGreaterThan(0);
    
    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for new images to load
    await page.waitForTimeout(1000);
    
    // Check that images have loaded
    const loadedImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs).filter(img => img.complete && img.naturalHeight > 0).length;
    });
    
    expect(loadedImages).toBeGreaterThan(0);
  });
});

test.describe('Accessibility', () => {
  test('Keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focused element exists
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    
    expect(focusedElement).toBeTruthy();
    
    // Press Enter on focused element
    await page.keyboard.press('Enter');
    
    // Should navigate or perform action
    await page.waitForTimeout(500);
  });

  test('ARIA labels are present', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels on buttons
    const buttons = await page.locator('button[aria-label], button[aria-describedby]').all();
    expect(buttons.length).toBeGreaterThan(0);
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Should only have one h1
  });
});