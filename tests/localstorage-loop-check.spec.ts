import { test, expect } from '@playwright/test';

test('Check for localStorage infinite loop', async ({ page }) => {
  const localStorageWrites: { key: string; value: string; timestamp: number }[] = [];
  
  // Intercept localStorage calls
  await page.addInitScript(() => {
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    
    localStorage.setItem = function(key: string, value: string) {
      console.log(`[LocalStorage SET] ${key} = ${value} at ${Date.now()}`);
      originalSetItem.call(this, key, value);
    };
    
    localStorage.getItem = function(key: string) {
      const value = originalGetItem.call(this, key);
      console.log(`[LocalStorage GET] ${key} = ${value} at ${Date.now()}`);
      return value;
    };
  });
  
  // Track localStorage operations
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[LocalStorage')) {
      const match = text.match(/\[LocalStorage (GET|SET)\] (.*?) = (.*?) at (\d+)/);
      if (match) {
        localStorageWrites.push({
          key: match[2],
          value: match[3],
          timestamp: parseInt(match[4])
        });
      }
    }
  });
  
  // Navigate to Pokemon page using existing dev server
  console.log('Navigating to page...');
  await page.goto('http://localhost:3000/pokedex/25');
  await page.waitForSelector('[data-testid="pokemon-name"]', { timeout: 10000 });
  
  console.log('Page loaded, monitoring for 10 seconds...');
  
  // Monitor for 10 seconds
  await page.waitForTimeout(10000);
  
  // Analyze localStorage operations
  console.log(`\nTotal localStorage operations: ${localStorageWrites.length}`);
  
  // Group by key
  const operationsByKey = localStorageWrites.reduce((acc, op) => {
    if (!acc[op.key]) acc[op.key] = [];
    acc[op.key].push(op);
    return acc;
  }, {} as Record<string, typeof localStorageWrites>);
  
  console.log('\nOperations by key:');
  Object.entries(operationsByKey).forEach(([key, ops]) => {
    console.log(`  ${key}: ${ops.length} operations`);
    
    // Check for rapid repeated writes
    const writes = ops.filter(op => op.key.includes('pokemon-tab'));
    if (writes.length > 1) {
      for (let i = 1; i < writes.length; i++) {
        const timeDiff = writes[i].timestamp - writes[i-1].timestamp;
        if (timeDiff < 100) { // Less than 100ms between writes
          console.log(`    WARNING: Rapid writes detected! ${timeDiff}ms between writes`);
        }
      }
    }
  });
  
  // Check for loops
  const tabKey = Object.keys(operationsByKey).find(key => key.includes('pokemon-tab'));
  if (tabKey) {
    const tabOps = operationsByKey[tabKey];
    expect(tabOps.length, 'Should not have excessive localStorage operations').toBeLessThan(10);
  }
});