import { visualTest as test, COMMON_MASKS } from '../helpers/visual-regression';
import { waitForNetworkIdle } from '../helpers/test-utils';
import { MobileGestures } from '../helpers/page-helpers';

const MOBILE_VIEWPORT = { width: 375, height: 667 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };

test.describe('Mobile Visual Regression', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('mobile navigation menu', async ({ page, visualRegression }) => {
    await page.goto('/');
    await waitForNetworkIdle(page);

    // Capture mobile header
    await visualRegression.compareElementSnapshot('nav', 'mobile-navigation-closed');

    // Open mobile menu
    const menuButton = page.locator('[data-testid="mobile-menu"], .hamburger-menu').or(page.locator('button[aria-label*="menu"]')).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300); // Wait for animation

      await visualRegression.compareSnapshot('mobile-navigation-open', {
        fullPage: true,
      });
    }
  });

  test('mobile card layouts', async ({ page, visualRegression }) => {
    await page.goto('/tcgexpansions');
    await waitForNetworkIdle(page);

    await visualRegression.compareSnapshot('mobile-card-grid', {
      fullPage: false,
      mask: [
        COMMON_MASKS.loadingStates,
        { selector: '.card-image' },
      ],
    });
  });

  test('mobile touch interactions', async ({ page, visualRegression }) => {
    const gestures = new MobileGestures(page);
    
    await page.goto('/pokedex');
    await waitForNetworkIdle(page);

    // Capture initial state
    await visualRegression.compareSnapshot('mobile-before-swipe');

    // Simulate swipe
    await gestures.swipe('up', 200);
    await page.waitForTimeout(500);

    await visualRegression.compareSnapshot('mobile-after-swipe');
  });

  test('mobile modals and overlays', async ({ page, visualRegression }) => {
    await page.goto('/pocketmode');
    await waitForNetworkIdle(page);

    // Click on a card to open modal
    const card = page.locator('[data-testid="pocket-card"]').or(page.locator('.pocket-card')).first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
      if (await modal.isVisible()) {
        await visualRegression.compareSnapshot('mobile-modal-open', {
          fullPage: true,
        });
      }
    }
  });

  test('mobile form inputs', async ({ page, visualRegression }) => {
    await page.goto('/collections');
    await waitForNetworkIdle(page);

    // Find and focus on search input
    const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="search"]')).first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await page.waitForTimeout(300); // Wait for keyboard

      await visualRegression.compareSnapshot('mobile-input-focused', {
        fullPage: false,
      });
    }
  });

  test('tablet layouts', async ({ page, visualRegression }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
    
    // Test different pages on tablet
    const pages = [
      { url: '/', name: 'tablet-homepage' },
      { url: '/pokedex', name: 'tablet-pokedex' },
      { url: '/battle-simulator', name: 'tablet-battle' },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await waitForNetworkIdle(page);
      
      await visualRegression.compareSnapshot(pageInfo.name, {
        fullPage: false,
        mask: [COMMON_MASKS.dynamicCounts, COMMON_MASKS.loadingStates],
      });
    }
  });

  test('mobile bottom navigation', async ({ page, visualRegression }) => {
    await page.goto('/');
    await waitForNetworkIdle(page);

    // Check if bottom navigation exists
    const bottomNav = page.locator('[data-testid="bottom-nav"]').or(page.locator('.bottom-navigation'));
    if (await bottomNav.isVisible()) {
      await visualRegression.compareElementSnapshot(
        '[data-testid="bottom-nav"]',
        'mobile-bottom-navigation'
      );
    }
  });

  test('mobile loading states', async ({ page, visualRegression }) => {
    // Slow down network to capture loading states
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto('/pokedex');
    
    // Capture skeleton screens
    await visualRegression.compareSnapshot('mobile-loading-skeleton', {
      animations: 'allow',
    });
  });

  test('mobile error messages', async ({ page, visualRegression }) => {
    await page.context().setOffline(true);
    await page.goto('/');
    await page.waitForTimeout(2000);

    const errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('.error-banner'));
    if (await errorMessage.isVisible()) {
      await visualRegression.compareSnapshot('mobile-error-state', {
        fullPage: false,
      });
    }

    await page.context().setOffline(false);
  });

  test('mobile gesture indicators', async ({ page, visualRegression }) => {
    await page.goto('/pocketmode/packs');
    await waitForNetworkIdle(page);

    // Look for swipe indicators or gesture hints
    const gestureHint = page.locator('[data-testid="gesture-hint"]').or(page.locator('.swipe-indicator'));
    if (await gestureHint.isVisible()) {
      await visualRegression.compareElementSnapshot(
        '[data-testid="gesture-hint"]',
        'mobile-gesture-indicators'
      );
    }
  });
});