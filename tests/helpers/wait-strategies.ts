/**
 * Common wait strategies for test stability
 */
import { Page, Locator } from '@playwright/test';

export class WaitStrategies {
  constructor(private page: Page) {}

  /**
   * Wait for Pokemon cards to be loaded and visible
   */
  async waitForPokemonCards(): Promise<void> {
    // Wait for at least one Pokemon card to be visible
    await this.page.waitForSelector('[data-testid="pokemon-card"]', {
      state: 'visible',
      timeout: 30000
    });

    // Wait for loading spinners to disappear
    await this.waitForLoadingToComplete();

    // Give cards time to render
    await this.page.waitForTimeout(500);
  }

  /**
   * Wait for all loading spinners to disappear
   */
  async waitForLoadingToComplete(): Promise<void> {
    // Wait for all loading spinners to be hidden
    const loadingSelectors = [
      '.loading-spinner',
      '.pokeball-loader',
      '[data-testid="loading"]',
      '.animate-spin',
      'text=/loading/i'
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, {
          state: 'hidden',
          timeout: 5000
        });
      } catch (e) {
        // Selector might not exist, which is fine
      }
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(url?: string | RegExp): Promise<void> {
    await Promise.all([
      this.page.waitForLoadState('networkidle'),
      url ? this.page.waitForURL(url) : Promise.resolve()
    ]);
  }

  /**
   * Wait for data to be loaded (checks for common data indicators)
   */
  async waitForDataLoad(options?: {
    minItemCount?: number;
    selector?: string;
    timeout?: number;
  }): Promise<void> {
    const { 
      minItemCount = 1, 
      selector = '[data-testid="pokemon-card"]',
      timeout = 30000 
    } = options || {};

    // Wait for minimum number of items
    await this.page.waitForFunction(
      ({ selector, minCount }) => {
        const elements = document.querySelectorAll(selector);
        return elements.length >= minCount;
      },
      { selector, minCount: minItemCount },
      { timeout }
    );

    // Wait for loading to complete
    await this.waitForLoadingToComplete();
  }

  /**
   * Wait for modal to appear
   */
  async waitForModal(): Promise<void> {
    await this.page.waitForSelector('[role="dialog"]', {
      state: 'visible',
      timeout: 10000
    });
  }

  /**
   * Wait for modal to close
   */
  async waitForModalToClose(): Promise<void> {
    await this.page.waitForSelector('[role="dialog"]', {
      state: 'hidden',
      timeout: 10000
    });
  }

  /**
   * Wait for search results
   */
  async waitForSearchResults(): Promise<void> {
    // Wait for search to process
    await this.page.waitForTimeout(500);

    // Wait for results or no results message
    await this.page.waitForSelector(
      '[data-testid="pokemon-card"]',
      { timeout: 15000 }
    );
  }

  /**
   * Wait for page to be ready (general purpose)
   */
  async waitForPageReady(): Promise<void> {
    // Wait for basic page load
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for network to settle
    await this.page.waitForLoadState('networkidle');

    // Wait for any initial animations
    await this.page.waitForTimeout(300);

    // Wait for loading indicators to disappear
    await this.waitForLoadingToComplete();
  }

  /**
   * Smart click with wait
   */
  async clickAndWait(selector: string | Locator, options?: {
    waitAfter?: number;
    waitForNavigation?: boolean;
  }): Promise<void> {
    const { waitAfter = 500, waitForNavigation = true } = options || {};

    if (waitForNavigation) {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        typeof selector === 'string' 
          ? this.page.click(selector)
          : selector.click()
      ]);
    } else {
      await (typeof selector === 'string' 
        ? this.page.click(selector)
        : selector.click());
    }

    await this.page.waitForTimeout(waitAfter);
  }

  /**
   * Wait for element with retry
   */
  async waitForElementWithRetry(
    selector: string,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      state?: 'visible' | 'hidden' | 'attached' | 'detached';
    }
  ): Promise<Locator | null> {
    const { maxRetries = 3, retryDelay = 1000, state = 'visible' } = options || {};

    for (let i = 0; i < maxRetries; i++) {
      try {
        const element = this.page.locator(selector);
        await element.waitFor({ state, timeout: 10000 });
        return element;
      } catch (e) {
        if (i < maxRetries - 1) {
          await this.page.waitForTimeout(retryDelay);
        } else {
          throw e;
        }
      }
    }

    return null;
  }
}

/**
 * Helper function to create wait strategies for a page
 */
export function createWaitStrategies(page: Page): WaitStrategies {
  return new WaitStrategies(page);
}