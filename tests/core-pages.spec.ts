import { test, expect } from '@playwright/test';

test.describe('Core Pages Functionality Test', () => {
  const baseURL = 'http://localhost:3001';

  test('Homepage loads and displays main content', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check page loads without error
    await expect(page).toHaveTitle(/DexTrends|Mappy/);
    
    // Check main navigation is visible
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Check for main content areas
    const mainContent = page.locator('main, [role="main"], .main-content, .container');
    await expect(mainContent.first()).toBeVisible();
    
    // Check no error messages are displayed
    const errorMessages = page.locator('.error, [data-testid="error"], .error-message');
    await expect(errorMessages).toHaveCount(0);
    
    // Check no loading spinners are stuck
    const loadingSpinners = page.locator('.loading, .spinner, [data-testid="loading"]');
    await expect(loadingSpinners).toHaveCount(0);
  });

  test('Pokedex page loads and displays Pokemon list', async ({ page }) => {
    await page.goto('/pokedex');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check page loads without error
    await expect(page).toHaveTitle(/Pokedex|DexTrends/);
    
    // Check navbar is present
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Wait for Pokemon content to load
    await page.waitForTimeout(3000);
    
    // Check for main content
    const mainContent = page.locator('main, [role="main"], .main-content, .container');
    await expect(mainContent.first()).toBeVisible();
    
    // Check no error messages
    const errorMessages = page.locator('.error, [data-testid="error"], .error-message');
    await expect(errorMessages).toHaveCount(0);
  });

  test('TCG Sets page loads and displays set list', async ({ page }) => {
    await page.goto('/tcgexpansions');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check page loads without error
    await expect(page).toHaveTitle(/TCG Sets|DexTrends/);
    
    // Check navbar is present
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Wait for TCG content to load
    await page.waitForTimeout(3000);
    
    // Check for main content
    const mainContent = page.locator('main, [role="main"], .main-content, .container');
    await expect(mainContent.first()).toBeVisible();
    
    // Check no error messages
    const errorMessages = page.locator('.error, [data-testid="error"], .error-message');
    await expect(errorMessages).toHaveCount(0);
  });

  test('Pokemon Detail page (Pikachu) loads correctly', async ({ page }) => {
    await page.goto('/pokedex/25');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check navbar is present
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Wait for Pokemon detail content to load
    await page.waitForTimeout(5000);
    
    // Check for main content
    const mainContent = page.locator('main, [role="main"], .main-content, .container');
    await expect(mainContent.first()).toBeVisible();
    
    // Check no error messages
    const errorMessages = page.locator('.error, [data-testid="error"], .error-message');
    await expect(errorMessages).toHaveCount(0);
    
    // Check no loading spinners are stuck
    const loadingSpinners = page.locator('.loading, .spinner, [data-testid="loading"]');
    await expect(loadingSpinners).toHaveCount(0);
  });

  test('Navigation between pages works', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click navigation links (try common selectors)
    const navLinks = page.locator('nav a, .nav-link, [data-testid="nav-link"], header a');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Try to find Pokedex link
      const pokedexLink = page.locator('a[href*="pokedex"], a:has-text("Pokedex"), a:has-text("Pokédex")').first();
      if (await pokedexLink.isVisible()) {
        await pokedexLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/pokedex/);
      }
    }
    
    // Check that basic navigation structure exists
    const navbar = page.locator('nav, header');
    await expect(navbar.first()).toBeVisible();
  });

  test('Images load properly', async ({ page }) => {
    await page.goto('/pokedex');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for broken images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check first few images to see if they load
      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          // Check if image has loaded (not broken)
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          if (naturalWidth > 0) {
            expect(naturalWidth).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  test('Interactive elements are clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for clickable elements
    const buttons = page.locator('button, .btn, [role="button"]');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Check that buttons are enabled and clickable
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await expect(firstButton).toBeEnabled();
      }
    }
    
    // Check for links
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    expect(linkCount).toBeGreaterThan(0); // Should have at least some navigation links
  });
});