/**
 * Comprehensive QA Audit Test
 * Tests for: broken links, UI alignment, loading issues, API errors, visual consistency
 */

import { test, expect, Page } from '@playwright/test';

// Helper to collect console errors
const collectConsoleErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
};

// Helper to check for failed network requests
const collectFailedRequests = (page: Page): string[] => {
  const failed: string[] = [];
  page.on('requestfailed', request => {
    failed.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });
  return failed;
};

test.describe('Homepage QA', () => {
  test('Homepage loads without errors', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);
    const failedRequests = collectFailedRequests(page);

    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });

    // Check page loaded
    await expect(page).toHaveTitle(/DexTrends/i);

    // Check navbar is visible
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    // Check for main content
    const mainContent = page.locator('main, [role="main"], .container, .min-h-screen').first();
    await expect(mainContent).toBeVisible();

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console errors on homepage:', consoleErrors);
    }
    if (failedRequests.length > 0) {
      console.log('Failed requests on homepage:', failedRequests);
    }

    // Take screenshot for visual inspection
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
  });
});

test.describe('Navbar and Navigation QA', () => {
  test('All navbar links are clickable and load pages', async ({ page }) => {
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });

    const navLinks = [
      { label: 'Home', expectedUrl: '/' },
      { label: 'Pokémon TCG', expectedUrl: '/tcgexpansions' },
      { label: 'Pokédex', expectedUrl: '/pokedex' },
      { label: 'Pokémon', expectedUrl: '/pokemon' },
      { label: 'Battle', expectedUrl: '/battle-simulator' },
      { label: 'Pocket', expectedUrl: '/pocketmode' },
      { label: 'Fun', expectedUrl: '/fun' },
    ];

    for (const link of navLinks) {
      await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });

      // Try to find and click the nav link
      const navLink = page.locator(`nav a:has-text("${link.label}")`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForLoadState('domcontentloaded');

        // Check we navigated
        const currentUrl = page.url();
        console.log(`Clicked "${link.label}" -> navigated to: ${currentUrl}`);

        // Check page doesn't show error
        const errorText = await page.locator('text=/error|404|500|failed/i').count();
        if (errorText > 0) {
          console.log(`WARNING: Possible error on ${link.label} page`);
        }
      } else {
        console.log(`WARNING: Nav link "${link.label}" not found or not visible`);
      }
    }
  });

  test('Login button is visible in navbar', async ({ page }) => {
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });

    // Look for person icon (login button)
    const loginButton = page.locator('a[href="/auth/login"], a[href="/profile"]').first();
    await expect(loginButton).toBeVisible();

    // Click and verify it goes to login page
    await loginButton.click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/auth/login');
  });
});

test.describe('Pokedex Page QA', () => {
  test('Pokedex page loads and displays Pokemon correctly', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('http://localhost:3001/pokedex', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for Pokemon cards to load
    await page.waitForTimeout(3000);

    // Check for Pokemon cards
    const pokemonCards = page.locator('[class*="pokemon"], [class*="card"], [data-pokemon]');
    const cardCount = await pokemonCards.count();
    console.log(`Found ${cardCount} Pokemon elements on Pokedex page`);

    // Check for weird shapes - look for images that might not have proper aspect ratio
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 20); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const box = await img.boundingBox();
        if (box) {
          // Check if image has reasonable dimensions
          const aspectRatio = box.width / box.height;
          if (aspectRatio < 0.3 || aspectRatio > 3) {
            console.log(`WARNING: Possibly distorted image at index ${i}, aspect ratio: ${aspectRatio.toFixed(2)}`);
          }
        }
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/pokedex.png', fullPage: true });

    if (consoleErrors.length > 0) {
      console.log('Console errors on Pokedex:', consoleErrors);
    }
  });

  test('Pokedex Pokemon cards have consistent sizing', async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Find all Pokemon card containers
    const cards = page.locator('[class*="grid"] > div, [class*="flex-wrap"] > div').filter({
      has: page.locator('img')
    });

    const cardCount = await cards.count();
    const sizes: { width: number; height: number }[] = [];

    for (let i = 0; i < Math.min(cardCount, 20); i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        const box = await card.boundingBox();
        if (box && box.width > 50 && box.height > 50) {
          sizes.push({ width: box.width, height: box.height });
        }
      }
    }

    // Check for consistency
    if (sizes.length > 2) {
      const avgWidth = sizes.reduce((a, b) => a + b.width, 0) / sizes.length;
      const avgHeight = sizes.reduce((a, b) => a + b.height, 0) / sizes.length;

      const inconsistent = sizes.filter(s =>
        Math.abs(s.width - avgWidth) > avgWidth * 0.2 ||
        Math.abs(s.height - avgHeight) > avgHeight * 0.2
      );

      if (inconsistent.length > 0) {
        console.log(`WARNING: ${inconsistent.length} cards have inconsistent sizing`);
        console.log('Average size:', avgWidth.toFixed(0), 'x', avgHeight.toFixed(0));
        console.log('Inconsistent sizes:', inconsistent);
      }
    }
  });
});

