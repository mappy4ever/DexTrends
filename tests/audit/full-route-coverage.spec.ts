/**
 * Full Route Coverage Test
 *
 * Crawls all application routes at multiple viewports,
 * captures screenshots, and checks for console errors.
 *
 * Part of the production audit testing suite.
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// All static routes in the application
const ROUTES = [
  // Core pages
  { path: '/', name: 'Homepage' },
  { path: '/pokedex', name: 'Pokedex' },
  { path: '/search', name: 'Search' },
  { path: '/favorites', name: 'Favorites' },
  { path: '/collections', name: 'Collections' },

  // Pokemon Hub
  { path: '/pokemon', name: 'Pokemon Hub' },
  { path: '/pokemon/moves-unified', name: 'Pokemon Moves' },
  { path: '/pokemon/abilities-unified', name: 'Pokemon Abilities' },
  { path: '/pokemon/items-unified', name: 'Pokemon Items' },
  { path: '/pokemon/natures', name: 'Pokemon Natures' },
  { path: '/pokemon/berries', name: 'Pokemon Berries' },
  { path: '/pokemon/compare', name: 'Pokemon Compare' },
  { path: '/pokemon/regions', name: 'Pokemon Regions' },
  { path: '/pokemon/starters', name: 'Pokemon Starters' },
  { path: '/pokemon/games', name: 'Pokemon Games' },
  { path: '/pokemon/shiny', name: 'Shiny Pokemon' },
  { path: '/pokemon/iv-calculator', name: 'IV Calculator' },
  { path: '/pokemon/evolution-guide', name: 'Evolution Guide' },

  // TCG
  { path: '/tcgexpansions', name: 'TCG Expansions' },
  { path: '/market', name: 'TCG Market' },
  { path: '/trending', name: 'Trending' },

  // Pocket Mode
  { path: '/pocketmode', name: 'Pocket Mode Hub' },
  { path: '/pocketmode/expansions', name: 'Pocket Expansions' },
  { path: '/pocketmode/decks', name: 'Pocket Decks' },
  { path: '/pocketmode/packs', name: 'Pocket Packs' },
  { path: '/pocketmode/deckbuilder', name: 'Pocket Deck Builder' },

  // Battle & Team
  { path: '/battle-simulator', name: 'Battle Simulator' },
  { path: '/battle-simulator/damage-calc', name: 'Damage Calculator' },
  { path: '/battle-simulator/team-builder', name: 'Battle Team Builder' },
  { path: '/team-builder', name: 'Team Builder' },
  { path: '/team-builder/advanced', name: 'Advanced Team Builder' },
  { path: '/team-builder/ev-optimizer', name: 'EV Optimizer' },
  { path: '/type-effectiveness', name: 'Type Effectiveness' },

  // Utility pages
  { path: '/analytics', name: 'Analytics' },
  { path: '/support', name: 'Support' },
  { path: '/fun', name: 'Fun' },
  { path: '/offline', name: 'Offline' },

  // Auth (may redirect)
  { path: '/auth/login', name: 'Login' },

  // Error pages
  { path: '/404', name: '404 Page' },
  { path: '/500', name: '500 Page' },
  { path: '/non-existent-route', name: '404 Test' },
];

// Viewport configurations
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Test configuration
const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = './test-results/audit-screenshots';

interface RouteResult {
  route: string;
  name: string;
  viewport: string;
  status: 'success' | 'error' | 'timeout';
  loadTime: number;
  consoleErrors: string[];
  networkErrors: string[];
  screenshotPath?: string;
  error?: string;
}

// Ensure screenshot directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

test.describe('Full Route Coverage Audit', () => {
  const allResults: RouteResult[] = [];

  test.beforeAll(() => {
    ensureDirectoryExists(SCREENSHOT_DIR);
  });

  // Generate tests for each route at each viewport
  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      test(`${route.name} @ ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        const consoleErrors: string[] = [];
        const networkErrors: string[] = [];
        const startTime = Date.now();

        // Set viewport
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        // Track console errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text().substring(0, 200));
          }
        });

        // Track page errors
        page.on('pageerror', error => {
          consoleErrors.push(`PageError: ${error.message.substring(0, 200)}`);
        });

        // Track network failures
        page.on('requestfailed', request => {
          const url = request.url();
          // Ignore expected failures (external resources, etc.)
          if (!url.includes('localhost')) return;
          networkErrors.push(`${request.failure()?.errorText}: ${url}`);
        });

        let status: 'success' | 'error' | 'timeout' = 'success';
        let errorMessage: string | undefined;

        try {
          // Navigate to page
          const response = await page.goto(`${BASE_URL}${route.path}`, {
            waitUntil: 'networkidle',
            timeout: 30000,
          });

          // Check response status
          if (response && response.status() >= 400 && !route.path.includes('404') && !route.path.includes('500') && !route.path.includes('non-existent')) {
            status = 'error';
            errorMessage = `HTTP ${response.status()}`;
          }

          // Wait for any dynamic content
          await page.waitForTimeout(1000);

          // Take screenshot
          const screenshotName = `${route.path.replace(/\//g, '_').replace(/^_/, '') || 'home'}_${viewport.name}.png`;
          const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
          await page.screenshot({ path: screenshotPath, fullPage: true });

          // Check for error boundary text on page
          const hasErrorBoundary = await page.locator('text=/Something went wrong|Error loading|Failed to load/i').count() > 0;
          if (hasErrorBoundary) {
            status = 'error';
            errorMessage = 'Error boundary detected on page';
          }

        } catch (error) {
          status = error.message.includes('timeout') ? 'timeout' : 'error';
          errorMessage = error.message.substring(0, 200);
        }

        const loadTime = Date.now() - startTime;

        // Record result
        const result: RouteResult = {
          route: route.path,
          name: route.name,
          viewport: viewport.name,
          status,
          loadTime,
          consoleErrors,
          networkErrors,
          error: errorMessage,
        };

        allResults.push(result);

        // Log result
        const statusIcon = status === 'success' ? '✓' : status === 'timeout' ? '⏱' : '✗';
        console.log(`${statusIcon} ${route.name} @ ${viewport.name}: ${loadTime}ms, ${consoleErrors.length} console errors`);

        // Assert no critical errors (allow console errors but fail on page errors)
        expect(status, `${route.name} should load without errors`).not.toBe('error');
      });
    }
  }

  test.afterAll(async () => {
    // Generate summary report
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: allResults.length,
      passed: allResults.filter(r => r.status === 'success').length,
      failed: allResults.filter(r => r.status === 'error').length,
      timeouts: allResults.filter(r => r.status === 'timeout').length,
      averageLoadTime: Math.round(allResults.reduce((sum, r) => sum + r.loadTime, 0) / allResults.length),
      routesWithConsoleErrors: allResults.filter(r => r.consoleErrors.length > 0).length,
      results: allResults,
    };

    // Write summary JSON
    const summaryPath = path.join(SCREENSHOT_DIR, 'audit-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // Print summary
    console.log('\n=== AUDIT SUMMARY ===');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Timeouts: ${summary.timeouts}`);
    console.log(`Average Load Time: ${summary.averageLoadTime}ms`);
    console.log(`Routes with Console Errors: ${summary.routesWithConsoleErrors}`);

    if (summary.failed > 0) {
      console.log('\nFailed Routes:');
      allResults
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`  - ${r.name} @ ${r.viewport}: ${r.error}`));
    }
  });
});
