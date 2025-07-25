import { test, expect } from '@playwright/test';

test('Simple Fast Refresh monitoring', async ({ page }) => {
  let reloadCount = 0;
  let hmrErrors = 0;
  let consoleErrors: string[] = [];
  
  // Monitor page reloads
  page.on('load', () => {
    reloadCount++;
    console.log(`[Page Reload] Count: ${reloadCount} at ${new Date().toISOString()}`);
  });
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      consoleErrors.push(text);
      console.log(`[Console Error] ${text}`);
      
      if (text.includes('HMR') || text.includes('Fast Refresh')) {
        hmrErrors++;
      }
    }
  });
  
  // Monitor page errors
  page.on('pageerror', error => {
    console.error(`[Page Error] ${error.message}`);
  });
  
  // Navigate to Pokemon page
  console.log('Navigating to Pikachu page...');
  await page.goto('http://localhost:3000/pokedex/25', { 
    waitUntil: 'networkidle' 
  });
  
  console.log('Page loaded. Starting 20-second monitoring...');
  const startTime = Date.now();
  
  // Monitor for 20 seconds without any interaction
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(5000);
    console.log(`[${i * 5 + 5}s] Reloads: ${reloadCount}, HMR Errors: ${hmrErrors}, Total Console Errors: ${consoleErrors.length}`);
  }
  
  const elapsed = Date.now() - startTime;
  
  console.log('\n=== RESULTS ===');
  console.log(`Monitoring duration: ${elapsed}ms`);
  console.log(`Total reloads: ${reloadCount}`);
  console.log(`HMR errors: ${hmrErrors}`);
  console.log(`Console errors: ${consoleErrors.length}`);
  
  if (consoleErrors.length > 0) {
    console.log('\nUnique console errors:');
    const uniqueErrors = [...new Set(consoleErrors)];
    uniqueErrors.forEach(err => console.log(`  - ${err}`));
  }
  
  // Check if the page is stable
  expect(reloadCount, 'Page should not reload more than once').toBeLessThanOrEqual(1);
  expect(hmrErrors, 'Should not have HMR errors').toBe(0);
});