import { test, expect } from '@playwright/test';

test.describe('Feature Pages Data Loading', () => {
  test.setTimeout(60000); // 60 seconds for API calls

  test('Items page loads all items with search and pagination', async ({ page }) => {
    await page.goto('http://localhost:3001/pokemon/items');
    
    // Wait for items to load
    await page.waitForSelector('[data-testid="items-grid"], .grid', { timeout: 30000 });
    
    // Check that items are loaded
    const items = await page.locator('.grid > div').count();
    console.log(`Found ${items} items on first page`);
    expect(items).toBeGreaterThan(0);
    
    // Test search
    await page.fill('input[placeholder*="Search items"]', 'potion');
    await page.waitForTimeout(500); // Wait for filtering
    
    const searchResults = await page.locator('.grid > div').count();
    console.log(`Search for "potion" found ${searchResults} items`);
    expect(searchResults).toBeGreaterThan(0);
    
    // Clear search
    await page.fill('input[placeholder*="Search items"]', '');
    await page.waitForTimeout(500);
    
    // Test category filter
    const berryButton = page.locator('button:has-text("Berries")').first();
    await berryButton.click();
    await page.waitForTimeout(500);
    
    const berryResults = await page.locator('.grid > div').count();
    console.log(`Berry category has ${berryResults} items`);
    expect(berryResults).toBeGreaterThan(0);
    
    // Test pagination (if available)
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      const page2Items = await page.locator('.grid > div').count();
      console.log(`Page 2 has ${page2Items} items`);
      expect(page2Items).toBeGreaterThan(0);
    }
  });

  test('Abilities page loads all abilities with filtering', async ({ page }) => {
    await page.goto('http://localhost:3001/pokemon/abilities');
    
    // Wait for abilities to load
    await page.waitForSelector('[data-testid="abilities-grid"], .grid', { timeout: 30000 });
    
    // Check that abilities are loaded
    const abilities = await page.locator('.grid > div').count();
    console.log(`Found ${abilities} abilities on first page`);
    expect(abilities).toBeGreaterThan(0);
    
    // Test search
    await page.fill('input[placeholder*="Search abilities"]', 'intimidate');
    await page.waitForTimeout(500);
    
    const searchResults = await page.locator('.grid > div').count();
    console.log(`Search for "intimidate" found ${searchResults} abilities`);
    expect(searchResults).toBeGreaterThan(0);
    
    // Clear search
    await page.fill('input[placeholder*="Search abilities"]', '');
    await page.waitForTimeout(500);
    
    // Test category filter
    const offensiveButton = page.locator('button:has-text("Offensive")').first();
    await offensiveButton.click();
    await page.waitForTimeout(500);
    
    const offensiveResults = await page.locator('.grid > div').count();
    console.log(`Offensive category has ${offensiveResults} abilities`);
    expect(offensiveResults).toBeGreaterThan(0);
    
    // Test hidden abilities toggle
    const hiddenToggle = page.locator('button:has-text("Hidden")');
    if (await hiddenToggle.isVisible()) {
      await hiddenToggle.click();
      await page.waitForTimeout(500);
    }
  });

  test('Moves page loads all moves with TM data', async ({ page }) => {
    await page.goto('http://localhost:3001/pokemon/moves');
    
    // Wait for moves to load  
    await page.waitForSelector('[data-testid="moves-grid"], .grid', { timeout: 30000 });
    
    // Check that moves are loaded
    const moves = await page.locator('.grid > div').count();
    console.log(`Found ${moves} moves on first page`);
    expect(moves).toBeGreaterThan(0);
    
    // Look for TM badges
    const tmBadges = await page.locator('span:has-text("TM")').count();
    console.log(`Found ${tmBadges} TM badges on this page`);
    
    // Test search
    await page.fill('input[placeholder*="Search moves"]', 'thunder');
    await page.waitForTimeout(500);
    
    const searchResults = await page.locator('.grid > div').count();
    console.log(`Search for "thunder" found ${searchResults} moves`);
    expect(searchResults).toBeGreaterThan(0);
    
    // Clear search
    await page.fill('input[placeholder*="Search moves"]', '');
    await page.waitForTimeout(500);
    
    // Test category filter - Physical
    const physicalButton = page.locator('button:has-text("Physical")').first();
    await physicalButton.click();
    await page.waitForTimeout(500);
    
    const physicalResults = await page.locator('.grid > div').count();
    console.log(`Physical category has ${physicalResults} moves`);
    expect(physicalResults).toBeGreaterThan(0);
    
    // Test generation filter
    const gen1Button = page.locator('button:has-text("Gen 1")').first();
    await gen1Button.click();
    await page.waitForTimeout(500);
    
    const gen1Results = await page.locator('.grid > div').count();
    console.log(`Gen 1 has ${gen1Results} moves`);
    expect(gen1Results).toBeGreaterThan(0);
  });

  test('Type Effectiveness calculator works', async ({ page }) => {
    await page.goto('http://localhost:3001/type-effectiveness');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Type Effectiveness")', { timeout: 10000 });
    
    // Test calculator mode (should be default)
    const attackerSection = page.locator('h3:has-text("Attacking Type")');
    expect(await attackerSection.isVisible()).toBeTruthy();
    
    // Select Fire as attacker
    const fireAttacker = page.locator('button').filter({ hasText: 'Fire' }).first();
    await fireAttacker.click();
    
    // Select Grass as defender
    const grassDefender = page.locator('h3:has-text("Defending Type")').locator('..').locator('button').filter({ hasText: 'Grass' }).first();
    await grassDefender.click();
    
    // Check for effectiveness result
    await page.waitForSelector('text=/Super Effective|2×/', { timeout: 5000 });
    
    // Test Type Chart mode
    const chartButton = page.locator('button:has-text("Type Chart")');
    await chartButton.click();
    await page.waitForTimeout(500);
    
    // Check that chart is visible
    const chartTable = page.locator('table');
    expect(await chartTable.isVisible()).toBeTruthy();
    
    // Test Team Analyzer mode
    const teamButton = page.locator('button:has-text("Team Analyzer")');
    await teamButton.click();
    await page.waitForTimeout(500);
    
    // Check that team slots are visible
    const teamSlots = await page.locator('label:has-text("Pokemon")').count();
    console.log(`Found ${teamSlots} team slots`);
    expect(teamSlots).toBe(6);
  });

  test('EV Optimizer page works', async ({ page }) => {
    await page.goto('http://localhost:3001/team-builder');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Team Builder")', { timeout: 10000 });
    
    // Check for EV/IV section
    const evSection = await page.locator('text=/EV.*IV|Stats/i').first();
    if (await evSection.isVisible()) {
      console.log('Found EV/IV section in Team Builder');
    }
    
    // Look for stat sliders or inputs
    const statInputs = await page.locator('input[type="range"], input[type="number"]').count();
    console.log(`Found ${statInputs} stat input controls`);
    
    // Check for team slots
    const teamSlots = await page.locator('[data-testid*="team-slot"], .team-slot, div:has-text("Slot")').count();
    console.log(`Found ${teamSlots} team member slots`);
  });
});