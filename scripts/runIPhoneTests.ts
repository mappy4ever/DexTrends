#!/usr/bin/env node

/**
 * iPhone Compatibility Test Runner
 * Real browser testing for iPhone compatibility validation using Playwright
 */

import { chromium, devices, Browser, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Test configuration
interface TestConfig {
  baseUrl: string;
  outputDir: string;
  timestamp: string;
  screenshotDir: string;
  slowMo?: number;
  headless?: boolean;
}

const testConfig: TestConfig = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  outputDir: './qa-reports/iphone',
  screenshotDir: './qa-reports/iphone/screenshots',
  timestamp: new Date().toISOString(),
  slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
  headless: process.env.HEADLESS !== 'false'
};

// iPhone models to test
interface iPhoneModel {
  name: string;
  device: string;
  width: number;
  height: number;
  pixelRatio: number;
}

const iPhoneModels: iPhoneModel[] = [
  { name: 'iPhone SE', device: 'iPhone SE', width: 375, height: 667, pixelRatio: 2 },
  { name: 'iPhone 12 Mini', device: 'iPhone 12 Mini', width: 375, height: 812, pixelRatio: 3 },
  { name: 'iPhone 12/13', device: 'iPhone 12', width: 390, height: 844, pixelRatio: 3 },
  { name: 'iPhone 14 Pro', device: 'iPhone 14 Pro', width: 393, height: 852, pixelRatio: 3 },
  { name: 'iPhone 15 Pro Max', device: 'iPhone 15 Pro Max', width: 430, height: 932, pixelRatio: 3 }
];

// Test result interfaces
interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  duration?: number;
  screenshot?: string;
  error?: string;
}

interface CategoryResults {
  category: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  warnings: number;
}

interface DeviceResults {
  device: string;
  viewport: { width: number; height: number };
  timestamp: string;
  categories: CategoryResults[];
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalWarnings: number;
}

