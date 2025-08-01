import { test, expect } from '@playwright/test';

test.describe('Basic UI Components Test', () => {
  test('Can load the UI components test page', async ({ page }) => {
    // Navigate to the test page
    await page.goto('/ui-components-test');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the main title is visible
    await expect(page.locator('h1:has-text("UI Components Test Suite")')).toBeVisible();
    
    // Check if form components section exists
    await expect(page.locator('h2:has-text("Form Components")')).toBeVisible();
    
    // Check if progress indicators section exists
    await expect(page.locator('h2:has-text("Progress Indicators")')).toBeVisible();
    
    // Check if interactive components section exists
    await expect(page.locator('h2:has-text("Interactive Components")')).toBeVisible();
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'ui-components-test-page.png', fullPage: true });
  });

  test('Form components are visible', async ({ page }) => {
    await page.goto('/ui-components-test');
    await page.waitForLoadState('networkidle');
    
    // Check for input
    const inputLabel = page.locator('text=Enhanced Input');
    await expect(inputLabel).toBeVisible();
    
    // Check for select
    const selectLabel = page.locator('text=Enhanced Select');
    await expect(selectLabel).toBeVisible();
    
    // Check for textarea
    const textareaLabel = page.locator('text=Enhanced Textarea');
    await expect(textareaLabel).toBeVisible();
    
    // Check for switch
    const switchLabel = page.locator('text=Enhanced Switch');
    await expect(switchLabel).toBeVisible();
  });

  test('Progress components are visible', async ({ page }) => {
    await page.goto('/ui-components-test');
    await page.waitForLoadState('networkidle');
    
    // Check for circular progress section
    await expect(page.locator('text=Circular Progress')).toBeVisible();
    
    // Check for linear progress section
    await expect(page.locator('text=Linear Progress')).toBeVisible();
    
    // Check for step progress section
    await expect(page.locator('text=Step Progress')).toBeVisible();
    
    // Check for increase progress button
    await expect(page.locator('button:has-text("Increase Progress")')).toBeVisible();
  });

  test('Toast demo buttons are visible', async ({ page }) => {
    await page.goto('/ui-components-test');
    await page.waitForLoadState('networkidle');
    
    // Check for toast section
    await expect(page.locator('text=Toast Notifications')).toBeVisible();
    
    // Check for toast buttons
    await expect(page.locator('button:has-text("Show Success Toast")')).toBeVisible();
    await expect(page.locator('button:has-text("Show Error Toast")')).toBeVisible();
    await expect(page.locator('button:has-text("Show Info Toast")')).toBeVisible();
  });
});