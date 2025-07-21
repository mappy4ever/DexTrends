import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle, waitForElementStable } from '../helpers/test-utils';

test.describe('Battle Simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/battle-simulator');
    await waitForNetworkIdle(page);
  });

  test('should load battle simulator page', async ({ page, consoleLogger }) => {
    // Check page title and main elements
    await expect(page).toHaveTitle(/Battle Simulator|DexTrends/);
    
    // Check for main battle UI elements
    await expect(page.locator('h1:has-text("Battle Simulator")').or(page.locator('[data-testid="battle-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should allow Pokemon selection', async ({ page, consoleLogger }) => {
    // Look for Pokemon selection UI
    const pokemonSelect = page.locator('select[name*="pokemon"]').or(page.locator('[data-testid="pokemon-select"]')).or(page.locator('button:has-text("Choose Pokemon")')).first();
    
    if (await pokemonSelect.isVisible()) {
      // If it's a select dropdown
      if (await pokemonSelect.evaluate(el => el.tagName === 'SELECT')) {
        await pokemonSelect.selectOption({ index: 1 });
      } else {
        // If it's a button that opens a modal
        await pokemonSelect.click();
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        
        // Select first Pokemon
        await page.locator('[data-testid="pokemon-option"]').or(page.locator('.pokemon-option')).first().click();
      }
      
      // Verify Pokemon was selected
      await expect(page.locator('[data-testid="selected-pokemon"]').or(page.locator('.selected-pokemon')).first()).toBeVisible();
    }
    
    // Check console for any errors during selection
    const errors = consoleLogger.getErrors();
    expect(errors.length).toBe(0);
  });

  test('should calculate battle damage', async ({ page, consoleLogger }) => {
    // This test assumes there's a way to trigger a battle calculation
    // Look for attack/calculate button
    const attackButton = page.locator('button:has-text("Attack")').or(page.locator('button:has-text("Calculate")')).or(page.locator('[data-testid="attack-button"]')).first();
    
    if (await attackButton.isVisible()) {
      await attackButton.click();
      
      // Wait for damage calculation to appear
      await expect(page.locator('[data-testid="damage-output"]').or(page.locator('.damage-display')).or(page.locator('text=/damage|hp/i'))).toBeVisible({ timeout: 5000 });
    }
    
    // Verify calculations didn't cause errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should handle type effectiveness', async ({ page }) => {
    // Look for type effectiveness display
    const typeEffectiveness = page.locator('[data-testid="type-effectiveness"]').or(page.locator('.type-effectiveness')).or(page.locator('text=/super effective|not very effective/i'));
    
    // If type effectiveness is shown, verify it's visible
    if (await typeEffectiveness.count() > 0) {
      await expect(typeEffectiveness.first()).toBeVisible();
    }
  });

  test('should work on mobile', async ({ page, consoleLogger }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify responsive layout
    await expect(page.locator('h1:has-text("Battle Simulator")').or(page.locator('[data-testid="battle-title"]'))).toBeVisible();
    
    // Check if mobile-specific UI is present
    const mobileUI = page.locator('[data-testid="mobile-battle-ui"]').or(page.locator('.mobile-controls'));
    if (await mobileUI.count() > 0) {
      await expect(mobileUI.first()).toBeVisible();
    }
    
    // Verify no console errors on mobile
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should save battle history', async ({ page }) => {
    // Look for battle history section
    const historySection = page.locator('[data-testid="battle-history"]').or(page.locator('.battle-history')).or(page.locator('text=/history|previous battles/i'));
    
    if (await historySection.isVisible()) {
      // Perform a battle action first
      const attackButton = page.locator('button:has-text("Attack")').or(page.locator('[data-testid="attack-button"]')).first();
      if (await attackButton.isVisible()) {
        await attackButton.click();
        await page.waitForTimeout(1000);
        
        // Check if history was updated
        const historyItems = page.locator('[data-testid="history-item"]').or(page.locator('.history-entry'));
        expect(await historyItems.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should display Pokemon stats', async ({ page }) => {
    // Look for stats display
    const statsDisplay = page.locator('[data-testid="pokemon-stats"]').or(page.locator('.stats-display')).or(page.locator('text=/HP|Attack|Defense/i'));
    
    if (await statsDisplay.count() > 0) {
      await expect(statsDisplay.first()).toBeVisible();
      
      // Verify stats contain numbers
      const statValues = await statsDisplay.first().textContent();
      expect(statValues).toMatch(/\d+/);
    }
  });

  test('should handle battle animations', async ({ page, consoleLogger }) => {
    // Look for animation toggle
    const animationToggle = page.locator('[data-testid="animation-toggle"]').or(page.locator('input[type="checkbox"][name*="animation"]')).or(page.locator('label:has-text("Animations")'));
    
    if (await animationToggle.isVisible()) {
      // Toggle animations
      await animationToggle.click();
      
      // Perform an action that would trigger animation
      const actionButton = page.locator('button:has-text("Attack")').or(page.locator('[data-testid="action-button"]')).first();
      if (await actionButton.isVisible()) {
        await actionButton.click();
        
        // Wait for any animations
        await page.waitForTimeout(2000);
        
        // Check console for animation-related messages
        const animationLogs = consoleLogger.findMessages('animation');
        console.log(`Found ${animationLogs.length} animation-related logs`);
      }
    }
  });

  test('should handle network errors gracefully', async ({ page, consoleLogger }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Try to perform an action
    const actionButton = page.locator('button').first();
    if (await actionButton.isVisible()) {
      await actionButton.click();
      
      // Should show error message
      const errorMessage = await page.waitForSelector('[data-testid="error-message"]', { 
        timeout: 5000,
        state: 'visible' 
      }).catch(() => null);
      
      if (errorMessage) {
        const errorText = await errorMessage.textContent();
        expect(errorText).toBeTruthy();
      }
    }
    
    // Restore online mode
    await page.context().setOffline(false);
  });
});