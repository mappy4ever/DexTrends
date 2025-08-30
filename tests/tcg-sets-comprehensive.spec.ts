import { test, expect } from '@playwright/test';

test.describe('TCG Sets Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for these tests as they involve loading many sets
    test.setTimeout(60000);
  });

  test('TCG Sets page loads and displays sets', async ({ page }) => {
    console.log('Testing: TCG Sets page loads and displays sets');
    
    // Navigate to TCG sets page
    await page.goto('http://localhost:3002/tcg-sets');
    
    // Wait for loading to complete
    await expect(page.locator('text="Loading TCG sets"')).toBeVisible();
    
    // Wait for sets to load (should see grid of cards)
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 30000 });
    
    // Check that we have set cards displayed
    const setCards = page.locator('[data-testid="set-card"], .group.animate-fadeIn');
    await expect(setCards.first()).toBeVisible({ timeout: 15000 });
    
    // Count the sets
    const setCount = await setCards.count();
    console.log(`Found ${setCount} sets displayed`);
    
    // Should have more than 50 sets (testing pagination worked)
    expect(setCount).toBeGreaterThan(50);
    
    // Check for set images
    const setImages = page.locator('img[alt*="set"], img[src*="logo"]');
    await expect(setImages.first()).toBeVisible();
    
    // Check console for success message
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Successfully fetched')) {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    expect(consoleLogs.length).toBeGreaterThan(0);
    console.log('Console logs:', consoleLogs);
  });

  test('Search and filtering works correctly', async ({ page }) => {
    console.log('Testing: Search and filtering functionality');
    
    await page.goto('http://localhost:3002/tcg-sets');
    await page.waitForLoadState('networkidle');
    
    // Wait for sets to load
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 30000 });
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search for a set"]');
    await searchInput.fill('Base');
    
    // Wait for filtering to apply
    await page.waitForTimeout(1000);
    
    // Check that filtered results are shown
    const filteredSets = page.locator('.group.animate-fadeIn');
    const filteredCount = await filteredSets.count();
    console.log(`Filtered to ${filteredCount} sets containing "Base"`);
    
    // Should have at least some Base sets
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(50); // Should be filtered
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // Test sort functionality
    const sortSelect = page.locator('select').filter({ hasText: 'Release Date' }).first();
    await sortSelect.selectOption('name');
    await page.waitForTimeout(1000);
    
    // Test clear filters button
    const clearButton = page.locator('button:has-text("Clear Filters")');
    await clearButton.click();
    await page.waitForTimeout(500);
  });

  test('Individual set page loads correctly', async ({ page }) => {
    console.log('Testing: Individual set page functionality');
    
    // First navigate to sets page
    await page.goto('http://localhost:3002/tcg-sets');
    await page.waitForLoadState('networkidle');
    
    // Wait for sets to load
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 30000 });
    
    // Click on the first valid set
    const firstSet = page.locator('.group.animate-fadeIn').first();
    await expect(firstSet).toBeVisible();
    
    // Get the set name before clicking
    const setName = await firstSet.locator('h3, .text-xl').textContent();
    console.log(`Clicking on set: ${setName}`);
    
    // Click the set
    await firstSet.click();
    
    // Should navigate to set detail page
    await expect(page).toHaveURL(/\/tcgsets\/[a-z]+\d+/i, { timeout: 10000 });
    
    // Wait for set info to load
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    
    // Check for set statistics
    await expect(page.locator('text="Set Statistics"')).toBeVisible({ timeout: 10000 });
    
    // Check for cards grid
    const cardsGrid = page.locator('[data-testid="card-grid"], .grid').filter({ has: page.locator('img') });
    await expect(cardsGrid).toBeVisible({ timeout: 15000 });
    
    // Check that cards are displayed
    const cardImages = page.locator('img[alt*="card"], img[src*="pokemontcg.io"]');
    await expect(cardImages.first()).toBeVisible();
    
    const cardCount = await cardImages.count();
    console.log(`Found ${cardCount} cards in the set`);
    expect(cardCount).toBeGreaterThan(0);
  });

  test('Error handling for invalid set IDs', async ({ page }) => {
    console.log('Testing: Error handling for invalid set IDs');
    
    // Try to navigate to an invalid set
    await page.goto('http://localhost:3002/tcgsets/invalid123xyz');
    
    // Should show error message
    await expect(page.locator('text="Error"')).toBeVisible({ timeout: 15000 });
    
    // Should have specific error message about invalid format
    const errorMessage = page.locator('text=/not found|invalid/i');
    await expect(errorMessage).toBeVisible();
    
    // Should have back button
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeVisible();
    
    // Click back button
    await backButton.click();
    
    // Should navigate back to sets page
    await expect(page).toHaveURL(/\/tcgsets$/, { timeout: 10000 });
  });

  test('Refresh button works correctly', async ({ page }) => {
    console.log('Testing: Refresh button functionality');
    
    await page.goto('http://localhost:3002/tcg-sets');
    await page.waitForLoadState('networkidle');
    
    // Wait for initial load
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 30000 });
    
    // Find and click refresh button
    const refreshButton = page.locator('button:has-text("Refresh Sets")');
    await expect(refreshButton).toBeVisible();
    
    // Click refresh
    await refreshButton.click();
    
    // Should show loading state again
    await expect(page.locator('text="Loading TCG sets"')).toBeVisible();
    
    // Wait for reload to complete
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 30000 });
    
    // Sets should still be displayed
    const setCards = page.locator('.group.animate-fadeIn');
    const setCount = await setCards.count();
    expect(setCount).toBeGreaterThan(50);
  });

  test('Infinite scroll works for filtered results', async ({ page }) => {
    console.log('Testing: Infinite scroll with filtered results');
    
    await page.goto('http://localhost:3002/tcg-sets');
    await page.waitForLoadState('networkidle');
    
    // Wait for sets to load
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 30000 });
    
    // Get initial count
    const initialCards = await page.locator('.group.animate-fadeIn').count();
    console.log(`Initial visible sets: ${initialCards}`);
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Check if more sets loaded (if there are more to load)
    const afterScrollCards = await page.locator('.group.animate-fadeIn').count();
    console.log(`After scroll visible sets: ${afterScrollCards}`);
    
    // If there were more sets to load, count should increase
    if (initialCards < 100) {
      expect(afterScrollCards).toBeGreaterThan(initialCards);
    }
  });

  test('Performance: Page loads within acceptable time', async ({ page }) => {
    console.log('Testing: Page load performance');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:3002/tcg-sets');
    
    // Wait for first contentful paint
    await expect(page.locator('h1:has-text("Pokémon TCG Sets")')).toBeVisible();
    
    const headerLoadTime = Date.now() - startTime;
    console.log(`Header loaded in ${headerLoadTime}ms`);
    expect(headerLoadTime).toBeLessThan(3000); // Should load header within 3s
    
    // Wait for sets to start appearing
    await expect(page.locator('.group.animate-fadeIn').first()).toBeVisible({ timeout: 10000 });
    
    const firstSetLoadTime = Date.now() - startTime;
    console.log(`First set visible in ${firstSetLoadTime}ms`);
    expect(firstSetLoadTime).toBeLessThan(10000); // First set should appear within 10s
  });
});