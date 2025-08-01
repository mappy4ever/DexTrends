import { test } from '@playwright/test';

test('Pokemon Moves tab final check', async ({ page }) => {
  // Collect console messages
  const logs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (text.includes('Supabase') || text.includes('Showdown') || text.includes('Failed')) {
      console.log('Console:', text);
    }
  });
  
  // Navigate to Pikachu page
  console.log('Navigating to Pikachu page...');
  await page.goto('http://localhost:3002/pokedex/pikachu');
  await page.waitForLoadState('networkidle');
  
  // Wait for page to fully load
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Click on Moves tab
  console.log('Clicking Moves tab...');
  await page.click('[data-testid="moves-tab"]');
  
  // Wait a bit for content to load
  await page.waitForTimeout(3000);
  
  // Check what's displayed
  const errorElement = await page.locator('.text-red-500').first();
  const errorVisible = await errorElement.isVisible().catch(() => false);
  const errorText = errorVisible ? await errorElement.textContent() : null;
  
  const movesCount = await page.locator('[data-testid="move-item"]').count();
  const loadingVisible = await page.locator('[data-testid="learnset-loading"]').isVisible().catch(() => false);
  const learnsetVisible = await page.locator('[data-testid="pokemon-learnset"]').isVisible().catch(() => false);
  
  console.log('\n=== MOVES TAB TEST RESULTS ===');
  console.log('Error visible:', errorVisible);
  console.log('Error text:', errorText);
  console.log('Moves count:', movesCount);
  console.log('Loading visible:', loadingVisible);
  console.log('Learnset visible:', learnsetVisible);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/pokemon-moves-tab.png', fullPage: true });
  
  // Log relevant console messages
  console.log('\n=== RELEVANT CONSOLE LOGS ===');
  logs.filter(log => 
    log.includes('Supabase') || 
    log.includes('Showdown') || 
    log.includes('Failed') ||
    log.includes('error')
  ).forEach(log => console.log(log));
});