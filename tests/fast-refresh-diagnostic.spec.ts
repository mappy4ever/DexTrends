import { test, expect } from '@playwright/test';

test.describe('Fast Refresh Diagnostic', () => {
  let reloadCount = 0;
  let consoleMessages: string[] = [];
  let networkRequests: string[] = [];
  
  test('detect constant refreshing on Pokemon detail page', async ({ page }) => {
    // 1. Setup monitoring
    // Track page reloads
    page.on('load', () => {
      reloadCount++;
      console.log(`[Reload Detected] Count: ${reloadCount}`);
    });
    
    // Track console messages
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      
      // Look for Fast Refresh messages
      if (text.includes('Fast Refresh') || text.includes('[HMR]') || text.includes('hot update')) {
        console.log(`[Fast Refresh] ${text}`);
      }
    });
    
    // Track network requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('_next/static/webpack') || url.includes('.hot-update.')) {
        networkRequests.push(url);
        console.log(`[HMR Request] ${url}`);
      }
    });
    
    // Track errors
    page.on('pageerror', error => {
      console.error(`[Page Error] ${error.message}`);
    });
    
    // 2. Navigate to Pokemon detail page
    console.log('Navigating to Pikachu page...');
    await page.goto('http://localhost:3000/pokedex/25'); // Pikachu
    
    // 3. Wait for initial load
    await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 10000 });
    console.log('Page loaded successfully');
    
    // 4. Monitor for 30 seconds without interaction
    console.log('Starting 30-second monitoring period...');
    const startTime = Date.now();
    const initialReloadCount = reloadCount;
    const initialConsoleCount = consoleMessages.length;
    const initialNetworkCount = networkRequests.length;
    
    // Take periodic screenshots and logs
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(5000); // 5 seconds
      
      const currentReloads = reloadCount - initialReloadCount;
      const currentConsoles = consoleMessages.length - initialConsoleCount;
      const currentRequests = networkRequests.length - initialNetworkCount;
      
      console.log(`[${i * 5}s] Reloads: ${currentReloads}, Console logs: ${currentConsoles}, HMR requests: ${currentRequests}`);
      
      // Take a screenshot for visual inspection
      await page.screenshot({ 
        path: `test-results/fast-refresh-${i * 5}s.png`,
        fullPage: true 
      });
    }
    
    // 5. Analyze results
    const totalReloads = reloadCount - initialReloadCount;
    const fastRefreshMessages = consoleMessages.filter(msg => 
      msg.includes('Fast Refresh') || msg.includes('[HMR]') || msg.includes('hot update')
    );
    
    // 6. Report findings
    console.log('\n=== DIAGNOSTIC RESULTS ===');
    console.log(`Total page reloads: ${totalReloads}`);
    console.log(`Fast Refresh messages: ${fastRefreshMessages.length}`);
    console.log(`HMR network requests: ${networkRequests.length}`);
    console.log(`Total console messages: ${consoleMessages.length}`);
    
    // Print some console messages for debugging
    console.log('\nSample console messages:');
    consoleMessages.slice(-10).forEach(msg => console.log(`  - ${msg}`));
    
    // Fail if constant refreshing detected
    expect(totalReloads, 'Page should not reload constantly').toBeLessThan(2);
    expect(networkRequests.length, 'Should not have excessive HMR requests').toBeLessThan(10);
  });
  
  test('monitor component re-renders and state updates', async ({ page }) => {
    let stateUpdateCount = 0;
    let localStorageUpdates = 0;
    
    // Inject render tracking
    await page.addInitScript(() => {
      window.renderCounts = {};
      window.trackRender = (componentName: string) => {
        window.renderCounts[componentName] = (window.renderCounts[componentName] || 0) + 1;
      };
      
      // Track localStorage
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key: string, value: string) {
        console.log(`[LocalStorage] Set: ${key} = ${value}`);
        originalSetItem.call(this, key, value);
      };
    });
    
    // Monitor console for state updates
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Tab System]') || 
          text.includes('[Pokemon Detail]') ||
          text.includes('[Card Loading]') ||
          text.includes('[LocalStorage]')) {
        stateUpdateCount++;
        console.log(`[State Update ${stateUpdateCount}] ${text}`);
        
        if (text.includes('[LocalStorage]')) {
          localStorageUpdates++;
        }
      }
    });
    
    // Navigate to page
    console.log('Navigating to Bulbasaur page...');
    await page.goto('http://localhost:3000/pokedex/1'); // Bulbasaur
    await page.waitForSelector('[data-testid="pokemon-name"]');
    
    // Wait 10 seconds to see baseline activity
    console.log('Monitoring baseline activity for 10 seconds...');
    const baselineUpdates = stateUpdateCount;
    await page.waitForTimeout(10000);
    
    console.log(`Baseline: ${stateUpdateCount - baselineUpdates} state updates in 10 seconds`);
    
    // Click through tabs to check for loops
    console.log('\nTesting tab interactions...');
    const tabs = ['Stats', 'Evolution', 'Moves'];
    
    for (const tab of tabs) {
      const beforeClick = stateUpdateCount;
      console.log(`\nClicking ${tab} tab...`);
      
      // Click the tab
      await page.click(`button:has-text("${tab}")`);
      await page.waitForTimeout(3000);
      
      const afterClick = stateUpdateCount - beforeClick;
      console.log(`${tab} tab triggered ${afterClick} state updates`);
      
      // Check if updates are excessive
      expect(afterClick, `Too many state updates after clicking ${tab} tab`).toBeLessThan(20);
    }
    
    // Report localStorage activity
    console.log(`\nTotal localStorage updates: ${localStorageUpdates}`);
    expect(localStorageUpdates, 'Excessive localStorage activity').toBeLessThan(30);
  });
  
  test('check for infinite loops in navigation', async ({ page }) => {
    let navigationCount = 0;
    
    // Track navigation attempts
    page.on('framenavigated', () => {
      navigationCount++;
      console.log(`[Navigation] Count: ${navigationCount}`);
    });
    
    // Navigate to Charizard
    await page.goto('http://localhost:3000/pokedex/6');
    await page.waitForSelector('[data-testid="pokemon-name"]');
    
    // Test navigation arrows
    console.log('Testing navigation arrows...');
    
    // Click next arrow 5 times
    for (let i = 0; i < 5; i++) {
      console.log(`Clicking next arrow (${i + 1}/5)...`);
      await page.click('[data-testid="nav-next"]');
      await page.waitForSelector('[data-testid="pokemon-name"]');
      await page.waitForTimeout(2000);
    }
    
    // Click prev arrow 5 times
    for (let i = 0; i < 5; i++) {
      console.log(`Clicking prev arrow (${i + 1}/5)...`);
      await page.click('[data-testid="nav-prev"]');
      await page.waitForSelector('[data-testid="pokemon-name"]');
      await page.waitForTimeout(2000);
    }
    
    console.log(`Total navigations: ${navigationCount}`);
    expect(navigationCount, 'Should only navigate when arrows are clicked').toBeLessThanOrEqual(11); // 1 initial + 10 clicks
  });
  
  test('isolate problematic components', async ({ page }) => {
    // Test each new component in isolation by hiding them
    const components = [
      { name: 'NavigationArrow', selector: '[data-testid^="nav-"]' },
      { name: 'FloatingStatsWidget', selector: '.fixed.bottom-6' },
      { name: 'TypeEffectivenessChart', selector: 'div:has(> div:has-text("Type Effectiveness"))' },
    ];
    
    for (const component of components) {
      console.log(`\n=== Testing with ${component.name} hidden ===`);
      
      // Reset counters
      reloadCount = 0;
      consoleMessages = [];
      networkRequests = [];
      
      // Hide the component
      await page.addStyleTag({
        content: `${component.selector} { display: none !important; }`
      });
      
      // Navigate to page
      await page.goto('http://localhost:3000/pokedex/25');
      await page.waitForSelector('[data-testid="pokemon-name"]');
      
      // Monitor for 15 seconds
      console.log(`Monitoring for 15 seconds with ${component.name} hidden...`);
      await page.waitForTimeout(15000);
      
      console.log(`Results with ${component.name} hidden:`);
      console.log(`  - Reloads: ${reloadCount}`);
      console.log(`  - HMR requests: ${networkRequests.length}`);
      console.log(`  - Console messages: ${consoleMessages.length}`);
      
      // Remove the style to reset
      await page.evaluate(() => {
        const styleElements = document.querySelectorAll('style');
        styleElements[styleElements.length - 1].remove();
      });
    }
  });
  
  test('memory leak detection', async ({ page }) => {
    // Check if performance.memory is available
    const hasMemoryAPI = await page.evaluate(() => {
      return !!(performance as any).memory;
    });
    
    if (!hasMemoryAPI) {
      console.log('Performance.memory API not available, skipping memory test');
      return;
    }
    
    // Helper to get memory usage
    const getMemoryUsage = async () => {
      return await page.evaluate(() => {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        };
      });
    };
    
    // Navigate to initial Pokemon
    await page.goto('http://localhost:3000/pokedex/1');
    await page.waitForSelector('[data-testid="pokemon-name"]');
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });
    
    const initialMemory = await getMemoryUsage();
    console.log('Initial memory usage:', initialMemory);
    
    // Navigate between Pokemon 20 times
    console.log('Navigating between Pokemon...');
    for (let i = 0; i < 20; i++) {
      await page.click('[data-testid="nav-next"]');
      await page.waitForSelector('[data-testid="pokemon-name"]');
      await page.waitForTimeout(500);
      
      if (i % 5 === 0) {
        const currentMemory = await getMemoryUsage();
        console.log(`After ${i + 1} navigations: ${currentMemory.usedJSHeapSize}MB used`);
      }
    }
    
    // Force garbage collection again
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });
    
    const finalMemory = await getMemoryUsage();
    console.log('Final memory usage:', finalMemory);
    
    const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
    console.log(`Memory increase: ${memoryIncrease}MB`);
    
    // Fail if memory increased by more than 50MB
    expect(memoryIncrease, 'Memory leak detected').toBeLessThan(50);
  });
});

