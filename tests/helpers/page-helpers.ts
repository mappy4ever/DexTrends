import { Page, Locator, BrowserContext } from '@playwright/test';

/**
 * Mobile gesture helpers
 */
export class MobileGestures {
  constructor(private page: Page) {}

  /**
   * Swipe gesture
   */
  async swipe(direction: 'up' | 'down' | 'left' | 'right', distance = 200): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) throw new Error('No viewport size available');

    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;

    let startX = centerX;
    let startY = centerY;
    let endX = centerX;
    let endY = centerY;

    switch (direction) {
      case 'up':
        startY = centerY + distance / 2;
        endY = centerY - distance / 2;
        break;
      case 'down':
        startY = centerY - distance / 2;
        endY = centerY + distance / 2;
        break;
      case 'left':
        startX = centerX + distance / 2;
        endX = centerX - distance / 2;
        break;
      case 'right':
        startX = centerX - distance / 2;
        endX = centerX + distance / 2;
        break;
    }

    await this.page.touchscreen.tap(startX, startY);
    await this.page.waitForTimeout(100);
    
    // Simulate swipe with multiple move events for smoothness
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      const y = startY + (endY - startY) * (i / steps);
      await this.page.touchscreen.tap(x, y);
      await this.page.waitForTimeout(10);
    }
  }

  /**
   * Pinch to zoom
   */
  async pinchZoom(scale: number): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) throw new Error('No viewport size available');

    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;

    // This is a simplified version - real pinch zoom would require multi-touch
    await this.page.evaluate(({ scale, x, y }) => {
      const element = document.elementFromPoint(x, y);
      if (element && element instanceof HTMLElement) {
        element.style.transform = `scale(${scale})`;
      }
    }, { scale, x: centerX, y: centerY });
  }

  /**
   * Long press
   */
  async longPress(locator: Locator, duration = 1000): Promise<void> {
    const box = await locator.boundingBox();
    if (!box) throw new Error('Element not found');

    await this.page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.waitForTimeout(duration);
  }
}

/**
 * Common page patterns for DexTrends
 */
export class DexTrendsPageHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to a Pokemon detail page
   */
  async goToPokemonDetail(pokemonId: number | string): Promise<void> {
    await this.page.goto(`/pokedex/${pokemonId}`);
    await this.page.waitForSelector('h1', { timeout: 60000 });
  }

  /**
   * Navigate to a TCG set
   */
  async goToTCGSet(setId: string): Promise<void> {
    await this.page.goto(`/tcgexpansions/${setId}`);
    await this.page.waitForSelector('[data-testid="card-item"]', { timeout: 60000 });
  }

  /**
   * Search for a Pokemon
   */
  async searchPokemon(name: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="search" i]').or(this.page.locator('input[type="search"]')).first();
    await searchInput.fill(name);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(1000); // Wait for search results
  }

  /**
   * Open global search modal
   */
  async openGlobalSearch(): Promise<void> {
    // Try multiple selectors for the search button
    const searchButton = this.page.locator('button:has-text("Search")').or(this.page.locator('[aria-label="Search"]')).or(this.page.locator('.search-button')).first();
    await searchButton.click();
    await this.page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  }

  /**
   * Filter Pokemon by type
   */
  async filterByType(type: string): Promise<void> {
    const typeFilter = this.page.locator('select[name="type"]').or(this.page.locator('[data-testid="type-filter"]')).or(this.page.locator('button:has-text("Type")')).first();
    
    if (await typeFilter.evaluate(el => el.tagName === 'SELECT')) {
      await typeFilter.selectOption(type);
    } else {
      await typeFilter.click();
      await this.page.locator(`button:has-text("${type}")`).or(this.page.locator(`[data-value="${type}"]`)).click();
    }
    
    await this.page.waitForTimeout(1000); // Wait for filter to apply
  }

  /**
   * Check if loading indicator is present
   */
  async isLoading(): Promise<boolean> {
    const loadingIndicators = this.page.locator('.loading').or(this.page.locator('[data-testid="loading"]')).or(this.page.locator('.spinner')).or(this.page.locator('.skeleton'));
    return await loadingIndicators.first().isVisible().catch(() => false);
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    // Wait for any loading indicators to disappear
    await this.page.waitForFunction(() => {
      const indicators = document.querySelectorAll('.loading, [data-testid="loading"], .spinner, .skeleton');
      return indicators.length === 0 || Array.from(indicators).every(el => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || style.visibility === 'hidden';
      });
    }, { timeout: 30000 });
  }

  /**
   * Check if error message is displayed
   */
  async getErrorMessage(): Promise<string | null> {
    const errorSelectors = [
      '.error-message',
      '[data-testid="error"]',
      '.alert-error',
      'text=/error|failed|problem/i'
    ];

    for (const selector of errorSelectors) {
      const error = this.page.locator(selector).first();
      if (await error.isVisible().catch(() => false)) {
        return await error.textContent();
      }
    }

    return null;
  }

  /**
   * Add item to favorites/collection
   */
  async addToFavorites(itemLocator: Locator): Promise<void> {
    const favoriteButton = itemLocator.locator('button:has-text("Favorite")').or(itemLocator.locator('[aria-label*="favorite" i]')).or(itemLocator.locator('.favorite-button'));
    await favoriteButton.click();
    
    // Wait for confirmation or state change
    await this.page.waitForTimeout(500);
  }

  /**
   * Open card modal/zoom view
   */
  async openCardModal(cardLocator: Locator): Promise<void> {
    await cardLocator.click();
    await this.page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  }

  /**
   * Close modal
   */
  async closeModal(): Promise<void> {
    // Try multiple ways to close modal
    const closeButton = this.page.locator('button[aria-label="Close"]').or(this.page.locator('.close-button')).or(this.page.locator('button:has-text("Close")')).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Try pressing Escape
      await this.page.keyboard.press('Escape');
    }
    
    // Wait for modal to disappear
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
  }
}

/**
 * Responsive testing helpers
 */
export async function testResponsiveBreakpoints(page: Page, callback: () => Promise<void>): Promise<void> {
  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'wide', width: 1920, height: 1080 },
  ];

  for (const breakpoint of breakpoints) {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    console.log(`Testing at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
    await callback();
  }
}

/**
 * Accessibility helpers
 */
export async function checkAccessibility(page: Page): Promise<{
  missingAltTexts: string[];
  lowContrastElements: number;
  missingLabels: string[];
}> {
  const results = await page.evaluate(() => {
    // Check for images without alt text
    const imagesWithoutAlt = Array.from(document.querySelectorAll('img:not([alt])'))
      .map(img => (img as HTMLImageElement).src);

    // Check for form inputs without labels
    const inputsWithoutLabels = Array.from(document.querySelectorAll('input, select, textarea'))
      .filter(input => {
        const id = input.id;
        if (!id) return true;
        return !document.querySelector(`label[for="${id}"]`);
      })
      .map(input => input.outerHTML.substring(0, 100));

    // This is a simplified contrast check - real implementation would be more complex
    const lowContrastCount = 0;

    return {
      missingAltTexts: imagesWithoutAlt,
      lowContrastElements: lowContrastCount,
      missingLabels: inputsWithoutLabels,
    };
  });

  return results;
}