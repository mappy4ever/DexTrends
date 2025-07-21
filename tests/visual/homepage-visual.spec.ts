import { visualTest as test, STANDARD_VIEWPORTS, COMMON_MASKS } from '../helpers/visual-regression';
import { waitForNetworkIdle } from '../helpers/test-utils';

test.describe('Homepage Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForNetworkIdle(page);
  });

  test('homepage hero section', async ({ page, visualRegression }) => {
    // Mask dynamic content
    await visualRegression.compareSnapshot('homepage-hero', {
      fullPage: false,
      mask: [
        COMMON_MASKS.dynamicCounts,
        { selector: '.popular-cards' }, // May have dynamic content
      ],
    });
  });

  test('homepage full page', async ({ page, visualRegression }) => {
    await visualRegression.compareSnapshot('homepage-full', {
      fullPage: true,
      mask: [
        COMMON_MASKS.timestamps,
        COMMON_MASKS.dynamicCounts,
        { selector: '[data-testid="popular-cards"]' },
      ],
    });
  });

  test('homepage responsive layouts', async ({ page, visualRegression }) => {
    await visualRegression.compareResponsiveSnapshot(
      'homepage-responsive',
      [STANDARD_VIEWPORTS.mobile, STANDARD_VIEWPORTS.tablet, STANDARD_VIEWPORTS.desktop],
      {
        fullPage: false,
        mask: [COMMON_MASKS.dynamicCounts],
      }
    );
  });

  test('navigation menu states', async ({ page, visualRegression }) => {
    // Capture default state
    await visualRegression.compareElementSnapshot('nav', 'navigation-default');

    // Hover state
    const navLink = page.locator('nav a').first();
    await navLink.hover();
    await page.waitForTimeout(300);
    await visualRegression.compareElementSnapshot('nav', 'navigation-hover');

    // Mobile menu
    await page.setViewportSize(STANDARD_VIEWPORTS.mobile);
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]').or(page.locator('.hamburger-menu'));
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(300);
      await visualRegression.compareSnapshot('navigation-mobile-open');
    }
  });

  test('theme variations', async ({ page, visualRegression }) => {
    // Light theme (default)
    await visualRegression.compareSnapshot('homepage-light-theme');

    // Dark theme
    const themeToggle = page.locator('[data-testid="theme-toggle"]').or(page.locator('button[aria-label*="theme"]'));
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition
      await visualRegression.compareSnapshot('homepage-dark-theme');
    }
  });

  test('loading states', async ({ page, visualRegression }) => {
    // Navigate to a page that shows loading states
    await page.goto('/pokedex');
    
    // Capture loading state quickly
    await visualRegression.compareSnapshot('loading-state', {
      fullPage: false,
      animations: 'allow', // Keep loading animations
    });
  });

  test('error states', async ({ page, visualRegression }) => {
    // Force an error by going offline
    await page.context().setOffline(true);
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Capture error state if visible
    const errorElement = page.locator('[data-testid="error-message"]').or(page.locator('.error-state'));
    if (await errorElement.isVisible()) {
      await visualRegression.compareElementSnapshot(
        '[data-testid="error-message"]',
        'error-state'
      );
    }

    await page.context().setOffline(false);
  });
});