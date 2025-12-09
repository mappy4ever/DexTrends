/**
 * Visual Regression Testing
 *
 * Captures screenshots of key pages and compares against baselines.
 * Uses Playwright's built-in visual comparison with configurable thresholds.
 *
 * Usage:
 *   # Generate baselines (first run or after intentional changes)
 *   npx playwright test tests/audit/visual-regression.spec.ts --update-snapshots
 *
 *   # Run visual comparison
 *   npx playwright test tests/audit/visual-regression.spec.ts
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

// Key pages to capture for visual regression
const VISUAL_TEST_PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/pokedex', name: 'pokedex' },
  { path: '/tcgexpansions', name: 'tcg-expansions' },
  { path: '/pocketmode', name: 'pocket-mode' },
  { path: '/pokemon', name: 'pokemon-hub' },
  { path: '/pokemon/moves-unified', name: 'pokemon-moves' },
  { path: '/market', name: 'market' },
  { path: '/trending', name: 'trending' },
  { path: '/favorites', name: 'favorites' },
  { path: '/battle-simulator', name: 'battle-simulator' },
  { path: '/type-effectiveness', name: 'type-effectiveness' },
  { path: '/support', name: 'support' },
];

// Viewports for visual testing
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Visual comparison options
const SNAPSHOT_OPTIONS = {
  // Allow 0.1% pixel difference (handles anti-aliasing, font rendering)
  maxDiffPixelRatio: 0.001,
  // Threshold for individual pixel color difference (0-1)
  threshold: 0.2,
  // Animation handling
  animations: 'disabled' as const,
};

test.describe('Visual Regression Tests', () => {
  // Disable animations for consistent screenshots
  test.use({
    // Wait for fonts to load
    actionTimeout: 10000,
  });

  for (const page of VISUAL_TEST_PAGES) {
    for (const viewport of VIEWPORTS) {
      test(`${page.name} @ ${viewport.name}`, async ({ page: browserPage }) => {
        // Set viewport
        await browserPage.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        // Navigate to page
        await browserPage.goto(`${BASE_URL}${page.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        // Wait for any animations to settle
        await browserPage.waitForTimeout(1000);

        // Disable animations for consistent screenshots
        await browserPage.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
            }
          `,
        });

        // Wait a bit more for styles to apply
        await browserPage.waitForTimeout(500);

        // Take screenshot and compare
        const screenshotName = `${page.name}-${viewport.name}.png`;

        await expect(browserPage).toHaveScreenshot(screenshotName, {
          ...SNAPSHOT_OPTIONS,
          fullPage: true,
        });
      });
    }
  }
});

test.describe('Component Visual Regression', () => {
  test('Pokemon card rendering', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/pokedex`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Disable animations
    await page.addStyleTag({
      content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
    });

    // Screenshot first row of Pokemon cards
    const grid = page.locator('[class*="grid"]').first();
    if (await grid.isVisible()) {
      await expect(grid).toHaveScreenshot('pokemon-grid.png', SNAPSHOT_OPTIONS);
    }
  });

  test('Navigation bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const nav = page.locator('nav').first();
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot('navigation-bar.png', SNAPSHOT_OPTIONS);
    }
  });

  test('Mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Screenshot bottom navigation if present
    const bottomNav = page.locator('[class*="bottom"]').first();
    if (await bottomNav.isVisible()) {
      await expect(bottomNav).toHaveScreenshot('mobile-bottom-nav.png', SNAPSHOT_OPTIONS);
    }
  });
});
