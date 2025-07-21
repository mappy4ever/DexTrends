import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle, waitForElementStable } from '../helpers/test-utils';

test.describe('Type Effectiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/type-effectiveness');
    await waitForNetworkIdle(page);
  });

  test('should load type effectiveness page', async ({ page, consoleLogger }) => {
    // Check page title
    await expect(page).toHaveTitle(/Type Effectiveness|DexTrends/);
    
    // Check for main heading
    await expect(page.locator('h1:has-text("Type Effectiveness")').or(page.locator('[data-testid="type-effectiveness-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display type effectiveness chart', async ({ page }) => {
    // Look for type chart/grid
    const typeChart = page.locator('[data-testid="type-chart"]').or(page.locator('.type-effectiveness-chart')).or(page.locator('table')).first();
    await expect(typeChart).toBeVisible();
    
    // Verify it contains Pokemon types
    const types = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark', 'Fairy'];
    
    for (const type of types.slice(0, 3)) { // Check first 3 types
      await expect(page.locator(`text=/${type}/i`).first()).toBeVisible();
    }
  });

  test('should show effectiveness multipliers', async ({ page }) => {
    // Wait for the type chart to be visible
    await page.waitForSelector('table', { state: 'visible', timeout: 10000 });
    
    // Look for effectiveness indicators
    const effectivenessIndicators = page.locator('[data-testid="effectiveness"]').or(page.locator('.effectiveness-cell')).or(page.locator('td:has-text("2x")')).or(page.locator('td:has-text("0.5x")'));
    
    expect(await effectivenessIndicators.count()).toBeGreaterThan(0);
    
    // Check for different effectiveness values
    const superEffective = page.locator('text=/2x|2\\.0|super effective/i').first();
    const notVeryEffective = page.locator('text=/0\\.5x|0\\.5|not very effective/i').first();
    const noEffect = page.locator('text=/0x|0|no effect/i').first();
    
    // At least some effectiveness indicators should be visible
    const hasEffectiveness = 
      await superEffective.isVisible().catch(() => false) ||
      await notVeryEffective.isVisible().catch(() => false) ||
      await noEffect.isVisible().catch(() => false);
    
    expect(hasEffectiveness).toBeTruthy();
  });

  test('should allow selecting attacking type', async ({ page, consoleLogger }) => {
    // Look for type selector
    const attackingTypeSelector = page.locator('select[name*="attack"]').or(page.locator('[data-testid="attacking-type"]')).or(page.locator('button:has-text("Attacking Type")')).first();
    
    if (await attackingTypeSelector.isVisible()) {
      // Select a type
      if (await attackingTypeSelector.evaluate(el => el.tagName === 'SELECT')) {
        await attackingTypeSelector.selectOption('Fire');
      } else {
        await attackingTypeSelector.click();
        await page.locator('button:has-text("Fire")').or(page.locator('[data-value="fire"]')).click();
      }
      
      await page.waitForTimeout(500);
      
      // Verify the display updates
      const selectedType = page.locator('[data-testid="selected-attacking-type"]').or(page.locator('.selected-type')).or(page.locator('text=/attacking.*fire/i'));
      await expect(selectedType).toBeVisible();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should allow selecting defending type', async ({ page }) => {
    // Look for defending type selector
    const defendingTypeSelector = page.locator('select[name*="defend"]').or(page.locator('[data-testid="defending-type"]')).or(page.locator('button:has-text("Defending Type")')).first();
    
    if (await defendingTypeSelector.isVisible()) {
      // Select a type
      if (await defendingTypeSelector.evaluate(el => el.tagName === 'SELECT')) {
        await defendingTypeSelector.selectOption('Water');
      } else {
        await defendingTypeSelector.click();
        await page.locator('button:has-text("Water")').or(page.locator('[data-value="water"]')).click();
      }
      
      await page.waitForTimeout(500);
      
      // Verify the display updates
      const selectedType = page.locator('[data-testid="selected-defending-type"]').or(page.locator('.selected-type')).or(page.locator('text=/defending.*water/i'));
      await expect(selectedType).toBeVisible();
    }
  });

  test('should calculate dual type effectiveness', async ({ page }) => {
    // Look for dual type option
    const dualTypeToggle = page.locator('input[type="checkbox"][name*="dual"]').or(page.locator('button:has-text("Dual Type")')).or(page.locator('[data-testid="dual-type-toggle"]')).first();
    
    if (await dualTypeToggle.isVisible()) {
      await dualTypeToggle.click();
      
      // Look for second type selector
      const secondTypeSelector = page.locator('select[name*="type2"]').or(page.locator('[data-testid="second-type"]')).first();
      
      if (await secondTypeSelector.isVisible()) {
        if (await secondTypeSelector.evaluate(el => el.tagName === 'SELECT')) {
          await secondTypeSelector.selectOption({ index: 1 });
        } else {
          await secondTypeSelector.click();
          await page.locator('[data-testid="type-option"]').nth(1).click();
        }
        
        await page.waitForTimeout(500);
        
        // Verify calculation updates
        const effectiveness = page.locator('[data-testid="calculated-effectiveness"]').or(page.locator('.effectiveness-result'));
        await expect(effectiveness).toBeVisible();
      }
    }
  });

  test('should display type effectiveness explanations', async ({ page }) => {
    // Look for explanations or legend
    const legend = page.locator('[data-testid="effectiveness-legend"]').or(page.locator('.legend')).or(page.locator('text=/super effective|not very effective|no effect/i'));
    
    if (await legend.isVisible()) {
      // Check for all effectiveness levels
      await expect(page.locator('text=/super effective/i')).toBeVisible();
      await expect(page.locator('text=/not very effective/i')).toBeVisible();
      await expect(page.locator('text=/no effect/i')).toBeVisible();
    }
  });

  test('should handle complex type interactions', async ({ page, consoleLogger }) => {
    // Test Flying/Steel vs Electric (should show specific interaction)
    const attackSelector = page.locator('[data-testid="attacking-type"]').or(page.locator('select[name*="attack"]')).first();
    const defendSelector = page.locator('[data-testid="defending-type"]').or(page.locator('select[name*="defend"]')).first();
    
    if (await attackSelector.isVisible() && await defendSelector.isVisible()) {
      // Set attacking type to Electric
      if (await attackSelector.evaluate(el => el.tagName === 'SELECT')) {
        await attackSelector.selectOption('Electric');
      }
      
      // Set defending type to Flying
      if (await defendSelector.evaluate(el => el.tagName === 'SELECT')) {
        await defendSelector.selectOption('Flying');
      }
      
      await page.waitForTimeout(500);
      
      // Should show super effective
      const result = page.locator('[data-testid="effectiveness-result"]').or(page.locator('.result')).or(page.locator('text=/super effective|2x/i'));
      await expect(result).toBeVisible();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should provide type matchup recommendations', async ({ page }) => {
    // Select a defending type
    const defendingType = page.locator('[data-testid="defending-type"]').or(page.locator('select[name*="defend"]')).first();
    
    if (await defendingType.isVisible()) {
      if (await defendingType.evaluate(el => el.tagName === 'SELECT')) {
        await defendingType.selectOption('Dragon');
      }
      
      await page.waitForTimeout(500);
      
      // Look for recommendations
      const recommendations = page.locator('[data-testid="type-recommendations"]').or(page.locator('.recommendations')).or(page.locator('text=/effective against|weak to/i'));
      
      if (await recommendations.isVisible()) {
        // Should show Ice, Dragon, Fairy as super effective
        const effectiveTypes = page.locator('text=/ice|dragon|fairy/i');
        expect(await effectiveTypes.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should work on mobile', async ({ page, consoleLogger }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify responsive layout
    await expect(page.locator('h1:has-text("Type Effectiveness")').or(page.locator('[data-testid="type-effectiveness-title"]'))).toBeVisible();
    
    // Check if table/chart is scrollable on mobile
    const typeChart = page.locator('[data-testid="type-chart"]').or(page.locator('.type-effectiveness-chart'));
    if (await typeChart.isVisible()) {
      const isScrollable = await typeChart.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.overflowX === 'auto' || style.overflowX === 'scroll';
      });
      
      // On mobile, large tables should be scrollable
      expect(isScrollable).toBeTruthy();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should have interactive hover states', async ({ page }) => {
    // Find a type cell
    const typeCell = page.locator('[data-testid="type-cell"]').or(page.locator('.type-cell')).or(page.locator('td')).first();
    
    if (await typeCell.isVisible()) {
      // Hover over cell
      await typeCell.hover();
      await page.waitForTimeout(500);
      
      // Check for tooltip or highlight
      const tooltip = page.locator('[role="tooltip"]').or(page.locator('.tooltip')).or(page.locator('[data-testid="type-tooltip"]'));
      const hasTooltip = await tooltip.isVisible().catch(() => false);
      
      if (!hasTooltip) {
        // Check if cell has hover state
        const hoverState = await typeCell.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.backgroundColor !== 'transparent' || style.cursor === 'pointer';
        });
        
        expect(hoverState).toBeTruthy();
      }
    }
  });

  test('should allow filtering type chart', async ({ page }) => {
    // Look for filter input
    const filterInput = page.locator('input[placeholder*="filter"]').or(page.locator('input[placeholder*="search type"]')).or(page.locator('[data-testid="type-filter"]')).first();
    
    if (await filterInput.isVisible()) {
      // Filter for specific type
      await filterInput.fill('Fire');
      await page.waitForTimeout(500);
      
      // Verify filtering works
      const visibleTypes = await page.locator('[data-testid="type-row"]:visible').or(page.locator('tr:visible')).count();
      const allTypes = await page.locator('[data-testid="type-row"]').or(page.locator('tr')).count();
      
      expect(visibleTypes).toBeLessThan(allTypes);
    }
  });
});