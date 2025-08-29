import { test, expect } from '@playwright/test';

test.describe('TCG Set Detail Page', () => {
  test('should load set detail page without hooks errors', async ({ page }) => {
    // Navigate to a specific TCG set
    await page.goto('/tcgsets/base1');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that page doesn't have React errors
    const errorText = await page.locator('text=/Rendered more hooks/').count();
    expect(errorText).toBe(0);
    
    // Check that page has basic content
    const hasContent = await page.locator('[data-testid="set-header"], h1, h2').first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    
    // Check for any error boundaries
    const hasErrorBoundary = await page.locator('text=/Something went wrong/').count();
    expect(hasErrorBoundary).toBe(0);
    
    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore network timeouts as those are API issues
        if (!text.includes('timeout') && !text.includes('Failed to fetch')) {
          console.error('Console error:', text);
        }
      }
    });
    
    // Try navigating to another set to ensure no hooks errors on navigation
    await page.goto('/tcgsets/swsh1');
    await page.waitForLoadState('networkidle');
    
    // Check again for hooks error
    const errorTextAfterNav = await page.locator('text=/Rendered more hooks/').count();
    expect(errorTextAfterNav).toBe(0);
  });
  
  test('should handle loading states properly', async ({ page }) => {
    // Go to TCG sets list first
    await page.goto('/tcgsets');
    await page.waitForLoadState('networkidle');
    
    // Click on first available set
    const firstSet = await page.locator('[data-testid="tcg-set-card"], a[href^="/tcgsets/"]').first();
    const setExists = await firstSet.isVisible().catch(() => false);
    
    if (setExists) {
      await firstSet.click();
      
      // Should show loading state or content, not error
      await page.waitForSelector('text=/Loading|Base Set|Sword|Scarlet/', { timeout: 10000 });
      
      // Should not show hooks error
      const hasHooksError = await page.locator('text=/Rendered more hooks/').count();
      expect(hasHooksError).toBe(0);
    }
  });
});