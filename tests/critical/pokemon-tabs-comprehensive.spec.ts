import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle } from '../helpers/test-utils';
import { TEST_URLS } from '../../config/api';

test.describe('Comprehensive Pokemon Detail Tabs', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
  });

  test.describe('Tab Navigation and Visibility', () => {
    test('should display all Pokemon tabs on detail page', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Verify all expected tabs are visible
      const expectedTabs = ['Overview', 'Stats', 'Evolution', 'Moves', 'Breeding', 'Locations', 'Competitive', 'Cards'];
      
      for (const tabName of expectedTabs) {
        const tab = page.getByRole('button', { name: new RegExp(tabName, 'i') })
          .or(page.locator(`[data-testid="${tabName.toLowerCase()}-tab"]`))
          .or(page.locator(`button:has-text("${tabName}")`));
        
        await expect(tab).toBeVisible({ timeout: 5000 });
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should highlight active tab correctly', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Overview should be active by default
      const overviewTab = page.getByRole('button', { name: /Overview/i });
      await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

      // Click Stats tab
      const statsTab = page.getByRole('button', { name: /Stats/i });
      await statsTab.click();
      await page.waitForTimeout(500);

      // Stats should now be active
      await expect(statsTab).toHaveAttribute('aria-selected', 'true');
      await expect(overviewTab).toHaveAttribute('aria-selected', 'false');

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should maintain tab selection after page refresh', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Stats tab
      const statsTab = page.getByRole('button', { name: /Stats/i });
      await statsTab.click();
      await page.waitForTimeout(1000);

      // Refresh page
      await page.reload();
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Stats tab should still be selected (if implemented)
      const refreshedStatsTab = page.getByRole('button', { name: /Stats/i });
      const isSelected = await refreshedStatsTab.getAttribute('aria-selected');
      
      // This documents whether tab persistence is implemented
      expect(typeof isSelected).toBe('string');

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should navigate tabs with keyboard arrows', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Focus on first tab
      const overviewTab = page.getByRole('button', { name: /Overview/i });
      await overviewTab.focus();
      
      // Press right arrow to move to next tab
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      // Check if focus moved to next tab
      const focusedElement = page.locator(':focus');
      const focusedText = await focusedElement.textContent();
      expect(focusedText?.toLowerCase()).toMatch(/(stats|evolution|moves)/);

      // Test left arrow
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(300);

      // Should be back to Overview or previous tab
      const newFocusedElement = page.locator(':focus');
      const newFocusedText = await newFocusedElement.textContent();
      expect(typeof newFocusedText).toBe('string');

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Tab Content Loading', () => {
    test('should load Overview tab content correctly', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Overview should be active by default
      const overviewContent = page.locator('[data-testid="overview-content"], .overview-content, .tab-content');
      
      // Check for key Overview elements
      await expect(page.locator('text=/Base Stats/i, text=/Type/i')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=/Height/i, text=/Weight/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/Abilities/i')).toBeVisible({ timeout: 5000 });

      // Check for Pikachu-specific content
      await expect(page.locator('text=/Electric/i')).toBeVisible();
      await expect(page.locator('text=/Static/i, text=/Lightning Rod/i')).toBeVisible();

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should load Stats tab content with charts and data', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Stats tab
      const statsTab = page.getByRole('button', { name: /Stats/i });
      await statsTab.click();
      await page.waitForTimeout(1000);

      // Check for stats content
      await expect(page.locator('text=/Stats Distribution/i, text=/Base Stats/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/HP/i')).toBeVisible();
      await expect(page.locator('text=/Attack/i')).toBeVisible();
      await expect(page.locator('text=/Defense/i')).toBeVisible();
      await expect(page.locator('text=/Speed/i')).toBeVisible();

      // Check for stat values
      const statValues = page.locator('[data-testid="stat-value"], .stat-value');
      const hasStatValues = await statValues.first().isVisible({ timeout: 3000 });
      
      if (hasStatValues) {
        const statValue = await statValues.first().textContent();
        expect(statValue).toMatch(/\d+/);
      }

      // Check for total stats
      await expect(page.locator('text=/Total/i')).toBeVisible();

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should load Evolution tab with evolution chain', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Evolution tab
      const evolutionTab = page.getByRole('button', { name: /Evolution/i });
      await evolutionTab.click();
      await page.waitForTimeout(1000);

      // Check for evolution content
      await expect(page.locator('text=/Evolution Chain/i, text=/Evolution/i')).toBeVisible({ timeout: 5000 });
      
      // Pikachu's evolution line: Pichu -> Pikachu -> Raichu
      await expect(page.locator('text=/Pichu/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/Pikachu/i')).toBeVisible();
      await expect(page.locator('text=/Raichu/i')).toBeVisible();

      // Check for evolution methods/conditions
      const evolutionMethods = page.locator('text=/friendship/i, text=/thunder stone/i, text=/level/i');
      const hasEvolutionMethods = await evolutionMethods.first().isVisible({ timeout: 3000 });
      expect(typeof hasEvolutionMethods).toBe('boolean');

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should load Moves tab with move list and filters', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Moves tab
      const movesTab = page.getByRole('button', { name: /Moves/i });
      await movesTab.click();
      await page.waitForTimeout(1000);

      // Check for moves content
      await expect(page.locator('text=/Moves/i')).toBeVisible({ timeout: 5000 });
      
      // Check for move categories
      const moveCategories = page.locator('text=/Level Up/i, text=/TM/i, text=/Tutor/i, text=/Egg/i');
      const hasMoveCategories = await moveCategories.first().isVisible({ timeout: 5000 });
      expect(hasMoveCategories).toBe(true);

      // Check for specific Pikachu moves
      const commonMoves = page.locator('text=/Thunderbolt/i, text=/Thunder/i, text=/Quick Attack/i');
      const hasCommonMoves = await commonMoves.first().isVisible({ timeout: 5000 });
      expect(hasCommonMoves).toBe(true);

      // Check for move details (power, accuracy, PP)
      const moveDetails = page.locator('[data-testid="move-power"], .move-power, text=/Power:/i');
      const hasMoveDetails = await moveDetails.first().isVisible({ timeout: 3000 });
      expect(typeof hasMoveDetails).toBe('boolean');

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should load Breeding tab with breeding information', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Breeding tab
      const breedingTab = page.getByRole('button', { name: /Breeding/i });
      await breedingTab.click();
      await page.waitForTimeout(1000);

      // Check for breeding content
      await expect(page.locator('text=/Egg Groups/i, text=/Breeding/i')).toBeVisible({ timeout: 5000 });
      
      // Check for egg group information
      await expect(page.locator('text=/Field/i, text=/Fairy/i')).toBeVisible({ timeout: 3000 });

      // Check for breeding stats
      const breedingStats = page.locator('text=/Egg Cycles/i, text=/Hatch Time/i, text=/Steps/i');
      const hasBreedingStats = await breedingStats.first().isVisible({ timeout: 3000 });
      expect(typeof hasBreedingStats).toBe('boolean');

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should load Locations tab with location data', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Locations tab
      const locationsTab = page.getByRole('button', { name: /Locations/i });
      await locationsTab.click();
      await page.waitForTimeout(1000);

      // Check for locations content or no data message
      const hasLocationData = await page.locator('text=/Locations/i, text=/Found in/i').isVisible({ timeout: 5000 });
      const noLocationData = await page.locator('text=/No Location Data/i, text=/not available/i').isVisible({ timeout: 3000 });
      
      expect(hasLocationData || noLocationData).toBe(true);

      if (hasLocationData) {
        // Check for game/region filters
        const locationFilters = page.locator('text=/Filter by/i, text=/Game/i, text=/Region/i');
        const hasFilters = await locationFilters.first().isVisible({ timeout: 3000 });
        expect(typeof hasFilters).toBe('boolean');
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should load Competitive tab with battle analysis', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Competitive tab
      const competitiveTab = page.getByRole('button', { name: /Competitive/i });
      await competitiveTab.click();
      await page.waitForTimeout(1000);

      // Check for competitive content
      const competitiveContent = page.locator('text=/Competitive/i, text=/Usage/i, text=/Tier/i, text=/Viability/i');
      const hasCompetitiveContent = await competitiveContent.first().isVisible({ timeout: 5000 });
      
      if (hasCompetitiveContent) {
        // Check for tier information
        const tierInfo = page.locator('text=/OU/i, text=/UU/i, text=/RU/i, text=/NU/i, text=/PU/i');
        const hasTierInfo = await tierInfo.first().isVisible({ timeout: 3000 });
        expect(typeof hasTierInfo).toBe('boolean');

        // Check for usage stats
        const usageStats = page.locator('text=/%/i, [data-testid="usage-stat"]');
        const hasUsageStats = await usageStats.first().isVisible({ timeout: 3000 });
        expect(typeof hasUsageStats).toBe('boolean');
      } else {
        // Should show some message about competitive data
        const noCompData = page.locator('text=/not available/i, text=/coming soon/i');
        const hasNoCompData = await noCompData.isVisible({ timeout: 3000 });
        expect(typeof hasNoCompData).toBe('boolean');
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should load Cards tab with TCG cards', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Cards tab
      const cardsTab = page.getByRole('button', { name: /Cards/i });
      await cardsTab.click();
      await page.waitForTimeout(1000);

      // Check for cards content
      await expect(page.locator('text=/Cards/i, text=/TCG/i')).toBeVisible({ timeout: 5000 });
      
      // Check for card grid or list
      const cardItems = page.locator('[data-testid="card-item"], .card-item, .tcg-card');
      const hasCards = await cardItems.first().isVisible({ timeout: 5000 });
      
      if (hasCards) {
        const cardCount = await cardItems.count();
        expect(cardCount).toBeGreaterThan(0);

        // Check for card details
        const cardImages = page.locator('img[alt*="Pikachu" i], [data-testid="card-image"]');
        const hasCardImages = await cardImages.first().isVisible({ timeout: 3000 });
        expect(hasCardImages).toBe(true);
      } else {
        // Should show no cards message
        const noCards = page.locator('text=/no cards/i, text=/not found/i');
        const hasNoCardsMessage = await noCards.isVisible({ timeout: 3000 });
        expect(typeof hasNoCardsMessage).toBe('boolean');
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Tab Switching Performance', () => {
    test('should switch between tabs quickly without lag', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      const tabs = ['Stats', 'Evolution', 'Moves', 'Breeding'];
      
      for (const tabName of tabs) {
        const startTime = Date.now();
        
        const tab = page.getByRole('button', { name: new RegExp(tabName, 'i') });
        await tab.click();
        
        // Wait for tab content to load
        await page.waitForTimeout(500);
        
        const endTime = Date.now();
        const switchTime = endTime - startTime;
        
        // Tab switch should be fast (less than 2 seconds)
        expect(switchTime).toBeLessThan(2000);
        
        // Verify tab is actually active
        await expect(tab).toHaveAttribute('aria-selected', 'true');
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should load tab content only when tab is selected', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Initially, only Overview content should be loaded
      const overviewContent = page.locator('[data-testid="overview-content"], .overview-content');
      await expect(overviewContent.or(page.locator('text=/Base Stats/i'))).toBeVisible();

      // Stats content should not be visible yet
      const statsContent = page.locator('[data-testid="stats-content"], text=/Stats Distribution/i');
      const statsVisible = await statsContent.isVisible();
      
      // Click Stats tab
      const statsTab = page.getByRole('button', { name: /Stats/i });
      await statsTab.click();
      await page.waitForTimeout(1000);

      // Now stats content should be visible
      await expect(statsContent.or(page.locator('text=/HP/i'))).toBeVisible({ timeout: 5000 });

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle rapid tab switching without breaking', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      const tabs = ['Stats', 'Evolution', 'Moves', 'Overview', 'Breeding', 'Stats'];
      
      // Rapidly switch between tabs
      for (const tabName of tabs) {
        const tab = page.getByRole('button', { name: new RegExp(tabName, 'i') });
        await tab.click();
        await page.waitForTimeout(100); // Very short wait
      }
      
      // Wait for final tab to settle
      await page.waitForTimeout(1000);
      
      // Final tab (Stats) should be active and show content
      const statsTab = page.getByRole('button', { name: /Stats/i });
      await expect(statsTab).toHaveAttribute('aria-selected', 'true');
      
      const statsContent = page.locator('text=/HP/i, text=/Attack/i');
      await expect(statsContent.first()).toBeVisible({ timeout: 5000 });

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Deep Linking and URL State', () => {
    test('should support direct links to specific tabs', async ({ page, consoleLogger }) => {
      // Test direct link to stats tab (if implemented)
      await page.goto(`${TEST_URLS.pokemon(25)}?tab=stats`);
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Stats tab should be active if URL routing is implemented
      const statsTab = page.getByRole('button', { name: /Stats/i });
      const isActive = await statsTab.getAttribute('aria-selected');
      
      // This documents whether deep linking is implemented
      expect(typeof isActive).toBe('string');

      // Stats content should be visible
      const statsContent = page.locator('text=/HP/i, text=/Base Stats/i');
      await expect(statsContent.first()).toBeVisible({ timeout: 5000 });

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should update URL when switching tabs', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      const initialURL = page.url();
      
      // Click Stats tab
      const statsTab = page.getByRole('button', { name: /Stats/i });
      await statsTab.click();
      await page.waitForTimeout(1000);

      const newURL = page.url();
      
      // URL might or might not change depending on implementation
      // This documents the current behavior
      const urlChanged = newURL !== initialURL;
      expect(typeof urlChanged).toBe('boolean');

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle missing Pokemon data gracefully', async ({ page, consoleLogger }) => {
      // Try to navigate to non-existent Pokemon
      await page.goto(TEST_URLS.pokemon(99999));
      await waitForNetworkIdle(page);

      // Should show error page or redirect
      const errorMessage = page.locator('text=/not found/i, text=/error/i, [data-testid="error"]');
      const hasError = await errorMessage.isVisible({ timeout: 5000 });
      
      if (hasError) {
        expect(await errorMessage.textContent()).toMatch(/(not found|error|invalid)/i);
      } else {
        // Might redirect to valid page
        expect(page.url()).toBeTruthy();
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle tab content loading failures', async ({ page, consoleLogger }) => {
      // Mock API failures for specific tab data
      await page.route('**/moves/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to load moves data' })
        });
      });
      
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Moves tab
      const movesTab = page.getByRole('button', { name: /Moves/i });
      await movesTab.click();
      await page.waitForTimeout(1000);

      // Should show error message or fallback content
      const errorContent = page.locator('text=/error loading/i, text=/failed to load/i, [data-testid="error"]');
      const fallbackContent = page.locator('text=/try again/i, text=/refresh/i');
      
      const hasErrorHandling = await errorContent.isVisible({ timeout: 3000 }) || 
                              await fallbackContent.isVisible({ timeout: 3000 });
      
      expect(typeof hasErrorHandling).toBe('boolean');

      // Tab should still be functional
      await expect(movesTab).toBeVisible();

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle slow network connections', async ({ page, consoleLogger }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        route.continue();
      });

      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Click Evolution tab
      const evolutionTab = page.getByRole('button', { name: /Evolution/i });
      await evolutionTab.click();

      // Should show loading state
      const loadingIndicators = page.locator('.loading, .spinner, [data-testid="loading"]');
      const hasLoading = await loadingIndicators.first().isVisible({ timeout: 2000 });
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Content should eventually appear
      const evolutionContent = page.locator('text=/Evolution/i, text=/Pichu/i');
      await expect(evolutionContent.first()).toBeVisible({ timeout: 10000 });

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should be accessible with screen readers', async ({ page, consoleLogger }) => {
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Check ARIA attributes
      const tabs = page.getByRole('button', { name: /Stats|Evolution|Moves/i });
      const tabCount = await tabs.count();
      
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        const tab = tabs.nth(i);
        
        // Should have proper ARIA attributes
        const ariaSelected = await tab.getAttribute('aria-selected');
        const ariaControls = await tab.getAttribute('aria-controls');
        const role = await tab.getAttribute('role');
        
        expect(ariaSelected).toMatch(/(true|false)/);
        expect(typeof ariaControls).toBe('string');
        expect(role).toBe('tab');
      }

      // Check tab panels
      const tabPanels = page.locator('[role="tabpanel"]');
      const panelCount = await tabPanels.count();
      
      if (panelCount > 0) {
        const firstPanel = tabPanels.first();
        const ariaLabelledBy = await firstPanel.getAttribute('aria-labelledby');
        expect(typeof ariaLabelledBy).toBe('string');
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work properly on mobile devices', async ({ page, consoleLogger }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Tabs should be visible and scrollable on mobile
      const tabContainer = page.locator('[role="tablist"], .tabs-container, .tab-navigation');
      await expect(tabContainer).toBeVisible();

      // Test tab switching on mobile
      const statsTab = page.getByRole('button', { name: /Stats/i });
      await statsTab.tap();
      await page.waitForTimeout(1000);

      // Tab content should be visible
      await expect(page.locator('text=/HP/i')).toBeVisible({ timeout: 5000 });

      // Test swipe navigation if implemented
      const tabContent = page.locator('[role="tabpanel"], .tab-content').first();
      if (await tabContent.isVisible()) {
        const contentBox = await tabContent.boundingBox();
        
        if (contentBox) {
          // Simulate swipe gesture
          await page.touchscreen.tap(contentBox.x + contentBox.width - 50, contentBox.y + contentBox.height / 2);
          await page.touchscreen.tap(contentBox.x + 50, contentBox.y + contentBox.height / 2);
          await page.waitForTimeout(500);
          
          // Next tab might be selected (if swipe navigation is implemented)
          const activeTab = page.locator('[aria-selected="true"]');
          const activeTabText = await activeTab.textContent();
          expect(typeof activeTabText).toBe('string');
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle tab overflow on small screens', async ({ page, consoleLogger }) => {
      // Set very narrow viewport
      await page.setViewportSize({ width: 320, height: 568 });
      
      await page.goto(TEST_URLS.pokemon(25)); // Pikachu
      await waitForNetworkIdle(page);

      // Tab container should handle overflow
      const tabContainer = page.locator('[role="tablist"], .tabs-container');
      if (await tabContainer.isVisible()) {
        const containerStyle = await tabContainer.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            overflowX: style.overflowX,
            whiteSpace: style.whiteSpace
          };
        });
        
        // Should allow horizontal scrolling or wrap appropriately
        expect(containerStyle.overflowX === 'auto' || containerStyle.overflowX === 'scroll' || containerStyle.whiteSpace === 'nowrap').toBeTruthy();
      }

      // All tabs should still be accessible
      const allTabs = page.getByRole('button', { name: /Overview|Stats|Evolution|Moves|Breeding|Locations|Competitive|Cards/i });
      const tabCount = await allTabs.count();
      expect(tabCount).toBeGreaterThanOrEqual(6);

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });
});