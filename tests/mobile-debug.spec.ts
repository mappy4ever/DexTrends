import { test, expect } from '@playwright/test';

test.describe('Mobile Debug', () => {
  test.use({
    viewport: { width: 375, height: 667 }
  });

  test('Check what renders on mobile viewport', async ({ page }) => {
    // Navigate to Pokemon detail page
    await page.goto('http://localhost:3001/pokedex/25');
    
    // Wait for any content to load
    await page.waitForTimeout(2000);
    
    // Debug: Print the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Debug: Check for any visible text
    const bodyText = await page.locator('body').innerText();
    console.log('Body contains Pokemon name:', bodyText.includes('Pikachu'));
    
    // Debug: Check what major containers exist
    const hasMobileDetail = await page.locator('.mobile-pokemon-detail').count();
    const hasDesktopHero = await page.locator('.PokemonHeroSectionV3').count();
    const hasMobileLayout = await page.locator('.mobile-layout').count();
    
    console.log('Mobile detail count:', hasMobileDetail);
    console.log('Desktop hero count:', hasDesktopHero);
    console.log('Mobile layout count:', hasMobileLayout);
    
    // Debug: Get all class names on body
    const bodyClasses = await page.locator('body').getAttribute('class');
    console.log('Body classes:', bodyClasses);
    
    // Debug: Check viewport size
    const viewportSize = page.viewportSize();
    console.log('Viewport size:', viewportSize);
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'mobile-debug-screenshot.png' });
    
    // The test should find the mobile layout
    expect(hasMobileDetail).toBeGreaterThan(0);
  });
});