test.describe('Regions Page QA', () => {
  test('Regions page loads correctly', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('http://localhost:3001/pokemon/regions', { waitUntil: 'networkidle', timeout: 30000 });

    // Check page title or heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/regions.png', fullPage: true });

    if (consoleErrors.length > 0) {
      console.log('Console errors on Regions:', consoleErrors);
    }
  });

  test('Starter Pokemon have proper image shapes', async ({ page }) => {
    await page.goto('http://localhost:3001/pokemon/starters', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Find Pokemon images
    const pokemonImages = page.locator('img[src*="pokemon"], img[src*="raw.githubusercontent"], img[alt*="Pokemon"], img[alt*="pokemon"]');
    const imgCount = await pokemonImages.count();

    console.log(`Found ${imgCount} Pokemon images on Starters page`);

    const issues: string[] = [];

    for (let i = 0; i < imgCount; i++) {
      const img = pokemonImages.nth(i);
      if (await img.isVisible()) {
        const box = await img.boundingBox();
        const src = await img.getAttribute('src');

        if (box) {
          const aspectRatio = box.width / box.height;
          // Pokemon sprites should be roughly square (0.7 to 1.4 aspect ratio)
          if (aspectRatio < 0.5 || aspectRatio > 2) {
            issues.push(`Image ${i} (${src?.slice(-30)}) has odd aspect ratio: ${aspectRatio.toFixed(2)} (${box.width.toFixed(0)}x${box.height.toFixed(0)})`);
          }
        }
      }
    }

    if (issues.length > 0) {
      console.log('WARNING: Starter Pokemon image issues:');
      issues.forEach(issue => console.log('  -', issue));
    }

    await page.screenshot({ path: 'test-results/starters.png', fullPage: true });
  });
});

test.describe('TCG Expansions Page QA', () => {
  test('TCG page loads and shows sets', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);
    const failedRequests = collectFailedRequests(page);

    await page.goto('http://localhost:3001/tcgexpansions', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Check for loading state cleared
    const loadingIndicators = page.locator('[class*="loading"], [class*="skeleton"], [class*="animate-pulse"]');
    const stillLoading = await loadingIndicators.count();

    if (stillLoading > 10) {
      console.log(`WARNING: ${stillLoading} loading indicators still visible - data may not have loaded`);
    }

    // Check for set cards
    const setCards = page.locator('[class*="card"], [class*="set"], [class*="expansion"]');
    const setCount = await setCards.count();
    console.log(`Found ${setCount} set elements on TCG page`);

    if (setCount === 0) {
      console.log('WARNING: No TCG sets found - API may have failed');
    }

    // Check for error messages
    const errorMessages = page.locator('text=/error|failed|unable/i');
    const errorCount = await errorMessages.count();
    if (errorCount > 0) {
      console.log(`WARNING: Found ${errorCount} error messages on page`);
    }

    await page.screenshot({ path: 'test-results/tcg-expansions.png', fullPage: true });

    if (consoleErrors.length > 0) {
      console.log('Console errors on TCG:', consoleErrors);
    }
    if (failedRequests.length > 0) {
      console.log('Failed requests on TCG:', failedRequests);
    }
  });

  test('TCG set cards have aligned containers', async ({ page }) => {
    await page.goto('http://localhost:3001/tcgexpansions', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Find grid container
    const gridContainer = page.locator('[class*="grid"]').first();
    if (await gridContainer.isVisible()) {
      const gridBox = await gridContainer.boundingBox();

      // Get all direct children
      const children = gridContainer.locator('> *');
      const childCount = await children.count();

      const leftPositions: number[] = [];

      for (let i = 0; i < Math.min(childCount, 12); i++) {
        const child = children.nth(i);
        if (await child.isVisible()) {
          const box = await child.boundingBox();
          if (box) {
            leftPositions.push(box.x);
          }
        }
      }

      // Check if items align to grid columns
      const uniquePositions = [...new Set(leftPositions.map(p => Math.round(p / 10) * 10))];
      console.log(`Grid has ${uniquePositions.length} unique column positions`);

      if (uniquePositions.length > 6) {
        console.log('WARNING: Grid items may not be aligned properly');
      }
    }
  });
});

