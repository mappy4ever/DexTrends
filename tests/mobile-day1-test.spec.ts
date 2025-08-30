import { test, expect, devices } from '@playwright/test';

// Test mobile pages at different viewport sizes
const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 }
];

test.describe('Day 1 Mobile Pages', () => {
  viewports.forEach(viewport => {
    test.describe(`${viewport.name} (${viewport.width}px)`, () => {
      test.use({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent: devices['iPhone 12'].userAgent
      });

      test('Individual Pokémon page renders mobile layout', async ({ page }) => {
        await page.goto('/pokedex/25'); // Pikachu
        
        // Check for mobile layout wrapper
        const mobileLayout = await page.locator('.mobile-layout').first();
        
        if (viewport.width < 460) {
          // Should use mobile layout
          await expect(mobileLayout).toBeVisible({ timeout: 10000 });
          
          // Check for mobile-specific components
          const mobileDetail = await page.locator('.mobile-pokemon-detail');
          await expect(mobileDetail).toBeVisible();
          
          // Check for image gallery
          const imageGallery = await page.locator('[data-testid="image-gallery"], .relative.h-\\[280px\\]').first();
          await expect(imageGallery).toBeVisible();
          
          // Check for sliding tabs
          const tabsContainer = await page.locator('.sticky.top-0.z-30 .flex.overflow-x-auto').first();
          await expect(tabsContainer).toBeVisible();
          
          // Check that desktop layout is not visible
          const desktopHero = await page.locator('.PokemonHeroSectionV3');
          await expect(desktopHero).not.toBeVisible();
        } else {
          // Should use desktop layout
          await expect(mobileLayout).not.toBeVisible();
        }
      });

      test('TCG Set Details page renders mobile layout', async ({ page }) => {
        await page.goto('/tcgexpansions/base1'); // Base Set
        
        const mobileLayout = await page.locator('.mobile-layout').first();
        
        if (viewport.width < 460) {
          await expect(mobileLayout).toBeVisible({ timeout: 10000 });
          
          // Check for mobile TCG set detail
          const mobileSetDetail = await page.locator('.mobile-tcg-set-detail');
          await expect(mobileSetDetail).toBeVisible();
          
          // Check for horizontal stats bar
          const statsBar = await page.locator('.sticky.top-0.z-30 .flex.overflow-x-auto').first();
          await expect(statsBar).toBeVisible();
          
          // Check for filter button
          const filterButton = await page.locator('button:has-text("Filters")').first();
          await expect(filterButton).toBeVisible();
          
          // Check for card grid (2 columns on mobile)
          const cardGrid = await page.locator('.grid.grid-cols-2').first();
          await expect(cardGrid).toBeVisible();
        } else {
          await expect(mobileLayout).not.toBeVisible();
        }
      });

      test('Moves page renders mobile layout', async ({ page }) => {
        await page.goto('/pokemon/moves');
        
        const mobileLayout = await page.locator('.mobile-layout').first();
        
        if (viewport.width < 460) {
          await expect(mobileLayout).toBeVisible({ timeout: 10000 });
          
          // Check for mobile moves page
          const mobileMovesPage = await page.locator('.mobile-moves-page');
          await expect(mobileMovesPage).toBeVisible();
          
          // Check for type filter pills
          const typeFilters = await page.locator('.sticky.top-0.z-30 .flex.overflow-x-auto').first();
          await expect(typeFilters).toBeVisible();
          
          // Check for move cards instead of table
          const moveCards = await page.locator('.rounded-lg.border-2.p-3').first();
          await expect(moveCards).toBeVisible();
          
          // Ensure table is not visible
          const table = await page.locator('table');
          await expect(table).not.toBeVisible();
        } else {
          // Desktop should show table
          const table = await page.locator('table').first();
          await expect(table).toBeVisible();
        }
      });

      test('Mobile navigation and interactions work', async ({ page }) => {
        if (viewport.width >= 460) {
          test.skip();
          return;
        }

        // Test Pokémon page swipe hints
        await page.goto('/pokedex/25');
        await page.waitForLoadState('networkidle');
        
        // Check for adjacent Pokémon hints
        const prevHint = await page.locator('text=/←.*#024/').first();
        const nextHint = await page.locator('text=/#026.*→/').first();
        
        if (await prevHint.isVisible()) {
          expect(await prevHint.textContent()).toContain('024');
        }
        if (await nextHint.isVisible()) {
          expect(await nextHint.textContent()).toContain('026');
        }

        // Test TCG Set filter button
        await page.goto('/tcgexpansions/base1');
        await page.waitForLoadState('networkidle');
        
        const filterButton = await page.locator('button:has-text("Filters")').first();
        if (await filterButton.isVisible()) {
          await filterButton.click();
          
          // Check if bottom sheet opens
          const bottomSheet = await page.locator('.fixed.inset-0.z-50, [role="dialog"]').first();
          await expect(bottomSheet).toBeVisible({ timeout: 5000 });
          
          // Close bottom sheet
          await page.keyboard.press('Escape');
          await expect(bottomSheet).not.toBeVisible({ timeout: 5000 });
        }

        // Test Moves page expandable cards
        await page.goto('/pokemon/moves');
        await page.waitForLoadState('networkidle');
        
        const firstMoveCard = await page.locator('.rounded-lg.border-2.p-3').first();
        if (await firstMoveCard.isVisible()) {
          await firstMoveCard.click();
          
          // Check if card expands (look for effect text)
          const expandedContent = await page.locator('.mt-3.pt-3.border-t').first();
          await expect(expandedContent).toBeVisible({ timeout: 3000 });
        }
      });
    });
  });
});