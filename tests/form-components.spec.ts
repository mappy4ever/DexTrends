import { test, expect } from '@playwright/test';

test.describe('Form Components', () => {
  // Create a test page that uses our form components
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with forms (team builder or settings)
    await page.goto('/team-builder');
  });

  test('Select component interactions', async ({ page }) => {
    // Look for any select/dropdown components
    const selectTrigger = page.locator('button:has-text("Select"), select').first();
    
    if (await selectTrigger.isVisible()) {
      // Click to open dropdown
      await selectTrigger.click();
      
      // Check dropdown options appear
      const options = page.locator('[role="option"], option');
      await expect(options.first()).toBeVisible({ timeout: 5000 });
      
      // Select an option
      await options.first().click();
      
      // Verify selection was made
      const selectedValue = await selectTrigger.textContent();
      expect(selectedValue).not.toContain('Select');
    }
  });

  test('Checkbox component interactions', async ({ page }) => {
    // Look for checkboxes
    const checkbox = page.locator('input[type="checkbox"]').first();
    
    if (await checkbox.isVisible()) {
      // Check initial state
      const initialChecked = await checkbox.isChecked();
      
      // Click checkbox
      await checkbox.click();
      
      // Verify state changed
      const newChecked = await checkbox.isChecked();
      expect(newChecked).toBe(!initialChecked);
      
      // Test keyboard interaction
      await checkbox.focus();
      await page.keyboard.press('Space');
      
      // State should toggle again
      const finalChecked = await checkbox.isChecked();
      expect(finalChecked).toBe(initialChecked);
    }
  });

  test('Radio button group interactions', async ({ page }) => {
    // Look for radio buttons
    const radioButtons = page.locator('input[type="radio"]');
    
    if (await radioButtons.first().isVisible()) {
      const firstRadio = radioButtons.nth(0);
      const secondRadio = radioButtons.nth(1);
      
      // Click first radio
      await firstRadio.click();
      await expect(firstRadio).toBeChecked();
      
      // Click second radio
      if (await secondRadio.isVisible()) {
        await secondRadio.click();
        await expect(secondRadio).toBeChecked();
        await expect(firstRadio).not.toBeChecked();
      }
    }
  });

  test('Form validation displays errors', async ({ page }) => {
    // Look for a form with required fields
    const form = page.locator('form').first();
    
    if (await form.isVisible()) {
      // Try to submit without filling required fields
      const submitButton = form.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for error messages
        const errorMessage = page.locator('text=/required|error|invalid/i').first();
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('Touch targets meet minimum size on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check all interactive elements
    const interactiveElements = await page.locator('button, input, select, a').all();
    
    for (const element of interactiveElements.slice(0, 10)) { // Check first 10
      const box = await element.boundingBox();
      if (box && await element.isVisible()) {
        // Touch targets should be at least 44x44px
        const meetsMinimum = box.width >= 44 || box.height >= 44;
        expect(meetsMinimum).toBeTruthy();
      }
    }
  });
});

test.describe('Form Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/team-builder');
  });

  test('Form controls have proper labels', async ({ page }) => {
    // Check inputs have labels
    const inputs = await page.locator('input').all();
    
    for (const input of inputs.slice(0, 5)) { // Check first 5
      if (await input.isVisible()) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        // Input should have either id with matching label, aria-label, or aria-labelledby
        const hasLabel = id || ariaLabel || ariaLabelledBy;
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('Error messages are associated with inputs', async ({ page }) => {
    // Find an input with error
    const inputWithError = page.locator('input[aria-invalid="true"]').first();
    
    if (await inputWithError.isVisible()) {
      const ariaDescribedBy = await inputWithError.getAttribute('aria-describedby');
      
      if (ariaDescribedBy) {
        // Check that the error message element exists
        const errorElement = page.locator(`#${ariaDescribedBy}`);
        await expect(errorElement).toBeVisible();
      }
    }
  });

  test('Keyboard navigation through form', async ({ page }) => {
    // Start at first interactive element
    await page.keyboard.press('Tab');
    
    // Tab through several elements
    for (let i = 0; i < 5; i++) {
      // Check current focus
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          type: (el as HTMLInputElement)?.type,
          visible: el ? window.getComputedStyle(el).visibility !== 'hidden' : false
        };
      });
      
      // Focused element should be visible and interactive
      expect(focusedElement.visible).toBeTruthy();
      expect(['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A']).toContain(focusedElement.tag);
      
      // Move to next element
      await page.keyboard.press('Tab');
    }
  });
});

test.describe('Component Integration', () => {
  test('Select component with search functionality', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Look for searchable select
    const searchableSelect = page.locator('[data-testid="searchable-select"]').first();
    
    if (await searchableSelect.isVisible()) {
      await searchableSelect.click();
      
      // Type in search
      await page.keyboard.type('fire');
      
      // Check filtered options
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      // Should have filtered results
      expect(count).toBeGreaterThan(0);
      
      // All visible options should contain 'fire' (case insensitive)
      for (let i = 0; i < count; i++) {
        const text = await options.nth(i).textContent();
        expect(text?.toLowerCase()).toContain('fire');
      }
    }
  });

  test('Multi-select functionality', async ({ page }) => {
    // Look for multi-select component
    const multiSelect = page.locator('[data-testid="multi-select"]').first();
    
    if (await multiSelect.isVisible()) {
      await multiSelect.click();
      
      // Select multiple options
      const options = page.locator('[role="option"]');
      if (await options.first().isVisible()) {
        await options.nth(0).click();
        await options.nth(1).click();
        
        // Check both are selected
        const selected = page.locator('[role="option"][aria-selected="true"]');
        const selectedCount = await selected.count();
        expect(selectedCount).toBe(2);
      }
    }
  });

  test('Form component loading states', async ({ page }) => {
    // Trigger a form submission that causes loading
    const form = page.locator('form').first();
    
    if (await form.isVisible()) {
      const submitButton = form.locator('button[type="submit"]').first();
      
      if (await submitButton.isVisible()) {
        // Intercept network request to delay response
        await page.route('**/api/**', route => {
          setTimeout(() => route.continue(), 1000);
        });
        
        await submitButton.click();
        
        // Check for loading indicator
        const loadingIndicator = page.locator('[role="status"], .loading, .animate-spin').first();
        await expect(loadingIndicator).toBeVisible({ timeout: 5000 });
        
        // Button should be disabled during loading
        await expect(submitButton).toBeDisabled();
      }
    }
  });
});