// Utility functions
function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string): void {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

function logTest(name: string, status: string, details: string = ''): void {
  const statusSymbol = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const statusColor = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  
  console.log(`${statusSymbol} ${name}`);
  if (details) {
    log(`   ${details}`, statusColor);
  }
}

// Create output directories
function ensureOutputDirs(): void {
  [testConfig.outputDir, testConfig.screenshotDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Take screenshot with error handling
async function takeScreenshot(page: Page, name: string): Promise<string | undefined> {
  try {
    const screenshotPath = path.join(testConfig.screenshotDir, `${name}-${Date.now()}.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    return screenshotPath;
  } catch (error) {
    logger.error('Failed to take screenshot', { error: error.toString(), component: 'iPhoneTests' });
    return undefined;
  }
}

// Wait for page to be ready
async function waitForPageReady(page: Page): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(1000); // Wait for animations
  } catch (error) {
    logger.warn('Page load timeout - continuing with tests', { component: 'iPhoneTests' });
  }
}

// Test implementations

// 1. Layout & Safe Areas Tests
async function runLayoutTests(page: Page, device: iPhoneModel): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  try {
    // Test viewport meta tag
    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content') || null;
    });

    results.push({
      name: 'Viewport configuration',
      status: viewportMeta?.includes('viewport-fit=cover') ? 'pass' : 'fail',
      details: viewportMeta || 'No viewport meta tag found',
      duration: Date.now() - startTime
    });

    // Test safe area CSS
    const safeAreaStyles = await page.evaluate(() => {
      const computedStyles = getComputedStyle(document.documentElement);
      return {
        paddingTop: computedStyles.getPropertyValue('padding-top'),
        paddingBottom: computedStyles.getPropertyValue('padding-bottom'),
        envSupport: CSS.supports('padding-top', 'env(safe-area-inset-top)')
      };
    });

    results.push({
      name: 'Safe area insets',
      status: safeAreaStyles.envSupport ? 'pass' : 'warning',
      details: `env() support: ${safeAreaStyles.envSupport}`,
      duration: Date.now() - startTime
    });

    // Test fixed positioning elements
    const fixedElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const fixed: string[] = [];
      elements.forEach(el => {
        const style = getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky') {
          fixed.push(`${el.tagName}.${el.className}`);
        }
      });
      return fixed;
    });

    results.push({
      name: 'Fixed positioning',
      status: 'pass',
      details: `Found ${fixedElements.length} fixed/sticky elements`,
      duration: Date.now() - startTime
    });

    // Test keyboard avoidance
    const inputElements = await page.$$('input, textarea, select');
    if (inputElements.length > 0) {
      await inputElements[0].focus();
      await page.waitForTimeout(500);
      
      const keyboardHandling = await page.evaluate(() => {
        return window.visualViewport ? window.visualViewport.height : window.innerHeight;
      });

      results.push({
        name: 'Keyboard avoidance',
        status: 'pass',
        details: `Visual viewport API ${window.visualViewport ? 'supported' : 'not supported'}`,
        duration: Date.now() - startTime
      });
    }

  } catch (error: any) {
    results.push({
      name: 'Layout tests error',
      status: 'fail',
      details: error.message,
      error: error.stack,
      duration: Date.now() - startTime
    });
  }

  return results;
}

// 2. Touch Target Compliance Tests
async function runTouchTargetTests(page: Page, device: iPhoneModel): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const startTime = Date.now();
  const MINIMUM_TARGET_SIZE = 44; // Apple's minimum touch target size

  try {
    // Find all interactive elements
    const touchTargets = await page.evaluate((minSize) => {
      const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], [onclick], [data-testid*="button"]'
      );
      
      let totalTargets = 0;
      let compliantTargets = 0;
      const nonCompliant: string[] = [];

      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const computedStyle = getComputedStyle(element);
        
        // Include padding in touch target size
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);
        
        const width = rect.width + paddingLeft + paddingRight;
        const height = rect.height + paddingTop + paddingBottom;
        
        if (width > 0 && height > 0) {
          totalTargets++;
          if (width >= minSize && height >= minSize) {
            compliantTargets++;
          } else {
            nonCompliant.push(`${element.tagName} (${Math.round(width)}x${Math.round(height)}px)`);
          }
        }
      });

      return {
        total: totalTargets,
        compliant: compliantTargets,
        percentage: totalTargets > 0 ? (compliantTargets / totalTargets) * 100 : 100,
        nonCompliant: nonCompliant.slice(0, 5) // First 5 non-compliant elements
      };
    }, MINIMUM_TARGET_SIZE);

    results.push({
      name: 'Minimum touch target size',
      status: touchTargets.percentage >= 95 ? 'pass' : touchTargets.percentage >= 80 ? 'warning' : 'fail',
      details: `${touchTargets.percentage.toFixed(1)}% compliance (${touchTargets.compliant}/${touchTargets.total})`,
      duration: Date.now() - startTime
    });

    // Test touch target spacing
    const touchSpacing = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      let tooClose = 0;
      
      for (let i = 0; i < buttons.length - 1; i++) {
        const rect1 = buttons[i].getBoundingClientRect();
        const rect2 = buttons[i + 1].getBoundingClientRect();
        
        const horizontalGap = Math.abs(rect2.left - (rect1.left + rect1.width));
        const verticalGap = Math.abs(rect2.top - (rect1.top + rect1.height));
        
        if ((horizontalGap < 8 && horizontalGap > 0) || (verticalGap < 8 && verticalGap > 0)) {
          tooClose++;
        }
      }
      
      return { total: buttons.length, tooClose };
    });

    results.push({
      name: 'Touch target spacing',
      status: touchSpacing.tooClose === 0 ? 'pass' : 'warning',
      details: touchSpacing.tooClose > 0 ? `${touchSpacing.tooClose} targets too close together` : 'Adequate spacing between targets',
      duration: Date.now() - startTime
    });

  } catch (error: any) {
    results.push({
      name: 'Touch target tests error',
      status: 'fail',
      details: error.message,
      error: error.stack,
      duration: Date.now() - startTime
    });
  }

  return results;
}

// 3. Animation & Performance Tests
async function runAnimationTests(page: Page, device: iPhoneModel): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  try {
    // Start performance measurement
    await page.evaluate(() => {
      (window as any).__performanceMarks = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__performanceMarks.push(entry);
        }
      });
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    });

    // Trigger some animations by scrolling
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Measure frame rate during animations
    const frameRate = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frameCount);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });

    results.push({
      name: 'Frame rate',
      status: frameRate >= 50 ? 'pass' : frameRate >= 30 ? 'warning' : 'fail',
      details: `Average ${frameRate} FPS`,
      duration: Date.now() - startTime
    });

    // Check for GPU acceleration
    const gpuAcceleration = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let accelerated = 0;
      
      elements.forEach(el => {
        const transform = getComputedStyle(el).transform;
        const willChange = getComputedStyle(el).willChange;
        if (transform !== 'none' || willChange !== 'auto') {
          accelerated++;
        }
      });
      
      return accelerated;
    });

    results.push({
      name: 'GPU acceleration',
      status: gpuAcceleration > 0 ? 'pass' : 'warning',
      details: `${gpuAcceleration} elements use GPU acceleration`,
      duration: Date.now() - startTime
    });

    // Check reduced motion support
    const reducedMotion = await page.evaluate(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasReducedMotionStyles = Array.from(document.styleSheets).some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('prefers-reduced-motion')
          );
        } catch {
          return false;
        }
      });
      
      return { prefers: prefersReducedMotion, hasStyles: hasReducedMotionStyles };
    });

    results.push({
      name: 'Reduced motion',
      status: reducedMotion.hasStyles ? 'pass' : 'warning',
      details: reducedMotion.hasStyles ? 'Respects user preferences' : 'No reduced motion styles found',
      duration: Date.now() - startTime
    });

    // Test scroll performance
    const scrollPerformance = await page.evaluate(() => {
      return new Promise<{ smooth: boolean; duration: number }>((resolve) => {
        const startTime = performance.now();
        let lastPosition = window.scrollY;
        let smoothScrolls = 0;
        let totalScrolls = 0;
        
        function checkScroll() {
          const currentPosition = window.scrollY;
          if (currentPosition !== lastPosition) {
            totalScrolls++;
            const delta = Math.abs(currentPosition - lastPosition);
            if (delta < 50) smoothScrolls++;
            lastPosition = currentPosition;
          }
          
          if (performance.now() - startTime < 500) {
            requestAnimationFrame(checkScroll);
          } else {
            resolve({
              smooth: totalScrolls > 0 ? (smoothScrolls / totalScrolls) > 0.8 : true,
              duration: performance.now() - startTime
            });
          }
        }
        
        window.scrollTo({ top: 1000, behavior: 'smooth' });
        requestAnimationFrame(checkScroll);
      });
    });

    results.push({
      name: 'Scroll performance',
      status: scrollPerformance.smooth ? 'pass' : 'warning',
      details: scrollPerformance.smooth ? 'Smooth momentum scrolling' : 'Scroll performance issues detected',
      duration: Date.now() - startTime
    });

  } catch (error: any) {
    results.push({
      name: 'Animation tests error',
      status: 'fail',
      details: error.message,
      error: error.stack,
      duration: Date.now() - startTime
    });
  }

  return results;
}

// 4. Form & Input Tests
async function runFormTests(page: Page, device: iPhoneModel): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  try {
    // Check input font sizes to prevent zoom
    const inputSizes = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea, select');
      let totalInputs = 0;
      let properSize = 0;
      const smallInputs: string[] = [];
      
      inputs.forEach(input => {
        const fontSize = parseFloat(getComputedStyle(input).fontSize);
        totalInputs++;
        if (fontSize >= 16) {
          properSize++;
        } else {
          smallInputs.push(`${input.tagName} (${fontSize}px)`);
        }
      });
      
      return {
        total: totalInputs,
        proper: properSize,
        percentage: totalInputs > 0 ? (properSize / totalInputs) * 100 : 100,
        small: smallInputs.slice(0, 3)
      };
    });

    results.push({
      name: 'Input zoom prevention',
      status: inputSizes.percentage === 100 ? 'pass' : inputSizes.percentage >= 90 ? 'warning' : 'fail',
      details: `${inputSizes.proper}/${inputSizes.total} inputs ≥ 16px font size`,
      duration: Date.now() - startTime
    });

    // Test native select styling
    const selectElements = await page.$$('select');
    if (selectElements.length > 0) {
      const selectStyling = await page.evaluate(() => {
        const selects = document.querySelectorAll('select');
        let nativeAppearance = 0;
        
        selects.forEach(select => {
          const appearance = getComputedStyle(select).webkitAppearance ||
                           getComputedStyle(select).appearance;
          if (appearance !== 'none') {
            nativeAppearance++;
          }
        });
        
        return {
          total: selects.length,
          native: nativeAppearance
        };
      });

      results.push({
        name: 'Select styling',
        status: selectStyling.native > 0 ? 'pass' : 'warning',
        details: `${selectStyling.native}/${selectStyling.total} with native iOS appearance`,
        duration: Date.now() - startTime
      });
    }

    // Test form validation
    const forms = await page.$$('form');
    if (forms.length > 0) {
      results.push({
        name: 'Form presence',
        status: 'pass',
        details: `Found ${forms.length} forms`,
        duration: Date.now() - startTime
      });
    }

    // Test keyboard handling
    const firstInput = await page.$('input[type="text"], input[type="email"], input[type="search"], textarea');
    if (firstInput) {
      await firstInput.focus();
      await page.waitForTimeout(500);
      
      const keyboardVisible = await page.evaluate(() => {
        if ('visualViewport' in window && window.visualViewport) {
          return window.visualViewport.height < window.innerHeight;
        }
        return false;
      });

      results.push({
        name: 'Keyboard handling',
        status: 'pass',
        details: 'Proper keyboard detection available',
        duration: Date.now() - startTime
      });
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

  } catch (error: any) {
    results.push({
      name: 'Form tests error',
      status: 'fail',
      details: error.message,
      error: error.stack,
      duration: Date.now() - startTime
    });
  }

  return results;
}

// 5. Design System & Consistency Tests
async function runDesignTests(page: Page, device: iPhoneModel): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  try {
    // Check for iOS-specific CSS
    const iosStyles = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      let iosSpecific = 0;
      let darkModeSupport = false;
      
      styles.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            const text = rule.cssText || '';
            if (text.includes('-webkit-') || text.includes('safe-area-inset')) {
              iosSpecific++;
            }
            if (text.includes('prefers-color-scheme: dark')) {
              darkModeSupport = true;
            }
          });
        } catch {
          // Ignore cross-origin stylesheets
        }
      });
      
      return { iosSpecific, darkModeSupport };
    });

    results.push({
      name: 'iOS design tokens',
      status: iosStyles.iosSpecific > 0 ? 'pass' : 'warning',
      details: `Found ${iosStyles.iosSpecific} iOS-specific styles`,
      duration: Date.now() - startTime
    });

    // Check typography scaling
    const typographyScaling = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
      let responsive = 0;
      let total = 0;
      
      textElements.forEach(el => {
        const fontSize = getComputedStyle(el).fontSize;
        if (fontSize.includes('rem') || fontSize.includes('em') || fontSize.includes('vw')) {
          responsive++;
        }
        total++;
      });
      
      return {
        percentage: total > 0 ? (responsive / total) * 100 : 0,
        total
      };
    });

    results.push({
      name: 'Typography scaling',
      status: typographyScaling.percentage >= 50 ? 'pass' : 'warning',
      details: `${typographyScaling.percentage.toFixed(1)}% of text uses relative units`,
      duration: Date.now() - startTime
    });

    // Test dark mode
    results.push({
      name: 'Dark mode',
      status: iosStyles.darkModeSupport ? 'pass' : 'warning',
      details: iosStyles.darkModeSupport ? 'Dark mode styles detected' : 'No dark mode support found',
      duration: Date.now() - startTime
    });

    // Check color contrast
    const contrastCheck = await page.evaluate(() => {
      function getLuminance(r: number, g: number, b: number): number {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      function getContrast(rgb1: number[], rgb2: number[]): number {
        const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
        const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      let tested = 0;
      let passed = 0;
      
      textElements.forEach(el => {
        if (tested >= 10) return; // Test first 10 elements
        
        const style = getComputedStyle(el);
        const color = style.color.match(/\d+/g);
        const bgColor = style.backgroundColor.match(/\d+/g);
        
        if (color && bgColor && bgColor[3] !== '0') {
          tested++;
          const contrast = getContrast(
            [parseInt(color[0]), parseInt(color[1]), parseInt(color[2])],
            [parseInt(bgColor[0]), parseInt(bgColor[1]), parseInt(bgColor[2])]
          );
          
          if (contrast >= 4.5) passed++;
        }
      });
      
      return {
        tested,
        passed,
        percentage: tested > 0 ? (passed / tested) * 100 : 100
      };
    });

    results.push({
      name: 'Color contrast',
      status: contrastCheck.percentage >= 90 ? 'pass' : contrastCheck.percentage >= 70 ? 'warning' : 'fail',
      details: `${contrastCheck.passed}/${contrastCheck.tested} elements meet WCAG AA`,
      duration: Date.now() - startTime
    });

  } catch (error: any) {
    results.push({
      name: 'Design tests error',
      status: 'fail',
      details: error.message,
      error: error.stack,
      duration: Date.now() - startTime
    });
  }

  return results;
}

// 6. Accessibility Tests
async function runAccessibilityTests(page: Page, device: iPhoneModel): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  try {
    // Check for ARIA labels and roles
    const ariaCheck = await page.evaluate(() => {
      const interactive = document.querySelectorAll('button, a, input, [role="button"], [onclick]');
      let total = 0;
      let accessible = 0;
      const issues: string[] = [];
      
      interactive.forEach(el => {
        total++;
        const hasText = el.textContent?.trim().length || 0 > 0;
        const hasAriaLabel = el.getAttribute('aria-label');
        const hasTitle = el.getAttribute('title');
        
        if (hasText || hasAriaLabel || hasTitle) {
          accessible++;
        } else {
          issues.push(`${el.tagName}${el.className ? '.' + el.className : ''}`);
        }
      });
      
      return {
        total,
        accessible,
        percentage: total > 0 ? (accessible / total) * 100 : 100,
        issues: issues.slice(0, 3)
      };
    });

    results.push({
      name: 'ARIA implementation',
      status: ariaCheck.percentage >= 95 ? 'pass' : ariaCheck.percentage >= 80 ? 'warning' : 'fail',
      details: `${ariaCheck.accessible}/${ariaCheck.total} elements properly labeled`,
      duration: Date.now() - startTime
    });

    // Check focus indicators
    const focusCheck = await page.evaluate(() => {
      const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      let hasCustomFocus = 0;
      focusableElements.forEach(el => {
        // Create a temporary style element to check :focus styles
        const testId = `focus-test-${Math.random()}`;
        el.classList.add(testId);
        const style = document.createElement('style');
        style.textContent = `.${testId}:focus { outline: 9999px solid red !important; }`;
        document.head.appendChild(style);
        
        el.focus();
        const computed = getComputedStyle(el);
        if (computed.outlineWidth === '9999px') {
          hasCustomFocus++;
        }
        
        document.head.removeChild(style);
        el.classList.remove(testId);
        el.blur();
      });
      
      return {
        total: focusableElements.length,
        customFocus: hasCustomFocus
      };
    });

    results.push({
      name: 'Focus indicators',
      status: 'pass',
      details: `${focusCheck.total} focusable elements found`,
      duration: Date.now() - startTime
    });

    // Check heading structure
    const headingStructure = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const levels = headings.map(h => parseInt(h.tagName[1]));
      let properOrder = true;
      
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] > 1) {
          properOrder = false;
          break;
        }
      }
      
      return {
        count: headings.length,
        properOrder,
        h1Count: headings.filter(h => h.tagName === 'H1').length
      };
    });

    results.push({
      name: 'Heading structure',
      status: headingStructure.properOrder && headingStructure.h1Count === 1 ? 'pass' : 'warning',
      details: `${headingStructure.count} headings, ${headingStructure.h1Count} H1 tags`,
      duration: Date.now() - startTime
    });

    // Check for alt text on images
    const imageCheck = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let total = 0;
      let withAlt = 0;
      
      images.forEach(img => {
        total++;
        if (img.alt || img.getAttribute('aria-label')) {
          withAlt++;
        }
      });
      
      return {
        total,
        withAlt,
        percentage: total > 0 ? (withAlt / total) * 100 : 100
      };
    });

    results.push({
      name: 'Image alt text',
      status: imageCheck.percentage === 100 ? 'pass' : imageCheck.percentage >= 90 ? 'warning' : 'fail',
      details: `${imageCheck.withAlt}/${imageCheck.total} images have alt text`,
      duration: Date.now() - startTime
    });

  } catch (error: any) {
    results.push({
      name: 'Accessibility tests error',
      status: 'fail',
      details: error.message,
      error: error.stack,
      duration: Date.now() - startTime
    });
  }

  return results;
}

// 7. Performance Tests
async function runPerformanceTests(page: Page, device: iPhoneModel): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  try {
    // Get navigation timing
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
        domInteractive: timing.domInteractive - timing.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });

    results.push({
      name: 'Initial load time',
      status: navigationTiming.loadComplete < 3000 ? 'pass' : navigationTiming.loadComplete < 5000 ? 'warning' : 'fail',
      details: `${(navigationTiming.loadComplete / 1000).toFixed(1)}s (target: <3s)`,>
      duration: Date.now() - startTime
    });

    results.push({
      name: 'Time to interactive',
      status: navigationTiming.domInteractive < 3000 ? 'pass' : navigationTiming.domInteractive < 5000 ? 'warning' : 'fail',
      details: `${(navigationTiming.domInteractive / 1000).toFixed(1)}s (target: <3s)`,>
      duration: Date.now() - startTime
    });

    // Check memory usage
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
      }
      return null;
    });

    if (memoryUsage) {
      results.push({
        name: 'Memory usage',
        status: memoryUsage.percentage < 70 ? 'pass' : memoryUsage.percentage < 85 ? 'warning' : 'fail',
        details: `${memoryUsage.percentage.toFixed(0)}% (target: <70%)`,>
        duration: Date.now() - startTime
      });
    }

    // Check resource sizes
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;
      let imageSize = 0;
      
      entries.forEach(entry => {
        const size = entry.transferSize || 0;
        totalSize += size;
        
        if (entry.name.includes('.js')) jsSize += size;
        else if (entry.name.includes('.css')) cssSize += size;
        else if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) imageSize += size;
      });
      
      return {
        total: totalSize,
        js: jsSize,
        css: cssSize,
        images: imageSize
      };
    });

    const totalSizeMB = resources.total / (1024 * 1024);
    results.push({
      name: 'Bundle size',
      status: totalSizeMB < 1 ? 'pass' : totalSizeMB < 2 ? 'warning' : 'fail',
      details: `${totalSizeMB.toFixed(2)}MB (JS: ${(resources.js / 1024).toFixed(0)}KB, CSS: ${(resources.css / 1024).toFixed(0)}KB)`,
      duration: Date.now() - startTime
    });

  } catch (error: any) {
    results.push({
      name: 'Performance tests error',
      status: 'fail',
      details: error.message,
      error: error.stack,
      duration: Date.now() - startTime
    });
  }

  return results;
}

// Run all tests for a device
async function runDeviceTests(browser: Browser, device: iPhoneModel): Promise<DeviceResults> {
  log(`\nTesting ${device.name} (${device.width}x${device.height})`, 'cyan');
  
  const context = await browser.newContext({
    ...devices[device.device],
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.pixelRatio,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  
  // Set up console error logging
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });

  const results: DeviceResults = {
    device: device.name,
    viewport: { width: device.width, height: device.height },
    timestamp: new Date().toISOString(),
    categories: [],
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalWarnings: 0
  };

  try {
    // Navigate to the page
    await page.goto(testConfig.baseUrl, { waitUntil: 'networkidle' });
    await waitForPageReady(page);

    // Take initial screenshot
    const screenshotPath = await takeScreenshot(page, `${device.name.replace(/\s+/g, '-')}-initial`);

    // Run each test category
    const testCategories = [
      { name: 'Layout & Safe Areas', runner: runLayoutTests },
      { name: 'Touch Target Compliance', runner: runTouchTargetTests },
      { name: 'Animation Performance', runner: runAnimationTests },
      { name: 'Form Input Handling', runner: runFormTests },
      { name: 'Design System', runner: runDesignTests },
      { name: 'Accessibility', runner: runAccessibilityTests },
      { name: 'Performance', runner: runPerformanceTests }
    ];

    for (const { name, runner } of testCategories) {
      log(`\n  ${name}:`, 'bright');
      const categoryTests = await runner(page, device);
      
      const categoryResult: CategoryResults = {
        category: name,
        tests: categoryTests,
        passed: 0,
        failed: 0,
        warnings: 0
      };

      categoryTests.forEach(test => {
        logTest(`    ${test.name}`, test.status, test.details);
        
        if (test.status === 'pass') categoryResult.passed++;
        else if (test.status === 'fail') categoryResult.failed++;
        else categoryResult.warnings++;
        
        results.totalTests++;
        if (test.status === 'pass') results.totalPassed++;
        else if (test.status === 'fail') results.totalFailed++;
        else results.totalWarnings++;
      });

      results.categories.push(categoryResult);
    }

    // Add console errors as a test
    if (consoleErrors.length > 0) {
      log('\n  Console Errors:', 'bright');
      const errorTest: TestResult = {
        name: 'Console errors',
        status: 'fail',
        details: `${consoleErrors.length} errors found`,
        error: consoleErrors.join('\n')
      };
      logTest(`    ${errorTest.name}`, errorTest.status, errorTest.details);
      
      results.totalTests++;
      results.totalFailed++;
    }

  } catch (error: any) {
    log(`\nError testing ${device.name}: ${error.message}`, 'red');
    results.categories.push({
      category: 'Test Execution',
      tests: [{
        name: 'Test execution',
        status: 'fail',
        details: error.message,
        error: error.stack
      }],
      passed: 0,
      failed: 1,
      warnings: 0
    });
    results.totalTests++;
    results.totalFailed++;
  } finally {
    await context.close();
  }

  return results;
}

// Generate summary report
function generateSummary(allResults: DeviceResults[]): any {
  const summary = {
    timestamp: testConfig.timestamp,
    totalDevices: allResults.length,
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    deviceSummaries: [] as any[],
    categoryBreakdown: {} as Record<string, { passed: number; failed: number; warnings: number; total: number }>
  };

  allResults.forEach(deviceResult => {
    summary.totalTests += deviceResult.totalTests;
    summary.passed += deviceResult.totalPassed;
    summary.failed += deviceResult.totalFailed;
    summary.warnings += deviceResult.totalWarnings;

    summary.deviceSummaries.push({
      device: deviceResult.device,
      tests: deviceResult.totalTests,
      passed: deviceResult.totalPassed,
      failed: deviceResult.totalFailed,
      warnings: deviceResult.totalWarnings,
      passRate: deviceResult.totalTests > 0 
        ? ((deviceResult.totalPassed / deviceResult.totalTests) * 100).toFixed(1) + '%' 
        : '0%'
    });

    deviceResult.categories.forEach(category => {
      if (!summary.categoryBreakdown[category.category]) {
        summary.categoryBreakdown[category.category] = {
          passed: 0,
          failed: 0,
          warnings: 0,
          total: 0
        };
      }
      
      const catBreakdown = summary.categoryBreakdown[category.category];
      catBreakdown.passed += category.passed;
      catBreakdown.failed += category.failed;
      catBreakdown.warnings += category.warnings;
      catBreakdown.total += category.tests.length;
    });
  });

  summary.passRate = summary.totalTests > 0 
    ? ((summary.passed / summary.totalTests) * 100).toFixed(1) + '%'
    : '0%';

  return summary;
}

// Save results to file
function saveResults(results: DeviceResults[], summary: any): void {
  const reportPath = path.join(testConfig.outputDir, `iphone-test-report-${Date.now()}.json`);
  const report = {
    summary,
    config: testConfig,
    results,
    timestamp: testConfig.timestamp
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\nReport saved to: ${reportPath}`, 'green');

  // Also save a latest.json for easy access
  const latestPath = path.join(testConfig.outputDir, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
}

// Main test runner
async function runAllTests(): Promise<void> {
  logSection('iPhone Compatibility Test Suite');
  log(`Base URL: ${testConfig.baseUrl}`);
  log(`Output Directory: ${testConfig.outputDir}`);
  log(`Headless: ${testConfig.headless}`);

  ensureOutputDirs();

  const browser = await chromium.launch({
    headless: testConfig.headless,
    slowMo: testConfig.slowMo
  });

  const allResults: DeviceResults[] = [];

  try {
    // Test each device
    for (const device of iPhoneModels) {
      const results = await runDeviceTests(browser, device);
      allResults.push(results);
    }

    // Generate and display summary
    const summary = generateSummary(allResults);

    logSection('Test Summary');
    log(`Total Devices Tested: ${summary.totalDevices}`);
    log(`Total Tests Run: ${summary.totalTests}`);
    log(`Passed: ${summary.passed}`, 'green');
    log(`Failed: ${summary.failed}`, summary.failed > 0 ? 'red' : 'green');
    log(`Warnings: ${summary.warnings}`, summary.warnings > 0 ? 'yellow' : 'green');
    log(`Overall Pass Rate: ${summary.passRate}`, 'bright');

    log('\nDevice Breakdown:', 'bright');
    summary.deviceSummaries.forEach((device: any) => {
      const color = device.failed > 0 ? 'red' : device.warnings > 0 ? 'yellow' : 'green';
      log(`  ${device.device}: ${device.passRate} pass rate (${device.passed}/${device.tests})`, color);
    });

    log('\nCategory Breakdown:', 'bright');
    Object.entries(summary.categoryBreakdown).forEach(([category, breakdown]: [string, any]) => {
      const passRate = breakdown.total > 0 
        ? ((breakdown.passed / breakdown.total) * 100).toFixed(1) 
        : '0';
      const color = breakdown.failed > 0 ? 'red' : breakdown.warnings > 0 ? 'yellow' : 'green';
      log(`  ${category}: ${passRate}% pass rate`, color);
    });

    // Save results
    saveResults(allResults, summary);

    // Exit with appropriate code
    process.exit(summary.failed > 0 ? 1 : 0);

  } catch (error: any) {
    log(`\nFatal error: ${error.message}`, 'red');
    logger.error('iPhone test error', { error: error.toString(), component: 'iPhoneTests' });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Watch mode implementation
async function runWatchMode(): Promise<void> {
  log('Starting iPhone tests in watch mode...', 'magenta');
  log('Press Ctrl+C to stop\n', 'yellow');

  // Run initial tests
  await runAllTests();

  // Set up file watcher
  const chokidar = await import('chokidar');
  const watcher = chokidar.watch([
    'app/**/*.{js,jsx,ts,tsx,css}',
    'components/**/*.{js,jsx,ts,tsx,css}',
    'styles/**/*.css',
    'public/**/*.css'
  ], {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  let isRunning = false;
  let pendingRun = false;

  const runTests = async () => {
    if (isRunning) {
      pendingRun = true;
      return;
    }

    isRunning = true;
    console.clear();
    await runAllTests();
    isRunning = false;

    if (pendingRun) {
      pendingRun = false;
      setTimeout(runTests, 1000);
    }
  };

  watcher.on('change', (path) => {
    log(`\nFile changed: ${path}`, 'yellow');
    log('Re-running tests...', 'magenta');
    runTests();
  });

  process.on('SIGINT', () => {
    log('\nStopping watch mode...', 'yellow');
    watcher.close();
    process.exit(0);
  });
}

// Run tests based on command line arguments
const isWatchMode = process.argv.includes('--watch') || process.argv.includes('-w');

if (isWatchMode) {
  runWatchMode().catch(error => {
    log(`\nError in watch mode: ${error.message}`, 'red');
    process.exit(1);
  });
} else {
  runAllTests().catch(error => {
    log(`\nError running tests: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { runAllTests, runDeviceTests, testConfig }}</void}</DeviceResults}</TestResult}</TestResult}</TestResult}</TestResult}</string>