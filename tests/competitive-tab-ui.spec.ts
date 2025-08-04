import { test, expect } from '@playwright/test';

test.describe('Competitive Tab UI Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Go to a Pokemon page
    await page.goto('http://localhost:3002/pokedex/130'); // Gyarados
    await page.waitForLoadState('networkidle');
    
    // Click on Competitive tab
    await page.getByRole('button', { name: /Competitive/i }).click();
    await page.waitForTimeout(500); // Wait for animations
  });

  test('Competitive tab displays with consistent UI elements', async ({ page }) => {
    // Check for legend section
    await expect(page.getByText(/Competitive Tier Legend/i)).toBeVisible();
    
    // Check for overview section with proper icons
    await expect(page.getByText(/Competitive Overview/i)).toBeVisible();
    
    // Check for format selectors
    await expect(page.getByRole('button', { name: /Singles/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Doubles/i })).toBeVisible();
    
    // Check for the three stat cards
    await expect(page.getByText(/Current Tier/i)).toBeVisible();
    await expect(page.getByText(/Usage Rate/i)).toBeVisible();
    await expect(page.getByText(/Win Rate/i)).toBeVisible();
  });

  test('Tier legend can be toggled', async ({ page }) => {
    // Initially legend should be hidden
    const showButton = page.getByRole('button', { name: /Show Tiers/i });
    await expect(showButton).toBeVisible();
    
    // Click to show legend
    await showButton.click();
    
    // Check that tier descriptions appear
    await expect(page.getByText(/OverUsed - Top tier competitive/i)).toBeVisible();
    await expect(page.getByText(/UnderUsed - Strong Pokémon/i)).toBeVisible();
    
    // Toggle should now say "Hide Tiers"
    await expect(page.getByRole('button', { name: /Hide Tiers/i })).toBeVisible();
  });

  test('Movesets section uses consistent styling', async ({ page }) => {
    // Check for movesets section
    await expect(page.getByText(/Popular Movesets/i)).toBeVisible();
    
    // Check for at least one moveset
    await expect(page.getByText(/Physical Sweeper/i)).toBeVisible();
    
    // Check that usage badges are displayed
    const usageBadges = await page.locator('text=/Usage:.*%/').count();
    expect(usageBadges).toBeGreaterThan(0);
  });

  test('Teammates and Counters sections use consistent colors', async ({ page }) => {
    // Check teammates section
    await expect(page.getByText(/Common Teammates/i)).toBeVisible();
    
    // Check counters section
    await expect(page.getByText(/Top Counters/i)).toBeVisible();
    
    // Check for consistent win rate styling
    const winVsBadges = await page.locator('text=/win vs/').count();
    expect(winVsBadges).toBeGreaterThan(0);
    
    // Check for pair rate badges
    const pairRateBadges = await page.locator('text=/pair rate/').count();
    expect(pairRateBadges).toBeGreaterThan(0);
  });

  test('Speed tiers section displays correctly', async ({ page }) => {
    // Check for speed tiers section
    await expect(page.getByText(/Speed Tiers/i)).toBeVisible();
    
    // Check for the three speed cards
    await expect(page.getByText(/Base Speed/i)).toBeVisible();
    await expect(page.getByText(/Max Speed/i)).toBeVisible();
    await expect(page.getByText(/Scarf Speed/i)).toBeVisible();
    
    // Check calculation note
    await expect(page.getByText(/Speed calculations assume Level 100/i)).toBeVisible();
  });

  test('All sections use GlassContainer with dark variant', async ({ page }) => {
    // Check that GlassContainer elements are present
    const glassContainers = await page.locator('[class*="backdrop-blur-xl"][class*="dark:bg-gray-900/50"]').count();
    expect(glassContainers).toBeGreaterThan(5); // Should have multiple sections
    
    // Check for consistent border styling
    const borderedElements = await page.locator('[class*="border-gray-200"][class*="dark:border-gray-700"]').count();
    expect(borderedElements).toBeGreaterThan(5);
  });

  test('Pokedex numbers display correctly for teammates and counters', async ({ page }) => {
    // Verify that the competitive tab shows the teammates and counters sections
    await expect(page.getByText(/Common Teammates/i)).toBeVisible();
    await expect(page.getByText(/Top Counters/i)).toBeVisible();
    
    // Check for specific Pokedex numbers from the sample data
    // These should be visible anywhere on the page
    await expect(page.getByText('#598').first()).toBeVisible(); // Ferrothorn
    await expect(page.getByText('#645').first()).toBeVisible(); // Landorus-Therian
    await expect(page.getByText('#785').first()).toBeVisible(); // Tapu Koko
    await expect(page.getByText('#485').first()).toBeVisible(); // Heatran
    await expect(page.getByText('#748').first()).toBeVisible(); // Toxapex
    await expect(page.getByText('#479').first()).toBeVisible(); // Rotom-Wash
    await expect(page.getByText('#145').first()).toBeVisible(); // Zapdos
    await expect(page.getByText('#465').first()).toBeVisible(); // Tangrowth
    
    // Verify that Pokemon names are properly formatted
    await expect(page.getByRole('heading', { name: /Ferrothorn/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Landorus Therian/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tapu Koko/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Rotom Wash/i })).toBeVisible();
    
    // Check that no "???" placeholders appear (indicating missing mappings)
    const missingNumbers = page.getByText('#???');
    const missingCount = await missingNumbers.count();
    expect(missingCount).toBe(0);
    
    // Verify that Pokemon images are loading (should have proper src URLs)
    const pokemonImages = await page.locator('img[alt*="Ferrothorn"], img[alt*="Tapu Koko"], img[alt*="Heatran"]').count();
    expect(pokemonImages).toBeGreaterThan(0);
  });
});