// Additional focused test for debugging
test.describe('Focused Component Tests', () => {
  test('test tab system localStorage behavior', async ({ page }) => {
    let localStorageWrites: string[] = [];
    
    // Intercept localStorage
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key: string, value: string) {
        console.log(`[LocalStorage Write] ${key} = ${value}`);
        originalSetItem.call(this, key, value);
      };
    });
    
    page.on('console', msg => {
      if (msg.text().includes('[LocalStorage Write]')) {
        localStorageWrites.push(msg.text());
      }
    });
    
    // Navigate to Pokemon
    await page.goto('http://localhost:3000/pokedex/150'); // Mewtwo
    await page.waitForSelector('[data-testid="pokemon-name"]');
    
    console.log('Initial localStorage writes:', localStorageWrites.length);
    
    // Wait 5 seconds without interaction
    await page.waitForTimeout(5000);
    
    const writesWithoutInteraction = localStorageWrites.length;
    console.log('Writes after 5 seconds without interaction:', writesWithoutInteraction);
    
    // Click tabs
    await page.click('button:has-text("Stats")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Moves")');
    await page.waitForTimeout(1000);
    
    console.log('Total localStorage writes:', localStorageWrites.length);
    console.log('Write log:', localStorageWrites);
    
    // Check for duplicate writes
    const duplicates = localStorageWrites.filter((item, index) => 
      localStorageWrites.indexOf(item) !== index
    );
    
    console.log('Duplicate writes:', duplicates.length);
    expect(duplicates.length, 'Should not have excessive duplicate localStorage writes').toBeLessThan(5);
  });
});