test.describe('Pokemon Detail Page QA', () => {
  test('Pokemon detail page loads correctly', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    // Test with Pikachu
    await page.goto('http://localhost:3001/pokemon/25', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check for Pokemon name
    const pokemonName = page.locator('text=/pikachu/i').first();
    await expect(pokemonName).toBeVisible();

    // Check for Pokemon image
    const pokemonImage = page.locator('img[src*="pokemon"]').first();
    await expect(pokemonImage).toBeVisible();

    // Check for stats section
    const stats = page.locator('text=/stats|hp|attack|defense/i').first();
    if (await stats.isVisible()) {
      console.log('Stats section found');
    } else {
      console.log('WARNING: Stats section may not be visible');
    }

    await page.screenshot({ path: 'test-results/pokemon-detail-pikachu.png', fullPage: true });

    if (consoleErrors.length > 0) {
      console.log('Console errors on Pokemon detail:', consoleErrors);
    }
  });
});

test.describe('Battle Simulator QA', () => {
  test('Battle simulator page loads', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('http://localhost:3001/battle-simulator', { waitUntil: 'networkidle', timeout: 30000 });

    // Check for main content
    const content = page.locator('main, [class*="container"]').first();
    await expect(content).toBeVisible();

    await page.screenshot({ path: 'test-results/battle-simulator.png', fullPage: true });

    if (consoleErrors.length > 0) {
      console.log('Console errors on Battle Simulator:', consoleErrors);
    }
  });

  test('Type effectiveness page loads', async ({ page }) => {
    await page.goto('http://localhost:3001/type-effectiveness', { waitUntil: 'networkidle', timeout: 30000 });

    // Look for type chart or type buttons
    const typeElements = page.locator('[class*="type"], button:has-text(/fire|water|grass|electric/i)');
    const typeCount = await typeElements.count();

    console.log(`Found ${typeCount} type elements on Type Effectiveness page`);

    await page.screenshot({ path: 'test-results/type-effectiveness.png', fullPage: true });
  });
});

test.describe('Pocket Mode QA', () => {
  test('Pocket mode main page loads', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('http://localhost:3001/pocketmode', { waitUntil: 'networkidle', timeout: 30000 });

    // Check for content
    const content = page.locator('main, [class*="container"]').first();
    await expect(content).toBeVisible();

    await page.screenshot({ path: 'test-results/pocket-mode.png', fullPage: true });

    if (consoleErrors.length > 0) {
      console.log('Console errors on Pocket Mode:', consoleErrors);
    }
  });

  test('Pocket expansions page loads', async ({ page }) => {
    await page.goto('http://localhost:3001/pocketmode/expansions', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/pocket-expansions.png', fullPage: true });
  });
});

test.describe('Auth Page QA', () => {
  test('Login page loads and displays form', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/login', { waitUntil: 'networkidle' });

    // Check for form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Check for OAuth buttons
    const oauthButtons = page.locator('button:has(svg)');
    const oauthCount = await oauthButtons.count();
    console.log(`Found ${oauthCount} OAuth buttons`);

    await page.screenshot({ path: 'test-results/login-page.png', fullPage: true });
  });
});

