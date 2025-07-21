import { test, expect } from '@playwright/test';

test('simple page load test', async ({ page }) => {
  console.log('Starting simple test...');
  
  // Navigate to homepage first
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Homepage loaded');
  
  // Check if homepage has expected content
  await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  console.log('Homepage heading found');
  
  // Try battle simulator
  await page.goto('/battle-simulator', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Battle simulator page loaded');
  
  // Look for the main heading
  const heading = page.locator('h1:has-text("Pokemon Battle Simulator")');
  await expect(heading).toBeVisible({ timeout: 10000 });
  console.log('Battle simulator heading found');
});