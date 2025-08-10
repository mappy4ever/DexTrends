import { test, expect } from '@playwright/test';

test.describe('TCG Set Navigation Test', () => {
  test('Navigate to set detail page and check loading', async ({ page }) => {
    console.log('Starting navigation test...');
    
    // First go to TCG sets page
    await page.goto('http://localhost:3001/tcgsets');
    
    // Wait for sets to load
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 15000 });
    
    // Get the first set card
    const firstSet = page.locator('.group.animate-fadeIn').first();
    await expect(firstSet).toBeVisible();
    
    // Get set info before clicking
    const setName = await firstSet.locator('h3, .text-xl').textContent();
    console.log('Clicking on set:', setName);
    
    // Listen for console messages
    const consoleLogs: { type: string; text: string }[] = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Click the set
    await firstSet.click();
    
    // Wait for navigation
    await page.waitForURL(/\/tcgsets\/[a-z0-9-]+/i, { timeout: 10000 });
    
    const currentUrl = page.url();
    console.log('Navigated to:', currentUrl);
    
    // Wait a bit for console logs
    await page.waitForTimeout(3000);
    
    // Print all console logs
    console.log('\nConsole logs from page:');
    consoleLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });
    
    // Check what's visible on the page
    const hasLoadingText = await page.locator('text=/loading/i').isVisible();
    const hasSetNotFound = await page.locator('text="Set Not Found"').isVisible();
    const hasError = await page.locator('text=/error/i').isVisible();
    const hasTitle = await page.locator('h1').isVisible();
    
    console.log('\nPage state:');
    console.log('- Has loading text:', hasLoadingText);
    console.log('- Has "Set Not Found":', hasSetNotFound);
    console.log('- Has error:', hasError);
    console.log('- Has title (h1):', hasTitle);
    
    if (hasTitle) {
      const titleText = await page.locator('h1').textContent();
      console.log('- Title text:', titleText);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tcg-set-navigation-issue.png', fullPage: true });
    
    // Check if we're stuck in loading state
    if (hasLoadingText) {
      console.log('\nWaiting for loading to complete...');
      await page.waitForTimeout(5000);
      
      const stillLoading = await page.locator('text=/loading/i').isVisible();
      const hasSetNotFoundAfterWait = await page.locator('text="Set Not Found"').isVisible();
      
      console.log('After wait:');
      console.log('- Still loading:', stillLoading);
      console.log('- Has "Set Not Found":', hasSetNotFoundAfterWait);
    }
  });
});