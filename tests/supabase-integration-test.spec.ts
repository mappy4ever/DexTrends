import { test, expect } from '@playwright/test';

test.describe('Supabase Showdown Integration', () => {
  test('Pokemon Moves tab loads Showdown data', async ({ page }) => {
    // Collect console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Supabase]') || text.includes('[Showdown]') || text.includes('[App]')) {
        consoleMessages.push(text);
        console.log('Browser:', text);
      }
    });
    
    // Navigate to homepage first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for Supabase to initialize
    await page.waitForTimeout(2000);
    
    // Navigate to Pikachu's page
    await page.goto('/pokedex/pikachu');
    await page.waitForLoadState('networkidle');
    
    // Click on Moves tab
    console.log('Clicking on Moves tab...');
    await page.click('[data-testid="moves-tab"]');
    
    // Wait for either data or error
    console.log('Waiting for content to load...');
    await page.waitForSelector(
      '[data-testid="pokemon-learnset"], [data-testid="learnset-loading"], .text-red-500',
      { timeout: 10000 }
    );
    
    // Check what rendered
    const errorText = await page.locator('.text-red-500').textContent().catch(() => null);
    const movesCount = await page.locator('[data-testid="move-item"]').count();
    const loadingVisible = await page.locator('[data-testid="learnset-loading"]').isVisible().catch(() => false);
    
    console.log('\n=== Test Results ===');
    console.log('Error displayed:', errorText || 'None');
    console.log('Moves found:', movesCount);
    console.log('Loading state:', loadingVisible ? 'Still loading' : 'Loaded');
    console.log('\nConsole messages:');
    consoleMessages.forEach(msg => console.log('  -', msg));
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/supabase-test-result.png', fullPage: true });
    
    // Assertions
    if (errorText) {
      console.log('\n⚠️  Error found:', errorText);
      if (errorText.includes('Showdown data not available')) {
        console.log('This suggests Supabase is not connecting properly or tables are missing.');
      }
    } else if (movesCount > 0) {
      console.log('\n✅ Success! Found', movesCount, 'moves for Pikachu');
    } else if (loadingVisible) {
      console.log('\n⏳ Still loading after 10 seconds - possible timeout');
    }
  });
  
  test('Check Supabase initialization logs', async ({ page }) => {
    const logs: string[] = [];
    
    page.on('console', msg => {
      if (msg.text().includes('Supabase')) {
        logs.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    console.log('Supabase-related console logs:');
    logs.forEach(log => console.log(' -', log));
    
    expect(logs.some(log => log.includes('Client initialized successfully'))).toBeTruthy();
  });
});