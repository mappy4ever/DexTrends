import { test, expect } from '@playwright/test';

test.describe('EV Optimizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/team-builder/ev-optimizer');
  });

  test('should display EV optimizer page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/EV Optimizer/);
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('EV Optimizer');
    
    // Check search input is present
    await expect(page.locator('input[placeholder="Search Pokemon..."]')).toBeVisible();
  });

  test('should search and select Pokemon', async ({ page }) => {
    // Search for Garchomp
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('garchomp');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Click on Garchomp
    const garchomp = page.locator('button:has-text("garchomp")').first();
    await expect(garchomp).toBeVisible({ timeout: 5000 });
    await garchomp.click();
    
    // Check if Pokemon is selected
    await expect(page.locator('h3:has-text("garchomp")')).toBeVisible();
    
    // Check if EV Heat Map is displayed
    await expect(page.locator('h3:has-text("EV Optimization Heat Map")')).toBeVisible();
  });

  test('should display stat charts', async ({ page }) => {
    // Select a Pokemon first
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('lucario');
    await page.waitForTimeout(1000);
    
    const lucario = page.locator('button:has-text("lucario")').first();
    await lucario.click();
    
    // Check for charts
    await expect(page.locator('h4:has-text("Stat Distribution")')).toBeVisible();
    await expect(page.locator('h4:has-text("EV Allocation")')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(2); // Radar and Bar charts
  });

  test('should update EVs with sliders', async ({ page }) => {
    // Select a Pokemon
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('pikachu');
    await page.waitForTimeout(1000);
    
    const pikachu = page.locator('button:has-text("pikachu")').first();
    await pikachu.click();
    
    // Find an EV slider
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    
    // Change slider value
    await slider.fill('252');
    
    // Check if EV value updated
    await expect(page.locator('span:has-text("252"):has-text("EVs")')).toBeVisible();
  });

  test('should apply competitive spreads', async ({ page }) => {
    // Select a Pokemon
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('charizard');
    await page.waitForTimeout(1000);
    
    const charizard = page.locator('button:has-text("charizard")').first();
    await charizard.click();
    
    // Click on a competitive spread
    const physicalSweeper = page.locator('button:has-text("Physical Sweeper")');
    await expect(physicalSweeper).toBeVisible();
    await physicalSweeper.click();
    
    // Check if spread was applied (should see 252 EVs somewhere)
    await expect(page.locator('text=/252.*EVs/').first()).toBeVisible();
  });

  test('should calculate speed tiers', async ({ page }) => {
    // Select a Pokemon
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('greninja');
    await page.waitForTimeout(1000);
    
    const greninja = page.locator('button:has-text("greninja")').first();
    await greninja.click();
    
    // Check speed calculator section
    await expect(page.locator('h3:has-text("Speed Calculator")')).toBeVisible();
    
    // Toggle Choice Scarf
    const choiceScarf = page.locator('label:has-text("Choice Scarf")').locator('input');
    await choiceScarf.check();
    
    // Speed should be displayed
    await expect(page.locator('text=Current Speed:')).toBeVisible();
  });

  test('should show remaining EVs', async ({ page }) => {
    // Select a Pokemon
    const searchInput = page.locator('input[placeholder="Search Pokemon..."]');
    await searchInput.fill('dragonite');
    await page.waitForTimeout(1000);
    
    const dragonite = page.locator('button:has-text("dragonite")').first();
    await dragonite.click();
    
    // Check remaining EVs display
    await expect(page.locator('text=Remaining EVs:')).toBeVisible();
    await expect(page.locator('text=510')).toBeVisible(); // Should start with 510 remaining
  });
});