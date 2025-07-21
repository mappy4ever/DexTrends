import { test, expect } from '../fixtures/test-base';
import { waitForNetworkIdle, waitForImages } from '../helpers/test-utils';

test.describe('Card Detail Page', () => {
  test('should load individual card page', async ({ page, consoleLogger }) => {
    // Navigate to a specific card (example card ID)
    await page.goto('/cards/base1-4'); // Charizard from Base Set
    await waitForNetworkIdle(page);

    // Check page loads
    await expect(page).toHaveTitle(/Charizard|Card|DexTrends/);
    
    // Card name should be visible
    await expect(page.locator('h1').or(page.locator('[data-testid="card-name"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display card image in high quality', async ({ page }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Card image should be visible
    const cardImage = page.locator('[data-testid="card-image"]').or(page.locator('.card-detail-image')).or(page.locator('img[alt*="card"]')).first();
    await expect(cardImage).toBeVisible();
    
    // Wait for image to load
    await waitForImages(page);
    
    // Check image dimensions (should be high quality)
    const dimensions = await cardImage.evaluate(img => {
      const imgElement = img as HTMLImageElement;
      return {
        width: imgElement.naturalWidth,
        height: imgElement.naturalHeight
      };
    });
    
    // Card images should be reasonably sized
    expect(dimensions.width).toBeGreaterThan(200);
    expect(dimensions.height).toBeGreaterThan(280);
  });

  test('should display card details and stats', async ({ page }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Check for card details
    const details = [
      { selector: '[data-testid="card-hp"], text=/HP/i', label: 'HP' },
      { selector: '[data-testid="card-type"], .card-type', label: 'Type' },
      { selector: '[data-testid="card-rarity"], text=/rare|common|uncommon/i', label: 'Rarity' },
      { selector: '[data-testid="card-number"], text=/#\d+/', label: 'Card Number' }
    ];

    for (const detail of details) {
      const element = page.locator(detail.selector).first();
      if (await element.isVisible()) {
        const text = await element.textContent();
        expect(text).toBeTruthy();
      }
    }
  });

  test('should display card attacks and abilities', async ({ page }) => {
    await page.goto('/cards/base1-4'); // Charizard has attacks
    await waitForNetworkIdle(page);

    // Look for attacks section
    const attacksSection = page.locator('[data-testid="card-attacks"]').or(page.locator('.attacks-section'));
    if (await attacksSection.isVisible()) {
      // Should list attacks
      const attacks = await page.locator('[data-testid="attack-name"]').or(page.locator('.attack-name')).count();
      expect(attacks).toBeGreaterThan(0);
      
      // Attack should have damage
      const damage = page.locator('[data-testid="attack-damage"]').or(page.locator('text=/\d+/'));
      if (await damage.count() > 0) {
        const damageText = await damage.first().textContent();
        expect(damageText).toMatch(/\d+/);
      }
    }
  });

  test('should display market prices', async ({ page, consoleLogger }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Look for price information
    const priceSection = page.locator('[data-testid="price-section"]').or(page.locator('.market-prices'));
    if (await priceSection.isVisible()) {
      // Should show different condition prices
      const conditions = ['Near Mint', 'Lightly Played', 'Moderately Played'];
      
      for (const condition of conditions) {
        const priceElement = page.locator(`text=/${condition}/i`).first();
        if (await priceElement.isVisible()) {
          // Should have associated price
          const priceValue = await priceElement.locator('xpath=..').locator('text=/$\\d+/').textContent();
          expect(priceValue).toMatch(/\$?\d+/);
        }
      }
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should show price history chart', async ({ page }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Look for price chart
    const priceChart = page.locator('[data-testid="price-chart"]').or(page.locator('canvas')).or(page.locator('.chart-container'));
    if (await priceChart.isVisible()) {
      // Chart should be rendered
      await expect(priceChart).toBeVisible();
      
      // Check for chart controls
      const timeRangeButtons = page.locator('button:has-text("1M")').or(page.locator('button:has-text("3M")')).or(page.locator('button:has-text("1Y")'));
      if (await timeRangeButtons.count() > 0) {
        // Click different time ranges
        await timeRangeButtons.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display set information', async ({ page }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Should show which set the card belongs to
    const setInfo = page.locator('[data-testid="card-set"]').or(page.locator('.set-info')).or(page.locator('text=/base set/i'));
    await expect(setInfo).toBeVisible();
    
    // Set link should be clickable
    const setLink = page.locator('a[href*="/tcgsets/"]').first();
    if (await setLink.isVisible()) {
      const href = await setLink.getAttribute('href');
      expect(href).toContain('/tcgsets/');
    }
  });

  test('should handle card variants', async ({ page }) => {
    // Some cards have variants (normal, reverse holo, etc.)
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    const variantSelector = page.locator('[data-testid="variant-selector"]').or(page.locator('.variant-options'));
    if (await variantSelector.isVisible()) {
      // Should show different variants
      const variants = await page.locator('[data-testid="variant-option"]').count();
      expect(variants).toBeGreaterThan(0);
      
      // Clicking variant should update price/image
      const firstVariant = page.locator('[data-testid="variant-option"]').first();
      await firstVariant.click();
      await page.waitForTimeout(500);
    }
  });

  test('should allow adding card to collection', async ({ page, consoleLogger }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Find collection button
    const collectionButton = page.locator('button:has-text("Add to Collection")').or(page.locator('[data-testid="add-to-collection"]')).first();
    
    if (await collectionButton.isVisible()) {
      await collectionButton.click();
      
      // Should show success or open modal
      const modal = page.locator('[role="dialog"]').or(page.locator('.collection-modal'));
      const successMessage = page.locator('[data-testid="success-message"]').or(page.locator('.toast-success'));
      
      const hasResponse = await modal.isVisible() || await successMessage.isVisible();
      expect(hasResponse).toBeTruthy();
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display similar cards', async ({ page }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Look for similar cards section
    const similarSection = page.locator('[data-testid="similar-cards"]').or(page.locator('.related-cards'));
    if (await similarSection.isVisible()) {
      // Should show other Charizard cards or similar Pokemon
      const similarCards = await page.locator('[data-testid="similar-card-item"]').count();
      expect(similarCards).toBeGreaterThan(0);
    }
  });

  test('should handle card navigation', async ({ page }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Look for next/previous card buttons
    const nextButton = page.locator('button:has-text("Next")').or(page.locator('[data-testid="next-card"]')).first();
    
    if (await nextButton.isVisible()) {
      const currentUrl = page.url();
      await nextButton.click();
      await waitForNetworkIdle(page);
      
      // Should navigate to different card
      expect(page.url()).not.toBe(currentUrl);
      expect(page.url()).toContain('/cards/');
    }
  });

  test('should work on mobile viewport', async ({ page, consoleLogger }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Card image should scale appropriately
    const cardImage = page.locator('[data-testid="card-image"]').first();
    await expect(cardImage).toBeVisible();
    
    const imageSize = await cardImage.boundingBox();
    expect(imageSize?.width).toBeLessThan(350); // Should fit mobile width
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should handle invalid card IDs', async ({ page }) => {
    await page.goto('/cards/invalid-card-id-xyz');
    await waitForNetworkIdle(page);

    // Should show error or redirect
    const errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('.error')).or(page.locator('text=/not found/i'));
    const redirected = !page.url().includes('invalid-card-id-xyz');
    
    expect(await errorMessage.isVisible() || redirected).toBeTruthy();
  });

  test('should share card functionality', async ({ page }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Look for share button
    const shareButton = page.locator('button:has-text("Share")').or(page.locator('[data-testid="share-card"]')).first();
    
    if (await shareButton.isVisible()) {
      await shareButton.click();
      
      // Should show share options
      const shareModal = page.locator('[data-testid="share-modal"]').or(page.locator('.share-options'));
      const copyButton = page.locator('button:has-text("Copy Link")');
      
      expect(await shareModal.isVisible() || await copyButton.isVisible()).toBeTruthy();
    }
  });

  test('should display card legality information', async ({ page }) => {
    await page.goto('/cards/base1-4');
    await waitForNetworkIdle(page);

    // Look for legality section
    const legalitySection = page.locator('[data-testid="card-legality"]').or(page.locator('.legality-info'));
    if (await legalitySection.isVisible()) {
      // Should show format legality
      const formats = ['Standard', 'Expanded', 'Unlimited'];
      
      for (const format of formats) {
        const formatElement = page.locator(`text=/${format}/i`);
        if (await formatElement.count() > 0) {
          // Should show legal/not legal status
          const status = await formatElement.locator('xpath=..').textContent();
          expect(status).toMatch(/legal|not legal|banned/i);
        }
      }
    }
  });
});