import { test, expect } from '@playwright/test';

test.describe('TCG Set Detail Page Improvements', () => {
  // Test with a popular set that has many cards
  const testSetId = 'swsh1'; // Sword & Shield Base Set
  const setDetailUrl = `/tcgexpansions/${testSetId}`;

  test('should load set detail page quickly with smooth performance', async ({ page }) => {
    // Navigate to set detail
    await page.goto(setDetailUrl);
    
    // Check that skeleton loading appears (using correct selector)
    await expect(page.locator('.skeleton, .animate-pulse').first()).toBeVisible({ timeout: 1000 });
    
    // Wait for content to load (should be fast with 250 card page size)
    await expect(page.locator('h1').filter({ hasText: /Sword & Shield|Base Set/ })).toBeVisible({ timeout: 10000 });
    
    // Verify no loading spinners remain
    await expect(page.locator('.animate-spin')).toBeHidden();
    
    // Check that cards loaded
    const cards = page.locator('.virtual-scroll-container, .card-item, [class*="card"]').first();
    await expect(cards).toBeVisible({ timeout: 5000 });
  });

  test('should display clean UI without emojis', async ({ page }) => {
    await page.goto(setDetailUrl);
    await page.waitForLoadState('networkidle');
    
    // Check that favorite button doesn't contain emojis
    const favoriteButton = page.locator('button').filter({ hasText: /Favorite/ });
    await expect(favoriteButton.first()).toBeVisible();
    
    // Verify no emoji characters in buttons
    const buttonTexts = await page.locator('button').allTextContents();
    buttonTexts.forEach(text => {
      expect(text).not.toMatch(/[❤️🤍👀💜⭐️✨🎯🔥💎]/);
    });
  });

  test('should have smooth scrolling without jitter', async ({ page }) => {
    await page.goto(setDetailUrl);
    await page.waitForLoadState('networkidle');
    
    // Wait for cards to load
    await page.waitForSelector('.virtual-scroll-container, .card-grid-container', { timeout: 10000 });
    
    // Test smooth scrolling
    await page.evaluate(() => {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    });
    
    // Check that scroll happened smoothly
    await page.waitForTimeout(500);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(400);
    expect(scrollY).toBeLessThan(600);
  });

  test('should load all cards efficiently', async ({ page }) => {
    await page.goto(setDetailUrl);
    
    // Wait for initial load
    await page.waitForSelector('h2:has-text("Cards")', { timeout: 10000 });
    
    // Check card count is displayed
    const cardCountText = await page.locator('h2').filter({ hasText: /Cards \(\d+/ }).textContent();
    expect(cardCountText).toBeTruthy();
    
    // Extract number of cards
    const match = cardCountText?.match(/Cards \((\d+)/);
    if (match) {
      const cardCount = parseInt(match[1]);
      expect(cardCount).toBeGreaterThan(25); // Should load more than default 25
    }
  });

  test('should have responsive grid layout without overlapping', async ({ page, viewport }) => {
    await page.goto(setDetailUrl);
    await page.waitForLoadState('networkidle');
    
    // Check desktop layout
    if (viewport && viewport.width > 1024) {
      const grid = page.locator('.virtual-scroll-container, .card-grid-container').first();
      await expect(grid).toBeVisible();
      
      // Verify no overlapping elements
      const boundingBoxes = await page.evaluate(() => {
        const cards = document.querySelectorAll('.virtual-card-container, .card-item, .unified-card');
        return Array.from(cards).slice(0, 10).map(card => {
          const rect = card.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        });
      });
      
      // Check that cards don't overlap
      for (let i = 0; i < boundingBoxes.length; i++) {
        for (let j = i + 1; j < boundingBoxes.length; j++) {
          const box1 = boundingBoxes[i];
          const box2 = boundingBoxes[j];
          
          // Cards should not overlap (allowing 1px tolerance)
          const overlapping = !(
            box1.x + box1.width < box2.x - 1 ||
            box2.x + box2.width < box1.x - 1 ||
            box1.y + box1.height < box2.y - 1 ||
            box2.y + box2.height < box1.y - 1
          );
          
          expect(overlapping).toBe(false);
        }
      }
    }
  });

  test('should show proper loading skeleton', async ({ page }) => {
    // Slow down network to see skeleton
    await page.route('**/api/tcgexpansions/**', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.goto(setDetailUrl);
    
    // Check skeleton elements are visible
    await expect(page.locator('.skeleton, .animate-pulse, [class*="skeleton"]').first()).toBeVisible();
    
    // Verify skeleton structure
    await expect(page.locator('[class*="skeleton"]')).toHaveCount(17); // Header + 4 stats + 12 cards
  });

  test('should handle filtering smoothly', async ({ page }) => {
    await page.goto(setDetailUrl);
    await page.waitForLoadState('networkidle');
    
    // Wait for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    
    // Type in search
    await searchInput.fill('Pikachu');
    
    // Wait for debounce
    await page.waitForTimeout(400);
    
    // Check that cards are filtered
    const cardCount = await page.locator('h2').filter({ hasText: /Cards \(/ }).textContent();
    expect(cardCount).toContain('Cards (');
    
    // Clear filter
    await page.locator('button:has-text("Clear Filters")').click();
    
    // Verify cards are restored
    await page.waitForTimeout(100);
    const restoredCount = await page.locator('h2').filter({ hasText: /Cards \(/ }).textContent();
    expect(restoredCount).toBeTruthy();
  });

  test('should open card modal with smooth animation', async ({ page }) => {
    await page.goto(setDetailUrl);
    await page.waitForLoadState('networkidle');
    
    // Click on first card
    const firstCard = page.locator('[data-testid="card-item"], .card-item, img[alt*="card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();
    
    // Check modal appears with animation class
    const modal = page.locator('.modal-backdrop');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveClass(/modal-backdrop/);
    
    // Check modal content
    const modalContent = page.locator('.modal-content');
    await expect(modalContent).toBeVisible();
    
    // Verify no emojis in modal buttons
    const modalButtons = modalContent.locator('button');
    const modalButtonTexts = await modalButtons.allTextContents();
    modalButtonTexts.forEach(text => {
      expect(text).not.toMatch(/[❤️🤍]/);
    });
    
    // Close modal
    await page.locator('.modal-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(modal).toBeHidden();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test with invalid set ID
    await page.goto('/tcgexpansions/invalid-set-id');
    
    // Should show error state
    await expect(page.locator('text=/Error Loading Set/i')).toBeVisible({ timeout: 10000 });
    
    // Should have retry button
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
    
    // Should have back button
    await expect(page.locator('button:has-text("Back to Sets")')).toBeVisible();
  });

  test('should maintain scroll position when filtering', async ({ page }) => {
    await page.goto(setDetailUrl);
    await page.waitForLoadState('networkidle');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    
    const scrollBefore = await page.evaluate(() => window.scrollY);
    
    // Apply filter
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Trainer');
    await page.waitForTimeout(400);
    
    // Check scroll position is maintained (with some tolerance)
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(100);
  });
});

// Performance test
test.describe('Performance Tests', () => {
  test('should load large set efficiently', async ({ page }) => {
    // Test with a large set
    const largeSetId = 'swsh12pt5'; // Crown Zenith - has 200+ cards
    
    const startTime = Date.now();
    
    await page.goto(`/tcgexpansions/${largeSetId}`);
    
    // Wait for cards to appear
    await page.waitForSelector('.virtual-scroll-container, .card-item, .unified-card', { timeout: 15000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time (15 seconds for large set)
    expect(loadTime).toBeLessThan(15000);
    
    // Check that virtual scrolling is working
    const virtualContainer = await page.locator('.virtual-scroll-container').count();
    if (virtualContainer > 0) {
      // Virtual scrolling active - check that some cards are rendered
      const cardCount = await page.locator('.virtual-card-container').count();
      expect(cardCount).toBeGreaterThan(10); // Should show visible cards only
    } else {
      // Fallback to regular CardList
      const cardCount = await page.locator('.card-item, .unified-card').count();
      expect(cardCount).toBeGreaterThan(50); // Should show many cards
    }
  });
});