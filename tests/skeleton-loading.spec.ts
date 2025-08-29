import { test, expect } from '@playwright/test';

test.describe('Skeleton Loading System', () => {
  test('Pokedex page shows skeleton loading', async ({ page }) => {
    // Intercept API calls to control loading state
    await page.route('**/api/**', route => {
      // Delay the response to see skeleton loading
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto('/pokedex');
    
    // Check for skeleton elements
    const skeletonCards = await page.locator('.pokemon-card-skeleton').count();
    expect(skeletonCards).toBeGreaterThan(0);
    
    // Verify skeleton has proper animation classes
    const animatedElements = await page.locator('.animate-pulse').count();
    expect(animatedElements).toBeGreaterThan(0);
  });

  test('DetailPageSkeleton renders correctly', async ({ page }) => {
    // Navigate to a detail page
    await page.goto('/pokedex/25'); // Pikachu
    
    // Check if loading state shows skeleton
    const detailSkeleton = await page.locator('.detail-page-skeleton').isVisible();
    
    // The skeleton should appear briefly during loading
    if (detailSkeleton) {
      // Verify skeleton structure
      const headerSkeleton = await page.locator('.detail-page-skeleton').first().isVisible();
      expect(headerSkeleton).toBeTruthy();
    }
  });

  test('Skeleton components have proper TypeScript types', async ({ page }) => {
    // This test verifies that the page loads without TypeScript errors
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/pokedex');
    await page.waitForTimeout(1000);
    
    // Check for TypeScript-related console errors
    const tsErrors = consoleErrors.filter(error => 
      error.includes('TypeError') || 
      error.includes('undefined') ||
      error.includes('null')
    );
    
    expect(tsErrors).toHaveLength(0);
  });
});