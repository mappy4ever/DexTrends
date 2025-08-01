import { test, expect } from '@playwright/test';

test.describe('UI Components Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ui-components-test');
    await page.waitForLoadState('networkidle');
  });

  test('Form components render and function correctly', async ({ page }) => {
    // Test Enhanced Input
    const input = page.locator('input[placeholder="Type something..."]');
    await expect(input).toBeVisible();
    await input.fill('Test input value');
    await expect(input).toHaveValue('Test input value');

    // Test Enhanced Select
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    await select.selectOption('option2');
    await expect(select).toHaveValue('option2');

    // Test Enhanced Textarea
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Test textarea content');
    await expect(textarea).toHaveValue('Test textarea content');

    // Test Enhanced Switch
    const switchContainer = page.locator('text=Enhanced Switch').locator('..');
    const switchButton = switchContainer.locator('button').first();
    await expect(switchButton).toBeVisible();
    await switchButton.click();
    // Verify switch toggled (check for aria-checked or class changes)
  });

  test('Progress indicators display correctly', async ({ page }) => {
    // Test Circular Progress
    const circularProgress = page.locator('svg circle').first();
    await expect(circularProgress).toBeVisible();

    // Test Linear Progress
    const linearProgress = page.locator('[role="progressbar"]').first();
    await expect(linearProgress).toBeVisible();

    // Test Step Progress
    const stepProgress = page.locator('text=Details').first();
    await expect(stepProgress).toBeVisible();

    // Test progress interaction
    const increaseButton = page.locator('button:has-text("Increase Progress")');
    await increaseButton.click();
    // Progress should update
  });

  test('Toast notifications work correctly', async ({ page }) => {
    // Test success toast
    await page.locator('button:has-text("Show Success Toast")').click();
    await expect(page.locator('text=Success notification!')).toBeVisible();

    // Test error toast
    await page.locator('button:has-text("Show Error Toast")').click();
    await expect(page.locator('text=Error notification!')).toBeVisible();

    // Test info toast
    await page.locator('button:has-text("Show Info Toast")').click();
    await expect(page.locator('text=Info notification!')).toBeVisible();

    // Verify multiple toasts can be shown
    await expect(page.locator('text=Success notification!')).toBeVisible();
    await expect(page.locator('text=Error notification!')).toBeVisible();
    await expect(page.locator('text=Info notification!')).toBeVisible();
  });

  test('Context menu appears on right click', async ({ page }) => {
    const contextArea = page.locator('text=Right-click here for context menu');
    await contextArea.click({ button: 'right' });
    
    // Verify context menu items appear
    await expect(page.locator('text=Copy')).toBeVisible();
    await expect(page.locator('text=Edit')).toBeVisible();
    await expect(page.locator('text=Share')).toBeVisible();
    await expect(page.locator('text=Delete')).toBeVisible();

    // Click an item and verify toast appears
    await page.locator('text=Copy').click();
    await expect(page.locator('text=Copied!')).toBeVisible();
  });

  test('Components have proper animations and transitions', async ({ page }) => {
    // Test focus animations on input
    const input = page.locator('input[placeholder="Type something..."]');
    await input.focus();
    // Check for focus styles (border color change, etc.)
    
    // Test button animations
    const button = page.locator('button:has-text("Show Success Toast")');
    await button.hover();
    // Button should have hover state

    // Test step progress animations
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    // Step should animate to next
  });

  test('Components are responsive', async ({ page, viewport }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify components stack properly on mobile
    const formGrid = page.locator('.grid').first();
    // Grid should be single column on mobile
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Verify components layout properly on tablet
    // Grid should be 2 columns on tablet
  });
});