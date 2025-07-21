import { Page, test as base, expect } from '@playwright/test';
import path from 'path';

export interface VisualRegressionOptions {
  threshold?: number; // Pixel difference threshold (0-1)
  maxDiffPixels?: number; // Maximum number of different pixels
  animations?: 'disabled' | 'allow';
  mask?: Array<{ selector: string }>; // Elements to mask
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
}

export class VisualRegressionHelper {
  private page: Page;
  private readonly defaultOptions: VisualRegressionOptions = {
    threshold: 0.2,
    maxDiffPixels: 100,
    animations: 'disabled',
    fullPage: false,
  };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Take a screenshot and compare with baseline
   */
  async compareSnapshot(
    name: string,
    options: VisualRegressionOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    // Disable animations if requested
    if (mergedOptions.animations === 'disabled') {
      await this.disableAnimations();
    }

    // Wait for page to stabilize
    await this.waitForPageStable();

    // Mask dynamic elements
    if (mergedOptions.mask) {
      await this.maskElements(mergedOptions.mask);
    }

    // Take screenshot and compare
    await expect(this.page).toHaveScreenshot(`${name}.png`, {
      threshold: mergedOptions.threshold,
      maxDiffPixels: mergedOptions.maxDiffPixels,
      fullPage: mergedOptions.fullPage,
      clip: mergedOptions.clip,
      animations: mergedOptions.animations,
      mask: mergedOptions.mask?.map(m => this.page.locator(m.selector)),
    });
  }

  /**
   * Compare a specific element
   */
  async compareElementSnapshot(
    selector: string,
    name: string,
    options: VisualRegressionOptions = {}
  ): Promise<void> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });

    const mergedOptions = { ...this.defaultOptions, ...options };

    if (mergedOptions.animations === 'disabled') {
      await this.disableAnimations();
    }

    await expect(element).toHaveScreenshot(`${name}-element.png`, {
      threshold: mergedOptions.threshold,
      maxDiffPixels: mergedOptions.maxDiffPixels,
      animations: mergedOptions.animations,
    });
  }

  /**
   * Compare multiple viewport sizes
   */
  async compareResponsiveSnapshot(
    name: string,
    viewports: Array<{ width: number; height: number; label: string }>,
    options: VisualRegressionOptions = {}
  ): Promise<void> {
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500); // Allow layout to settle
      
      await this.compareSnapshot(
        `${name}-${viewport.label}`,
        options
      );
    }
  }

  /**
   * Disable animations and transitions
   */
  private async disableAnimations(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  }

  /**
   * Wait for page to be visually stable
   */
  private async waitForPageStable(): Promise<void> {
    // Wait for network idle
    await this.page.waitForLoadState('networkidle');
    
    // Wait for fonts to load
    await this.page.evaluate(() => document.fonts.ready);
    
    // Wait for images to load
    await this.page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete);
    });
    
    // Additional wait for any lazy-loaded content
    await this.page.waitForTimeout(1000);
  }

  /**
   * Mask dynamic elements before screenshot
   */
  private async maskElements(masks: Array<{ selector: string }>): Promise<void> {
    for (const mask of masks) {
      const elements = await this.page.$$(mask.selector);
      for (const element of elements) {
        await element.evaluate((el) => {
          (el as HTMLElement).style.visibility = 'hidden';
        });
      }
    }
  }

  /**
   * Capture performance metrics during visual test
   */
  async captureVisualPerformanceMetrics(): Promise<{
    renderTime: number;
    paintTime: number;
    layoutTime: number;
  }> {
    return await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('measure');
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        renderTime: entries.find(e => e.name === 'render')?.duration || 0,
        paintTime: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
        layoutTime: entries.find(e => e.name === 'layout')?.duration || 0,
      };
    });
  }
}

/**
 * Standard viewports for responsive testing
 */
export const STANDARD_VIEWPORTS = {
  mobile: { width: 375, height: 667, label: 'mobile' },
  tablet: { width: 768, height: 1024, label: 'tablet' },
  desktop: { width: 1440, height: 900, label: 'desktop' },
  wide: { width: 1920, height: 1080, label: 'wide' },
};

/**
 * Common elements to mask in visual tests
 */
export const COMMON_MASKS = {
  timestamps: { selector: '[data-testid*="timestamp"], .timestamp, time' },
  userAvatars: { selector: '[data-testid*="avatar"], .avatar, .user-image' },
  dynamicCounts: { selector: '[data-testid*="count"], .count, .counter' },
  loadingStates: { selector: '.loading, .skeleton, [data-loading="true"]' },
  ads: { selector: '.advertisement, .ad-container, [data-ad]' },
};

/**
 * Visual regression test fixture
 */
export const visualTest = base.extend<{
  visualRegression: VisualRegressionHelper;
}>({
  visualRegression: async ({ page }, use) => {
    const helper = new VisualRegressionHelper(page);
    await use(helper);
  },
});