import { test, expect } from '@playwright/test';

test.describe('Advanced Team Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/team-builder/advanced');
  });

  test('should display team builder page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Advanced Team Builder/);
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Advanced Team Builder');
    
    // Check tabs are present
    await expect(page.locator('button:has-text("Team Builder")')).toBeVisible();
    await expect(page.locator('button:has-text("Synergy Analysis")')).toBeVisible();
    await expect(page.locator('button:has-text("Export/Import")')).toBeVisible();
  });

  test('should search for Pokemon', async ({ page }) => {
    // Type in search box
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('pikachu');
    
    // Wait for search results
    await page.waitForTimeout(1000); // Wait for debounce
    
    // Check if Pikachu appears in results
    const pikachu = page.locator('button:has-text("pikachu")').first();
    await expect(pikachu).toBeVisible({ timeout: 5000 });
  });

  test('should add Pokemon to team', async ({ page }) => {
    // Search for a Pokemon
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('pikachu');
    await page.waitForTimeout(1000);
    
    // Click on Pikachu to add to team
    const pikachu = page.locator('button:has-text("pikachu")').first();
    await pikachu.click();
    
    // Check if Pokemon was added to team
    await expect(page.locator('text=Your Team (1/6)')).toBeVisible();
    await expect(page.locator('.capitalize:has-text("pikachu")')).toBeVisible();
  });

  test('should switch to synergy analysis tab', async ({ page }) => {
    // Add a Pokemon first
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('charizard');
    await page.waitForTimeout(1000);
    
    const charizard = page.locator('button:has-text("charizard")').first();
    await charizard.click();
    
    // Switch to Synergy Analysis tab
    await page.locator('button:has-text("Synergy Analysis")').click();
    
    // Check if synergy graph is visible
    await expect(page.locator('h3:has-text("Team Synergy Network")')).toBeVisible();
    await expect(page.locator('canvas#synergy-graph')).toBeVisible();
  });

  test('should export team data', async ({ page }) => {
    // Add a Pokemon
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('mew');
    await page.waitForTimeout(1000);
    
    const mew = page.locator('button:has-text("mew")').first();
    await mew.click();
    
    // Switch to Export tab
    await page.locator('button:has-text("Export/Import")').click();
    
    // Check export button is enabled
    const exportButton = page.locator('button:has-text("Export Team as JSON")');
    await expect(exportButton).toBeEnabled();
    
    // Check Showdown format textarea
    const showdownFormat = page.locator('textarea');
    await expect(showdownFormat).toBeVisible();
    await expect(showdownFormat).toContainText('mew');
  });
});

test.describe('Team Synergy Analysis', () => {
  test('should calculate type coverage correctly', async ({ page }) => {
    await page.goto('/team-builder/advanced');
    
    // Add multiple Pokemon with different types
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    
    // Add Charizard (Fire/Flying)
    await searchInput.fill('charizard');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("charizard")').first().click();
    
    // Add Blastoise (Water)
    await searchInput.fill('blastoise');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("blastoise")').first().click();
    
    // Add Venusaur (Grass/Poison)
    await searchInput.fill('venusaur');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("venusaur")').first().click();
    
    // Go to Synergy Analysis
    await page.locator('button:has-text("Synergy Analysis")').click();
    
    // Check type coverage analysis
    await expect(page.locator('h3:has-text("Type Coverage Analysis")')).toBeVisible();
    await expect(page.locator('text=Defensive Score:')).toBeVisible();
  });
});