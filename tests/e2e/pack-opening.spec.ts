import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle, waitForAnimations } from '../helpers/test-utils';
import { MobileGestures } from '../helpers/page-helpers';

test.describe('Pack Opening Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pocketmode/packs');
    await waitForNetworkIdle(page);
  });

  test('should load pack opening page', async ({ page, consoleLogger }) => {
    // Check page title
    await expect(page).toHaveTitle(/Pack Opening|Packs|DexTrends/);
    
    // Check main heading
    await expect(page.locator('h1:has-text("Pack")').or(page.locator('h1:has-text("Opening")')).or(page.locator('[data-testid="pack-opening-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display available packs', async ({ page }) => {
    // Should show pack selection
    const packs = page.locator('[data-testid="pack-item"]').or(page.locator('.pack-option')).or(page.locator('.booster-pack'));
    const packCount = await packs.count();
    expect(packCount).toBeGreaterThan(0);
    
    // Packs should have images
    if (packCount > 0) {
      const packImage = packs.first().locator('img');
      await expect(packImage).toBeVisible();
    }
  });

  test('should select and open a pack', async ({ page, consoleLogger }) => {
    // Select a pack
    const pack = page.locator('[data-testid="pack-item"]').or(page.locator('.pack-option')).first();
    await pack.click();
    
    // Look for open button
    const openButton = page.locator('button:has-text("Open")').or(page.locator('button:has-text("Start")')).or(page.locator('[data-testid="open-pack"]')).first();
    
    if (await openButton.isVisible()) {
      await openButton.click();
      
      // Wait for opening animation
      await page.waitForTimeout(1000);
      await waitForAnimations(page);
      
      // Should show cards being revealed
      const revealedCards = page.locator('[data-testid="revealed-card"]').or(page.locator('.card-reveal'));
      await expect(revealedCards.first()).toBeVisible({ timeout: 10000 });
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should reveal cards with animation', async ({ page }) => {
    // Open a pack
    const pack = page.locator('[data-testid="pack-item"]').first();
    await pack.click();
    
    const openButton = page.locator('[data-testid="open-pack"]').first();
    if (await openButton.isVisible()) {
      await openButton.click();
      
      // Cards should appear one by one or with animation
      const cards = page.locator('[data-testid="revealed-card"]').or(page.locator('.pack-card'));
      
      // Wait for first card
      await expect(cards.first()).toBeVisible({ timeout: 10000 });
      
      // Should reveal multiple cards (usually 5-11)
      await page.waitForTimeout(3000); // Allow time for all cards
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(5);
    }
  });

  test('should display card rarities', async ({ page }) => {
    // Open a pack
    const pack = page.locator('[data-testid="pack-item"]').first();
    await pack.click();
    
    const openButton = page.locator('[data-testid="open-pack"]').first();
    if (await openButton.isVisible()) {
      await openButton.click();
      await page.waitForTimeout(3000);
      
      // Look for rarity indicators
      const rarityIndicators = page.locator('[data-testid="card-rarity"]').or(page.locator('.rarity-indicator')).or(page.locator('.card-rarity'));
      
      if (await rarityIndicators.count() > 0) {
        // Should show different rarities
        const rarities = await rarityIndicators.allTextContents();
        const hasRarities = rarities.some(r => 
          /common|uncommon|rare|holo|ultra/i.test(r)
        );
        expect(hasRarities).toBeTruthy();
      }
    }
  });

  test('should save opened cards to collection', async ({ page, consoleLogger }) => {
    // Open a pack
    const pack = page.locator('[data-testid="pack-item"]').first();
    await pack.click();
    
    const openButton = page.locator('[data-testid="open-pack"]').first();
    if (await openButton.isVisible()) {
      await openButton.click();
      await page.waitForTimeout(3000);
      
      // Look for save/collect button
      const collectButton = page.locator('button:has-text("Collect")').or(page.locator('button:has-text("Add to Collection")')).or(page.locator('[data-testid="collect-cards"]')).first();
      
      if (await collectButton.isVisible()) {
        await collectButton.click();
        await page.waitForTimeout(1000);
        
        // Should show success message
        const successMessage = page.locator('[data-testid="collect-success"]').or(page.locator('.success-message'));
        await expect(successMessage).toBeVisible();
      }
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should handle pack opening on mobile with gestures', async ({ page }) => {
    const gestures = new MobileGestures(page);
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Select pack
    const pack = page.locator('[data-testid="pack-item"]').first();
    await pack.click();
    
    // Look for swipe instruction
    const swipeHint = page.locator('text=/swipe|tap|gesture/i').or(page.locator('[data-testid="gesture-hint"]'));
    
    if (await swipeHint.isVisible()) {
      // Perform swipe to open
      await gestures.swipe('up', 200);
      await page.waitForTimeout(2000);
      
      // Cards should be revealed
      const cards = page.locator('[data-testid="revealed-card"]');
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should display pack odds/rates', async ({ page }) => {
    // Look for odds information
    const oddsButton = page.locator('button:has-text("Odds")').or(page.locator('button:has-text("Rates")')).or(page.locator('[data-testid="pack-odds"]')).first();
    
    if (await oddsButton.isVisible()) {
      await oddsButton.click();
      
      // Should show odds modal or section
      const oddsInfo = page.locator('[data-testid="odds-info"]').or(page.locator('.pack-rates'));
      await expect(oddsInfo).toBeVisible();
      
      // Should list rarity rates
      await expect(page.locator('text=/common.*\d+%/i')).toBeVisible();
      await expect(page.locator('text=/rare.*\d+%/i')).toBeVisible();
    }
  });

  test('should track pack opening history', async ({ page }) => {
    // Look for history section
    const historyButton = page.locator('button:has-text("History")').or(page.locator('[data-testid="pack-history"]')).first();
    
    if (await historyButton.isVisible()) {
      await historyButton.click();
      
      // Should show previous openings
      const historyItems = page.locator('[data-testid="history-item"]').or(page.locator('.pack-history-entry'));
      
      // May have previous history or be empty
      const hasHistory = await historyItems.count() > 0;
      const emptyHistory = await page.locator('text=/no history|no packs opened/i').isVisible();
      
      expect(hasHistory || emptyHistory).toBeTruthy();
    }
  });

  test('should handle multiple pack openings', async ({ page }) => {
    // Open first pack
    const pack = page.locator('[data-testid="pack-item"]').first();
    await pack.click();
    
    let openButton = page.locator('[data-testid="open-pack"]').first();
    if (await openButton.isVisible()) {
      await openButton.click();
      await page.waitForTimeout(3000);
      
      // Look for "Open Another" option
      const anotherButton = page.locator('button:has-text("Open Another")').or(page.locator('button:has-text("Next Pack")')).first();
      
      if (await anotherButton.isVisible()) {
        await anotherButton.click();
        
        // Should return to pack selection
        await expect(page.locator('[data-testid="pack-item"]').first()).toBeVisible();
      }
    }
  });

  test('should display special/rare card animations', async ({ page, consoleLogger }) => {
    // This might be random, so we'll check if the feature exists
    const pack = page.locator('[data-testid="pack-item"]').first();
    await pack.click();
    
    const openButton = page.locator('[data-testid="open-pack"]').first();
    if (await openButton.isVisible()) {
      await openButton.click();
      await page.waitForTimeout(3000);
      
      // Look for special effects on rare cards
      const specialEffects = page.locator('[data-testid="rare-animation"]').or(page.locator('.holographic')).or(page.locator('.special-effect'));
      
      if (await specialEffects.count() > 0) {
        // Rare cards should have special styling
        const hasEffect = await specialEffects.first().evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.animation !== 'none' || styles.filter !== 'none';
        });
        expect(hasEffect).toBeTruthy();
      }
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should handle pack purchasing/currency', async ({ page }) => {
    // Look for currency display
    const currency = page.locator('[data-testid="user-currency"]').or(page.locator('.pack-credits')).or(page.locator('text=/coins|credits|points/i'));
    
    if (await currency.isVisible()) {
      const currencyText = await currency.textContent();
      expect(currencyText).toMatch(/\d+/); // Should show a number
      
      // Pack should show cost
      const packCost = page.locator('[data-testid="pack-cost"]').or(page.locator('.pack-price')).first();
      if (await packCost.isVisible()) {
        const costText = await packCost.textContent();
        expect(costText).toMatch(/\d+/);
      }
    }
  });

  test('should filter packs by set/series', async ({ page }) => {
    // Look for filter options
    const setFilter = page.locator('select[name*="set"]').or(page.locator('[data-testid="set-filter"]')).first();
    
    if (await setFilter.isVisible()) {
      const initialPacks = await page.locator('[data-testid="pack-item"]').count();
      
      // Apply filter
      if (await setFilter.evaluate(el => el.tagName === 'SELECT')) {
        await setFilter.selectOption({ index: 1 });
      } else {
        await setFilter.click();
        await page.locator('[data-testid="set-option"]').nth(1).click();
      }
      
      await page.waitForTimeout(1000);
      
      // Pack count might change
      const filteredPacks = await page.locator('[data-testid="pack-item"]').count();
      expect(filteredPacks).toBeGreaterThan(0);
    }
  });

  test('should work offline after initial load', async ({ page }) => {
    // Load page first
    await page.waitForTimeout(2000);
    
    // Go offline
    await page.context().setOffline(true);
    
    // Try to open a pack
    const pack = page.locator('[data-testid="pack-item"]').first();
    if (await pack.isVisible()) {
      await pack.click();
      
      // Should either work offline or show appropriate message
      const openButton = page.locator('[data-testid="open-pack"]');
      const offlineMessage = page.locator('text=/offline|connection/i');
      
      expect(await openButton.isVisible() || await offlineMessage.isVisible()).toBeTruthy();
    }
    
    await page.context().setOffline(false);
  });
});