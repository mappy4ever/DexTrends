import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../config/api';

test.describe('Pokemon Tabs UI Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Go to a Pokemon page
    await page.goto(TEST_URLS.pokemon(25)); // Pikachu
    await page.waitForLoadState('networkidle');
  });

  test('All tabs should be visible and clickable', async ({ page }) => {
    // Check if all tabs are present
    await expect(page.getByRole('button', { name: /Overview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Stats/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Evolution/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Moves/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Breeding/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Locations/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Competitive/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cards/i })).toBeVisible();
  });

  test('Stats tab should display without errors', async ({ page }) => {
    // Click stats tab
    await page.getByRole('button', { name: /Stats/i }).click();
    
    // Check for key elements
    await expect(page.getByText(/Stats Distribution/i)).toBeVisible();
    await expect(page.getByText(/Nature/i)).toBeVisible();
    await expect(page.getByText(/Level/i)).toBeVisible();
    await expect(page.getByText(/EV Yield/i)).toBeVisible();
    
    // Check that stats are displayed
    await expect(page.getByText(/HP/)).toBeVisible();
    await expect(page.getByText(/Attack/)).toBeVisible();
    await expect(page.getByText(/Defense/)).toBeVisible();
    
    // Check for total stats and rating
    await expect(page.getByText(/Total/i)).toBeVisible();
  });

  test('Evolution tab should display without errors', async ({ page }) => {
    // Click evolution tab
    await page.getByRole('button', { name: /Evolution/i }).click();
    
    // Check for key elements
    await expect(page.getByText(/Evolution Chain/i)).toBeVisible();
    
    // Check for Pikachu's evolution chain
    await expect(page.getByText(/pichu/i)).toBeVisible();
    await expect(page.getByText(/pikachu/i)).toBeVisible();
    await expect(page.getByText(/raichu/i)).toBeVisible();
  });

  test('Locations tab should display without errors', async ({ page }) => {
    // Click locations tab
    await page.getByRole('button', { name: /Locations/i }).click();
    
    // Check for either location data or no data message
    const hasLocationData = await page.locator('text=/Natural Habitat|Filter by Era/i').isVisible().catch(() => false);
    
    if (!hasLocationData) {
      // Should show no location data message
      await expect(page.getByText(/No Location Data Available/i)).toBeVisible();
    } else {
      // Should show filters and location info
      await expect(page.getByText(/Filter by Era/i)).toBeVisible();
    }
  });

  test('Tab switching should work smoothly', async ({ page }) => {
    // Test switching between multiple tabs
    await page.getByRole('button', { name: /Stats/i }).click();
    await expect(page.getByText(/Stats Distribution/i)).toBeVisible();
    
    await page.getByRole('button', { name: /Evolution/i }).click();
    await expect(page.getByText(/Evolution Chain/i)).toBeVisible();
    
    await page.getByRole('button', { name: /Breeding/i }).click();
    await expect(page.getByText(/Egg Groups/i)).toBeVisible();
    
    // Switch back to Overview
    await page.getByRole('button', { name: /Overview/i }).click();
    await expect(page.getByText(/Base Stats/i)).toBeVisible();
  });

  test('UI elements should use consistent styling', async ({ page }) => {
    // Check that GlassContainer elements are present
    const glassContainers = await page.locator('[class*="backdrop-blur-xl"]').count();
    expect(glassContainers).toBeGreaterThan(0);
    
    // Check for consistent border styling
    const borderedElements = await page.locator('[class*="border-gray-200"][class*="dark:border-gray-700"]').count();
    expect(borderedElements).toBeGreaterThan(0);
  });
});