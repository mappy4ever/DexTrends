import { test } from '@playwright/test';

test('Quick Supabase test page check', async ({ page }) => {
  // Navigate to test page
  await page.goto('http://localhost:3002/test-supabase');
  
  // Wait for tests to complete
  await page.waitForSelector('text=Connection Status', { timeout: 10000 });
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/supabase-test-page.png', fullPage: true });
  
  // Get all text content
  const content = await page.textContent('body');
  console.log('\n=== SUPABASE TEST PAGE RESULTS ===\n');
  console.log(content);
  
  // Also log any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
});