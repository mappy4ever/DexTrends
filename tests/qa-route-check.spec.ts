import { test } from '@playwright/test';

test.describe('QA Route Check', () => {
  test('Check all routes for errors', async ({ page }) => {
    const routes = [
      { path: '/', name: 'Homepage' },
      { path: '/pokedex', name: 'Pokedex' },
      { path: '/tcg-sets', name: 'TCG Sets' },
      { path: '/pocketmode', name: 'Pocket Mode' },
      { path: '/pocketmode/decks', name: 'Pocket Mode Decks' },
      { path: '/pocketmode/expansions', name: 'Pocket Mode Expansions' },
      { path: '/battle-simulator', name: 'Battle Simulator' },
      { path: '/type-effectiveness', name: 'Type Effectiveness' },
      { path: '/pokemon/starters', name: 'Pokemon Starters' },
      { path: '/team-builder', name: 'Team Builder' },
      { path: '/non-existent', name: '404 Page' }
    ];

    const results = [];

    for (const route of routes) {
      console.log(`\n=== Checking ${route.name} (${route.path}) ===`);
      
      const consoleErrors = [];
      const networkErrors = [];
      
      // Set up error tracking
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      page.on('pageerror', err => {
        consoleErrors.push(err.message);
      });
      
      page.on('requestfailed', request => {
        networkErrors.push({
          url: request.url(),
          failure: request.failure()?.errorText
        });
      });

      try {
        // Navigate with shorter timeout
        await page.goto(`http://localhost:3001${route.path}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        // Wait a bit for any async errors
        await page.waitForTimeout(2000);
        
        // Check page title
        const title = await page.title();
        
        // Check for common error indicators
        const hasErrorBoundary = await page.locator('text=/error|Error|failed|Failed/i').count();
        const hasLoading = await page.locator('text=/loading|Loading/i').count();
        
        // Get performance metrics
        const metrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          };
        });
        
        results.push({
          route: route.path,
          name: route.name,
          status: 'loaded',
          title,
          consoleErrors: consoleErrors.length,
          networkErrors: networkErrors.length,
          hasErrorBoundary,
          hasLoading,
          metrics,
          errors: consoleErrors.slice(0, 3) // First 3 errors
        });
        
        console.log(`✓ Loaded successfully`);
        console.log(`  Title: ${title}`);
        console.log(`  Console errors: ${consoleErrors.length}`);
        console.log(`  Network errors: ${networkErrors.length}`);
        if (consoleErrors.length > 0) {
          console.log(`  First error: ${consoleErrors[0]}`);
        }
        
      } catch (error) {
        results.push({
          route: route.path,
          name: route.name,
          status: 'failed',
          error: error.message,
          consoleErrors: consoleErrors.length,
          networkErrors: networkErrors.length
        });
        
        console.log(`✗ Failed to load: ${error.message}`);
      }
      
      // Clear listeners
      page.removeAllListeners('console');
      page.removeAllListeners('pageerror');
      page.removeAllListeners('requestfailed');
    }
    
    // Summary report
    console.log('\n\n=== SUMMARY REPORT ===\n');
    
    console.log('Route Status:');
    for (const result of results) {
      const status = result.status === 'loaded' ? '✓' : '✗';
      const errors = result.consoleErrors || 0;
      console.log(`${status} ${result.name} - Console Errors: ${errors}`);
    }
    
    console.log('\n\nDetailed Issues:');
    for (const result of results) {
      if (result.consoleErrors > 0 || result.status === 'failed') {
        console.log(`\n${result.name} (${result.route}):`);
        if (result.status === 'failed') {
          console.log(`  - Failed to load: ${result.error}`);
        }
        if (result.errors && result.errors.length > 0) {
          console.log(`  - Errors:`);
          result.errors.forEach(err => console.log(`    • ${err.substring(0, 100)}...`));
        }
      }
    }
  });
});