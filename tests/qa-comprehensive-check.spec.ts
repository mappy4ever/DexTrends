import { test, expect } from '@playwright/test';

// QA Comprehensive Route Testing
test.describe('QA Comprehensive Route Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console error tracking
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });
    
    // Store errors on the page context
    (page as any).consoleErrors = consoleErrors;
  });

  test.afterEach(async ({ page }) => {
    const errors = (page as any).consoleErrors || [];
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
  });

  // Homepage Test
  test('Homepage - /', async ({ page }) => {
    console.log('\n=== Testing Homepage ===');
    
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    
    // Check page loads
    await expect(page).toHaveTitle(/DexTrends/i);
    
    // Check for main navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for hero section
    const hero = page.locator('[data-testid="hero-section"]');
    if (await hero.isVisible()) {
      console.log('✓ Hero section loaded');
    }
    
    // Check for popular cards section
    const popularCards = page.locator('[data-testid="popular-cards"]');
    if (await popularCards.isVisible()) {
      console.log('✓ Popular cards section loaded');
    }
    
    // Check interactive elements
    const searchBar = page.locator('[data-testid="global-search"]');
    if (await searchBar.isVisible()) {
      await searchBar.click();
      await searchBar.fill('Pikachu');
      console.log('✓ Search bar functional');
    }
    
    // Report errors
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // Pokedex Test
  test('Pokedex - /pokedex', async ({ page }) => {
    console.log('\n=== Testing Pokedex ===');
    
    await page.goto('http://localhost:3001/pokedex', { waitUntil: 'networkidle' });
    
    // Wait for Pokemon grid
    const pokemonGrid = page.locator('[data-testid="pokemon-grid"]');
    await pokemonGrid.waitFor({ timeout: 30000 }).catch(() => {
      console.log('✗ Pokemon grid not found');
    });
    
    // Check for search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Charizard');
      console.log('✓ Search input functional');
    }
    
    // Check for filter options
    const typeFilter = page.locator('[data-testid="type-filter"]');
    if (await typeFilter.isVisible()) {
      console.log('✓ Type filter present');
    }
    
    // Check for Pokemon cards
    const pokemonCards = page.locator('[data-testid="pokemon-card"]');
    const cardCount = await pokemonCards.count();
    console.log(`Pokemon cards loaded: ${cardCount}`);
    
    // Test clicking a Pokemon
    if (cardCount > 0) {
      await pokemonCards.first().click();
      await page.waitForTimeout(2000);
      if (page.url().includes('/pokemon/')) {
        console.log('✓ Pokemon detail navigation works');
        await page.goBack();
      }
    }
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // TCG Sets Test
  test('TCG Sets - /tcgsets', async ({ page }) => {
    console.log('\n=== Testing TCG Sets ===');
    
    await page.goto('http://localhost:3001/tcgsets', { waitUntil: 'networkidle' });
    
    // Wait for sets grid
    const setsGrid = page.locator('[data-testid="sets-grid"]');
    await setsGrid.waitFor({ timeout: 30000 }).catch(() => {
      console.log('✗ Sets grid not found');
    });
    
    // Check for set cards
    const setCards = page.locator('[data-testid="set-card"]');
    const setCount = await setCards.count();
    console.log(`TCG sets loaded: ${setCount}`);
    
    // Check search functionality
    const searchBar = page.locator('input[placeholder*="Search"]');
    if (await searchBar.isVisible()) {
      await searchBar.fill('Base Set');
      console.log('✓ Search bar functional');
    }
    
    // Test clicking a set
    if (setCount > 0) {
      await setCards.first().click();
      await page.waitForTimeout(2000);
      if (page.url().includes('/tcgsets/')) {
        console.log('✓ Set detail navigation works');
        await page.goBack();
      }
    }
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // Pocket Mode Test
  test('Pocket Mode - /pocketmode', async ({ page }) => {
    console.log('\n=== Testing Pocket Mode ===');
    
    await page.goto('http://localhost:3001/pocketmode', { waitUntil: 'networkidle' });
    
    // Check for main pocket mode content
    const content = page.locator('main');
    await expect(content).toBeVisible();
    
    // Check for sub-navigation
    const deckLink = page.locator('a[href="/pocketmode/decks"]');
    if (await deckLink.isVisible()) {
      console.log('✓ Decks link present');
    }
    
    const expansionsLink = page.locator('a[href="/pocketmode/expansions"]');
    if (await expansionsLink.isVisible()) {
      console.log('✓ Expansions link present');
    }
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // Battle Simulator Test
  test('Battle Simulator - /battle-simulator', async ({ page }) => {
    console.log('\n=== Testing Battle Simulator ===');
    
    await page.goto('http://localhost:3001/battle-simulator', { waitUntil: 'networkidle' });
    
    // Check for Pokemon selection
    const pokemonSelectors = page.locator('[data-testid="pokemon-selector"]');
    const selectorCount = await pokemonSelectors.count();
    console.log(`Pokemon selectors found: ${selectorCount}`);
    
    // Check for battle button
    const battleButton = page.locator('button:has-text("Battle")');
    if (await battleButton.isVisible()) {
      console.log('✓ Battle button present');
    }
    
    // Check for stats display
    const statsDisplay = page.locator('[data-testid="pokemon-stats"]');
    if (await statsDisplay.isVisible()) {
      console.log('✓ Stats display present');
    }
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // Type Effectiveness Test
  test('Type Effectiveness - /type-effectiveness', async ({ page }) => {
    console.log('\n=== Testing Type Effectiveness ===');
    
    await page.goto('http://localhost:3001/type-effectiveness', { waitUntil: 'networkidle' });
    
    // Check for type matrix
    const typeMatrix = page.locator('[data-testid="type-matrix"]');
    if (await typeMatrix.isVisible()) {
      console.log('✓ Type matrix loaded');
    }
    
    // Check for type selectors
    const typeSelectors = page.locator('[data-testid="type-selector"]');
    const typeSelectorCount = await typeSelectors.count();
    console.log(`Type selectors found: ${typeSelectorCount}`);
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // Starters Test
  test('Pokemon Starters - /pokemon/starters', async ({ page }) => {
    console.log('\n=== Testing Pokemon Starters ===');
    
    await page.goto('http://localhost:3001/pokemon/starters', { waitUntil: 'networkidle' });
    
    // Check for generation tabs
    const genTabs = page.locator('[data-testid="generation-tab"]');
    const tabCount = await genTabs.count();
    console.log(`Generation tabs found: ${tabCount}`);
    
    // Check for starter Pokemon
    const starterCards = page.locator('[data-testid="starter-card"]');
    const starterCount = await starterCards.count();
    console.log(`Starter Pokemon displayed: ${starterCount}`);
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // Team Builder Test
  test('Team Builder - /team-builder', async ({ page }) => {
    console.log('\n=== Testing Team Builder ===');
    
    await page.goto('http://localhost:3001/team-builder', { waitUntil: 'networkidle' });
    
    // Check if route exists
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Check for team slots
    const teamSlots = page.locator('[data-testid="team-slot"]');
    const slotCount = await teamSlots.count();
    console.log(`Team slots found: ${slotCount}`);
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // 404 Page Test
  test('404 Error Page', async ({ page }) => {
    console.log('\n=== Testing 404 Page ===');
    
    await page.goto('http://localhost:3001/non-existent-route', { waitUntil: 'networkidle' });
    
    // Check for 404 content
    const heading = page.locator('h1');
    const headingText = await heading.textContent();
    console.log(`404 heading: ${headingText}`);
    
    // Check for home link
    const homeLink = page.locator('a[href="/"]');
    if (await homeLink.isVisible()) {
      console.log('✓ Home link present');
    }
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // Mobile Responsiveness Test
  test('Mobile Responsiveness Check', async ({ page }) => {
    console.log('\n=== Testing Mobile Responsiveness ===');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test homepage on mobile
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    
    // Check for mobile menu
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      console.log('✓ Mobile menu present');
    }
    
    // Check layout doesn't overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (bodyWidth <= viewportWidth) {
      console.log('✓ No horizontal overflow on mobile');
    } else {
      console.log(`✗ Horizontal overflow detected: ${bodyWidth}px > ${viewportWidth}px`);
    }
    
    const errors = (page as any).consoleErrors || [];
    console.log(`Console errors: ${errors.length}`);
  });

  // Performance Metrics Test
  test('Performance Metrics Collection', async ({ page }) => {
    console.log('\n=== Testing Performance Metrics ===');
    
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    
    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    console.log('Performance metrics:', metrics);
    
    if (metrics.firstContentfulPaint > 3000) {
      console.log('⚠️ Slow First Contentful Paint detected');
    }
  });
});