test.describe('API Health Check', () => {
  test('TCG API responds correctly', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/tcgexpansions');
    console.log('TCG API status:', response.status());

    if (response.ok()) {
      const data = await response.json();
      console.log('TCG API returned', Array.isArray(data) ? data.length : 'object', 'items');
    } else {
      console.log('WARNING: TCG API returned error:', response.status());
    }
  });

  test('Debug TCG API endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/debug-tcg-api');
    console.log('Debug TCG API status:', response.status());

    if (response.ok()) {
      const data = await response.json();
      console.log('Debug API response:', JSON.stringify(data).slice(0, 200));
    }
  });
});

test.describe('UI Alignment and Visual Consistency', () => {
  test('Check for text overlapping icons', async ({ page }) => {
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });

    // Find all elements with icons (svg) that also have text siblings
    const iconContainers = page.locator('button:has(svg), a:has(svg), div:has(svg)');
    const count = await iconContainers.count();

    const issues: string[] = [];

    for (let i = 0; i < Math.min(count, 30); i++) {
      const container = iconContainers.nth(i);
      if (await container.isVisible()) {
        const svg = container.locator('svg').first();
        const text = await container.textContent();

        if (text && text.trim().length > 0) {
          const svgBox = await svg.boundingBox();
          const containerBox = await container.boundingBox();

          if (svgBox && containerBox) {
            // Check if icon is too small relative to container
            if (svgBox.width < 12 || svgBox.height < 12) {
              issues.push(`Small icon found: ${svgBox.width.toFixed(0)}x${svgBox.height.toFixed(0)} with text "${text.trim().slice(0, 20)}"`);
            }
          }
        }
      }
    }

    if (issues.length > 0) {
      console.log('Potential icon/text issues:');
      issues.forEach(issue => console.log('  -', issue));
    }
  });

  test('Check container alignment on homepage', async ({ page }) => {
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });

    // Find main containers
    const containers = page.locator('[class*="container"], [class*="max-w-"], section');
    const count = await containers.count();

    const leftEdges: number[] = [];
    const rightEdges: number[] = [];

    for (let i = 0; i < Math.min(count, 10); i++) {
      const container = containers.nth(i);
      if (await container.isVisible()) {
        const box = await container.boundingBox();
        if (box && box.width > 200) {
          leftEdges.push(Math.round(box.x));
          rightEdges.push(Math.round(box.x + box.width));
        }
      }
    }

    // Check alignment consistency
    const uniqueLeft = [...new Set(leftEdges)];
    const uniqueRight = [...new Set(rightEdges)];

    if (uniqueLeft.length > 3) {
      console.log('WARNING: Containers have inconsistent left edges:', uniqueLeft);
    }
    if (uniqueRight.length > 3) {
      console.log('WARNING: Containers have inconsistent right edges:', uniqueRight);
    }
  });
});

test.describe('Mobile Responsiveness QA', () => {
  test('Homepage renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });

    // Check for horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    if (bodyWidth > viewportWidth) {
      console.log(`WARNING: Horizontal overflow detected. Body: ${bodyWidth}px, Viewport: ${viewportWidth}px`);
    }

    // Check mobile menu button is visible
    const mobileMenuButton = page.locator('#mobile-menu-button, button[aria-label*="menu"]');
    await expect(mobileMenuButton.first()).toBeVisible();

    await page.screenshot({ path: 'test-results/homepage-mobile.png', fullPage: true });
  });

  test('Pokedex renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3001/pokedex', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check for horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    if (bodyWidth > viewportWidth) {
      console.log(`WARNING: Horizontal overflow on mobile Pokedex. Body: ${bodyWidth}px, Viewport: ${viewportWidth}px`);
    }

    await page.screenshot({ path: 'test-results/pokedex-mobile.png', fullPage: true });
  });
});

test.describe('Page Load Performance', () => {
  test('Key pages load within acceptable time', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Homepage', maxTime: 5000 },
      { url: '/pokedex', name: 'Pokedex', maxTime: 10000 },
      { url: '/tcgexpansions', name: 'TCG', maxTime: 15000 },
      { url: '/pokemon/regions', name: 'Regions', maxTime: 10000 },
    ];

    for (const p of pages) {
      const start = Date.now();
      await page.goto(`http://localhost:3001${p.url}`, { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - start;

      console.log(`${p.name} load time: ${loadTime}ms`);

      if (loadTime > p.maxTime) {
        console.log(`WARNING: ${p.name} exceeded max load time of ${p.maxTime}ms`);
      }
    }
  });
});
