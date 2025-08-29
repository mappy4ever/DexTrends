import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/', name: 'Homepage' },
  { path: '/pokedex', name: 'Pokedex' },
  { path: '/tcgsets', name: 'TCG Sets' },
  { path: '/pokemon/moves', name: 'Pokemon Moves' },
  { path: '/pokemon/abilities', name: 'Pokemon Abilities' },
  { path: '/pokemon/items', name: 'Pokemon Items' },
  { path: '/pokemon/starters', name: 'Pokemon Starters' },
  { path: '/pokemon/regions', name: 'Pokemon Regions' },
  { path: '/analytics', name: 'Analytics' },
  { path: '/trending', name: 'Trending' },
  { path: '/battle-simulator', name: 'Battle Simulator' },
  { path: '/type-effectiveness', name: 'Type Effectiveness' },
  { path: '/pocketmode', name: 'Pocket Mode' },
  { path: '/pocketmode/expansions', name: 'Pocket Expansions' },
  { path: '/collections', name: 'Collections' },
  { path: '/market', name: 'Market' }
];

test.describe('QA Smoke Test - Page Loading', () => {
  for (const route of ROUTES) {
    test(`${route.name} loads without errors`, async ({ page }) => {
      // Track console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Track network errors
      const networkErrors: string[] = [];
      page.on('response', response => {
        if (response.status() >= 400 && !response.url().includes('_next')) {
          networkErrors.push(`${response.status()} - ${response.url()}`);
        }
      });

      // Navigate to page
      await page.goto(route.path, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for any dynamic content
      await page.waitForTimeout(2000);

      // Check for loading states that should be gone
      const loadingElements = await page.locator('text=/loading|Loading/i').count();
      expect(loadingElements).toBe(0);

      // Check for error messages
      const errorElements = await page.locator('text=/error|Error|failed|Failed/i').count();
      expect(errorElements).toBe(0);

      // Check that main content is visible
      const mainContent = await page.locator('main, [role="main"], .container').first().isVisible();
      expect(mainContent).toBe(true);

      // Report any console errors (but don't fail for warnings)
      if (consoleErrors.length > 0) {
        console.log(`Console errors on ${route.name}:`, consoleErrors);
      }

      // Fail on network errors
      expect(networkErrors).toHaveLength(0);
    });
  }
});