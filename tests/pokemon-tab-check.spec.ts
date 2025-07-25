import { test, expect } from '@playwright/test';

test.describe('Pokemon Tab Check', () => {
  test('tabs should be clickable', async ({ page }) => {
    // Navigate to Pikachu's page
    await page.goto('/pokedex/25');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Pikachu")', { timeout: 20000 });
    
    // Look for any tab button
    const tabButton = page.locator('button').filter({ hasText: 'Stats' }).first();
    
    // Check if the tab button exists
    await expect(tabButton).toBeVisible({ timeout: 10000 });
    
    // Click the Stats tab
    await tabButton.click();
    
    // Verify stats content appears
    await expect(page.locator('text=Base Stats').first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Tab click test passed!');
  });
});