import { Page, Locator } from '@playwright/test';
import { ConsoleLogger } from './console-logger';

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 30000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for all images to load
 */
export async function waitForImages(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.complete && img.naturalHeight !== 0);
  });
}

/**
 * Wait for animations to complete
 */
export async function waitForAnimations(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const animations = document.getAnimations();
    return animations.length === 0 || animations.every(animation => animation.playState !== 'running');
  });
}

/**
 * Safe navigation with error handling
 */
export async function safeGoto(page: Page, url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
  try {
    await page.goto(url, { waitUntil: options?.waitUntil || 'networkidle' });
  } catch (error) {
    console.error(`Failed to navigate to ${url}:`, error);
    throw error;
  }
}

/**
 * Click element with retry logic
 */
export async function clickWithRetry(locator: Locator, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await locator.click({ timeout: 5000 });
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await locator.page().waitForTimeout(1000);
    }
  }
}

/**
 * Wait for element to be stable (not moving)
 */
export async function waitForElementStable(locator: Locator, timeout = 5000): Promise<void> {
  const startTime = Date.now();
  let lastBox = await locator.boundingBox();
  
  while (Date.now() - startTime < timeout) {
    await locator.page().waitForTimeout(100);
    const currentBox = await locator.boundingBox();
    
    if (lastBox && currentBox && 
        lastBox.x === currentBox.x && 
        lastBox.y === currentBox.y &&
        lastBox.width === currentBox.width &&
        lastBox.height === currentBox.height) {
      return;
    }
    
    lastBox = currentBox;
  }
  
  throw new Error(`Element did not stabilize within ${timeout}ms`);
}

/**
 * Filter console messages by error category
 */
export function categorizeErrors(logger: ConsoleLogger): {
  networkErrors: string[];
  jsErrors: string[];
  resourceErrors: string[];
  otherErrors: string[];
} {
  const errors = logger.getErrors();
  const categorized = {
    networkErrors: [] as string[],
    jsErrors: [] as string[],
    resourceErrors: [] as string[],
    otherErrors: [] as string[],
  };

  errors.forEach(error => {
    const text = error.text.toLowerCase();
    
    if (text.includes('failed to fetch') || text.includes('network') || text.includes('cors')) {
      categorized.networkErrors.push(error.text);
    } else if (text.includes('cannot read') || text.includes('undefined') || text.includes('null')) {
      categorized.jsErrors.push(error.text);
    } else if (text.includes('404') || text.includes('resource') || text.includes('load')) {
      categorized.resourceErrors.push(error.text);
    } else {
      categorized.otherErrors.push(error.text);
    }
  });

  return categorized;
}

/**
 * Check if page has any broken images
 */
export async function checkBrokenImages(page: Page): Promise<string[]> {
  const brokenImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images
      .filter(img => !img.complete || img.naturalHeight === 0)
      .map(img => img.src);
  });
  
  return brokenImages;
}

/**
 * Get page performance metrics
 */
export async function getPerformanceMetrics(page: Page): Promise<{
  domContentLoaded: number;
  load: number;
  firstPaint: number;
  firstContentfulPaint: number;
}> {
  const performanceTiming = await page.evaluate(() => {
    const timing = performance.timing;
    const navigationStart = timing.navigationStart;
    
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
      load: timing.loadEventEnd - navigationStart,
      firstPaint: firstPaint ? firstPaint.startTime : 0,
      firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
    };
  });
  
  return performanceTiming;
}

/**
 * Mock API responses
 */
export async function mockApiResponse(page: Page, urlPattern: string | RegExp, response: unknown): Promise<void> {
  await page.route(urlPattern, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Intercept and log all network requests
 */
export async function logNetworkRequests(page: Page): Promise<void> {
  page.on('request', request => {
    console.log(`>> ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    console.log(`<< ${response.status()} ${response.url()}`);
  });
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeDebugScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `tests/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}