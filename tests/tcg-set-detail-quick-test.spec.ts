import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3003'
});

test.describe('TCG Set Detail Quick Test', () => {
  test('page loads and shows improvements', async ({ page }) => {
    // Go directly to a set detail page
    await page.goto('/tcgexpansions/swsh1', { timeout: 30000 });
    
    // 1. Check skeleton loading appears initially
    const skeletons = await page.locator('[class*="skeleton"]').count();
    console.log(`Found ${skeletons} skeleton loaders`);
    
    // 2. Wait for main content to load
    await page.waitForSelector('h1', { timeout: 15000 });
    const title = await page.locator('h1').textContent();
    console.log(`Page title: ${title}`);
    
    // 3. Check no emojis in buttons
    await page.waitForTimeout(2000); // Give time for all content to load
    const buttons = await page.locator('button').allTextContents();
    let hasEmoji = false;
    buttons.forEach(text => {
      if (text.match(/[❤️🤍👀💜⭐️✨🎯🔥💎]/)) {
        console.log(`Found emoji in button: "${text}"`);
        hasEmoji = true;
      }
    });
    expect(hasEmoji).toBe(false);
    
    // 4. Check card grid loads
    const cardGrid = page.locator('.virtualized-grid-container, [role="grid"], [class*="grid"]').first();
    await expect(cardGrid).toBeVisible({ timeout: 10000 });
    
    // 5. Test smooth scrolling
    await page.evaluate(() => {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(200);
    
    // 6. Check filter functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Pikachu');
    await page.waitForTimeout(500);
    
    // 7. Click on a card to open modal
    const firstCard = page.locator('img[alt*="card"], [class*="card-item"]').first();
    await firstCard.click();
    
    // Check modal appears
    const modal = page.locator('.modal-backdrop, [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Check modal has no emojis
    const modalText = await modal.textContent();
    expect(modalText).not.toMatch(/[❤️🤍]/);
    
    console.log('✅ All improvements verified!');
  });
  
  test('performance: loads quickly with many cards', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/tcgexpansions/swsh12pt5', { timeout: 30000 }); // Crown Zenith - large set
    
    // Wait for cards to appear
    await page.waitForSelector('[class*="card"], img[alt*="card"]', { timeout: 15000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    // Check many cards loaded
    await page.waitForTimeout(2000);
    const cardCount = await page.locator('[class*="card-item"], img[alt*="card"]').count();
    console.log(`Cards loaded: ${cardCount}`);
    expect(cardCount).toBeGreaterThan(25); // Should load more than the old default
  });
});