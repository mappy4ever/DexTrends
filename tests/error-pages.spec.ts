import { test, expect } from '@playwright/test';

test.describe('Error Pages', () => {
  test('should show 404 page for non-existent routes', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/this-page-does-not-exist');
    
    // Should see the 404 page content, NOT ErrorBoundary
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('This Pokemon has fled!')).toBeVisible();
    await expect(page.getByText('Return to Pallet Town')).toBeVisible();
  });

  test('404 page navigation buttons should work', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Click "Return to Pallet Town" button
    await page.getByText('Return to Pallet Town').click();
    
    // Should navigate to home page
    await page.waitForLoadState('load');
    await expect(page).toHaveURL('/');
  });

  test('should not show ErrorBoundary for navigation errors', async ({ page }) => {
    // Navigate to a route that doesn't exist
    await page.goto('/route/that/does/not/exist');
    
    // Should NOT see the ErrorBoundary "Something went wrong" message
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
    
    // Should see 404 page instead
    await expect(page.getByText('404')).toBeVisible();
  });
  
});