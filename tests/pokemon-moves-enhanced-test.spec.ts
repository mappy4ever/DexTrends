import { test } from '@playwright/test';

test('Enhanced Pokemon Moves display', async ({ page }) => {
  // Navigate to Pikachu page
  console.log('Testing enhanced moves display...');
  await page.goto('http://localhost:3002/pokedex/pikachu');
  await page.waitForLoadState('networkidle');
  
  // Click on Moves tab
  await page.click('[data-testid="moves-tab"]');
  await page.waitForTimeout(2000);
  
  // Check for enhanced move display elements
  const firstMoveItem = await page.locator('[data-testid="move-item"]').first();
  
  // Wait for type badges to appear
  await page.waitForTimeout(1000);
  
  // Count type badges (should be present now)
  const typeBadgeCount = await page.locator('[data-testid="move-item"] >> .rounded-full').count();
  console.log('Type badges found:', typeBadgeCount);
  
  // Check for power/accuracy display
  const powerAccuracyText = await page.locator('text=/Power:.*Acc:/').count();
  console.log('Power/Accuracy displays found:', powerAccuracyText);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/pokemon-moves-enhanced.png', 
    fullPage: true 
  });
  
  // Click on a move to expand details
  await firstMoveItem.click();
  await page.waitForTimeout(1000);
  
  // Check if enhanced move display appears
  const enhancedDisplay = await page.locator('[data-testid="enhanced-move-display"]').isVisible();
  console.log('Enhanced display visible:', enhancedDisplay);
  
  console.log('\nEnhanced moves display test complete!');
});