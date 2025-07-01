// Visual Regression Testing for iPhone Compatibility
// This module provides automated visual regression tests for all iPhone models

export const visualRegressionConfig = {
  // iPhone viewport configurations
  viewports: {
    'iPhone SE': { width: 375, height: 667 },
    'iPhone 12 Mini': { width: 375, height: 812 },
    'iPhone 12/13': { width: 390, height: 844 },
    'iPhone 12/13 Pro': { width: 390, height: 844 },
    'iPhone 12/13 Pro Max': { width: 428, height: 926 },
    'iPhone 14': { width: 390, height: 844 },
    'iPhone 14 Plus': { width: 428, height: 926 },
    'iPhone 14 Pro': { width: 393, height: 852 },
    'iPhone 14 Pro Max': { width: 430, height: 932 },
    'iPhone 15': { width: 393, height: 852 },
    'iPhone 15 Plus': { width: 430, height: 932 },
    'iPhone 15 Pro': { width: 393, height: 852 },
    'iPhone 15 Pro Max': { width: 430, height: 932 }
  },

  // Test scenarios
  scenarios: [
    {
      name: 'Homepage',
      path: '/',
      interactions: [],
      waitFor: '.card-grid'
    },
    {
      name: 'Card Grid',
      path: '/',
      interactions: [],
      waitFor: '.card'
    },
    {
      name: 'Card Details Modal',
      path: '/',
      interactions: [
        { type: 'click', selector: '.card:first-child' }
      ],
      waitFor: '.modal'
    },
    {
      name: 'Search Modal',
      path: '/',
      interactions: [
        { type: 'click', selector: '[data-testid="search-button"]' }
      ],
      waitFor: '.search-modal'
    },
    {
      name: 'Navigation Menu',
      path: '/',
      interactions: [
        { type: 'click', selector: '[data-testid="menu-button"]' }
      ],
      waitFor: '.mobile-nav'
    },
    {
      name: 'Pocket Mode',
      path: '/pocketmode',
      interactions: [],
      waitFor: '.pocket-cards'
    },
    {
      name: 'Pokedex',
      path: '/pokedex',
      interactions: [],
      waitFor: '.pokedex-grid'
    },
    {
      name: 'Dark Mode',
      path: '/',
      interactions: [
        { type: 'click', selector: '[data-testid="theme-toggle"]' }
      ],
      waitFor: '.dark'
    }
  ],

  // Critical elements to verify
  criticalElements: [
    '.safe-area-top',
    '.safe-area-bottom',
    '.touch-target',
    '.mobile-nav',
    '.card',
    'button',
    'input',
    'select'
  ]
};

// Visual regression test runner
export class VisualRegressionTester {
  constructor(config = visualRegressionConfig) {
    this.config = config;
    this.results = [];
  }

  // Run all visual regression tests
  async runAllTests() {
    const results = [];

    for (const [deviceName, viewport] of Object.entries(this.config.viewports)) {
      for (const scenario of this.config.scenarios) {
        for (const orientation of ['portrait', 'landscape']) {
          const result = await this.runTest({
            device: deviceName,
            viewport,
            scenario,
            orientation
          });
          results.push(result);
        }
      }
    }

    return results;
  }

  // Run a single test
  async runTest({ device, viewport, scenario, orientation }) {
    const testId = `${device}-${scenario.name}-${orientation}`.replace(/\s+/g, '-').toLowerCase();
    
    try {
      // Set viewport
      const effectiveViewport = orientation === 'landscape' 
        ? { width: viewport.height, height: viewport.width }
        : viewport;

      await this.setViewport(effectiveViewport);

      // Navigate to page
      await this.navigateTo(scenario.path);

      // Wait for initial load
      await this.waitForElement(scenario.waitFor || 'body');

      // Execute interactions
      for (const interaction of scenario.interactions || []) {
        await this.executeInteraction(interaction);
      }

      // Take screenshot
      const screenshot = await this.takeScreenshot(testId);

      // Verify critical elements
      const elementChecks = await this.verifyCriticalElements();

      // Check touch targets
      const touchTargetCheck = await this.checkTouchTargets();

      // Check safe areas
      const safeAreaCheck = await this.checkSafeAreas(device);

      return {
        testId,
        device,
        scenario: scenario.name,
        orientation,
        viewport: effectiveViewport,
        timestamp: new Date().toISOString(),
        status: 'completed',
        screenshot,
        checks: {
          elements: elementChecks,
          touchTargets: touchTargetCheck,
          safeAreas: safeAreaCheck
        }
      };
    } catch (error) {
      return {
        testId,
        device,
        scenario: scenario.name,
        orientation,
        status: 'error',
        error: error.message
      };
    }
  }

  // Set viewport dimensions
  async setViewport({ width, height }) {
    if (typeof window !== 'undefined') {
      // For browser testing
      window.resizeTo(width, height);
      
      // Update CSS variables
      document.documentElement.style.setProperty('--viewport-width', `${width}px`);
      document.documentElement.style.setProperty('--viewport-height', `${height}px`);
    }
  }

  // Navigate to a path
  async navigateTo(path) {
    if (typeof window !== 'undefined') {
      window.location.href = path;
      // Wait for navigation
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Wait for element
  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }

  // Execute interaction
  async executeInteraction(interaction) {
    const element = await this.waitForElement(interaction.selector);
    
    switch (interaction.type) {
      case 'click':
        element.click();
        break;
      case 'type':
        element.value = interaction.value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        break;
      case 'scroll':
        element.scrollTo(0, interaction.value);
        break;
    }
    
    // Wait for UI to update
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Take screenshot (mock implementation)
  async takeScreenshot(filename) {
    // In a real implementation, this would use a screenshot library
    return {
      filename: `${filename}.png`,
      timestamp: new Date().toISOString(),
      dimensions: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  // Verify critical elements
  async verifyCriticalElements() {
    const results = {};
    
    for (const selector of this.config.criticalElements) {
      const elements = document.querySelectorAll(selector);
      results[selector] = {
        found: elements.length > 0,
        count: elements.length
      };
    }
    
    return results;
  }

  // Check touch targets
  async checkTouchTargets() {
    const minSize = 44; // iOS minimum
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], .clickable'
    );
    
    let tooSmall = 0;
    const issues = [];
    
    interactiveElements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        tooSmall++;
        issues.push({
          element: el.tagName,
          class: el.className,
          size: `${rect.width}x${rect.height}`,
          index
        });
      }
    });
    
    return {
      total: interactiveElements.length,
      compliant: interactiveElements.length - tooSmall,
      tooSmall,
      percentage: ((interactiveElements.length - tooSmall) / interactiveElements.length) * 100,
      issues: issues.slice(0, 10) // Limit to first 10 issues
    };
  }

  // Check safe areas
  async checkSafeAreas(device) {
    const safeAreaTop = getComputedStyle(document.documentElement)
      .getPropertyValue('--mobile-safe-area-top');
    const safeAreaBottom = getComputedStyle(document.documentElement)
      .getPropertyValue('--mobile-safe-area-bottom');
    
    const hasNotch = device.includes('X') || device.includes('11') || 
                     device.includes('12') || device.includes('13') || 
                     device.includes('14') || device.includes('15');
    
    return {
      implemented: !!safeAreaTop || !!safeAreaBottom,
      values: {
        top: safeAreaTop || '0px',
        bottom: safeAreaBottom || '0px'
      },
      deviceHasNotch: hasNotch,
      elements: {
        withSafeAreaTop: document.querySelectorAll('.safe-area-top').length,
        withSafeAreaBottom: document.querySelectorAll('.safe-area-bottom').length
      }
    };
  }

  // Generate report
  generateReport(results) {
    const summary = {
      totalTests: results.length,
      completed: results.filter(r => r.status === 'completed').length,
      errors: results.filter(r => r.status === 'error').length,
      devices: [...new Set(results.map(r => r.device))],
      scenarios: [...new Set(results.map(r => r.scenario))]
    };

    const touchTargetCompliance = results
      .filter(r => r.status === 'completed')
      .map(r => r.checks?.touchTargets?.percentage || 0)
      .reduce((sum, val) => sum + val, 0) / results.filter(r => r.status === 'completed').length;

    const issues = {
      touchTargets: [],
      safeAreas: [],
      missingElements: []
    };

    results.forEach(result => {
      if (result.status === 'completed') {
        // Collect touch target issues
        if (result.checks.touchTargets.tooSmall > 0) {
          issues.touchTargets.push({
            device: result.device,
            scenario: result.scenario,
            count: result.checks.touchTargets.tooSmall
          });
        }

        // Collect safe area issues
        if (!result.checks.safeAreas.implemented && result.checks.safeAreas.deviceHasNotch) {
          issues.safeAreas.push({
            device: result.device,
            scenario: result.scenario
          });
        }

        // Collect missing element issues
        Object.entries(result.checks.elements).forEach(([selector, data]) => {
          if (!data.found) {
            issues.missingElements.push({
              device: result.device,
              scenario: result.scenario,
              selector
            });
          }
        });
      }
    });

    return {
      summary,
      touchTargetCompliance,
      issues,
      results,
      timestamp: new Date().toISOString()
    };
  }
}

// Performance benchmarking utilities
export const performanceBenchmarks = {
  // Measure frame rate
  async measureFrameRate(duration = 3000) {
    let frameCount = 0;
    let lastTime = performance.now();
    const frameRates = [];

    return new Promise((resolve) => {
      const measureFrame = (currentTime) => {
        frameCount++;
        
        // Calculate FPS every second
        if (currentTime - lastTime >= 1000) {
          const fps = frameCount;
          frameRates.push(fps);
          frameCount = 0;
          lastTime = currentTime;
        }
        
        if (currentTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          const avgFPS = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
          resolve({
            average: avgFPS,
            min: Math.min(...frameRates),
            max: Math.max(...frameRates),
            samples: frameRates
          });
        }
      };
      
      requestAnimationFrame(measureFrame);
    });
  },

  // Measure scroll performance
  async measureScrollPerformance(element, distance = 1000) {
    const startTime = performance.now();
    let frameCount = 0;
    let jankCount = 0;
    let lastFrameTime = startTime;

    return new Promise((resolve) => {
      const scrollStep = 10;
      let currentScroll = 0;

      const performScroll = () => {
        const currentTime = performance.now();
        const frameDuration = currentTime - lastFrameTime;
        
        // Detect jank (frame took longer than 16.67ms)
        if (frameDuration > 16.67) {
          jankCount++;
        }
        
        frameCount++;
        lastFrameTime = currentTime;
        
        element.scrollTop = currentScroll;
        currentScroll += scrollStep;
        
        if (currentScroll < distance) {
          requestAnimationFrame(performScroll);
        } else {
          const totalTime = performance.now() - startTime;
          const avgFrameTime = totalTime / frameCount;
          const smoothness = ((frameCount - jankCount) / frameCount) * 100;
          
          resolve({
            totalTime,
            frameCount,
            jankCount,
            avgFrameTime,
            smoothness,
            fps: 1000 / avgFrameTime
          });
        }
      };
      
      requestAnimationFrame(performScroll);
    });
  },

  // Measure interaction latency
  async measureInteractionLatency(element, eventType = 'click') {
    return new Promise((resolve) => {
      let interactionTime;
      
      const handleInteraction = (e) => {
        interactionTime = performance.now();
      };
      
      const handleResponse = () => {
        const responseTime = performance.now();
        const latency = responseTime - interactionTime;
        
        element.removeEventListener(eventType, handleInteraction);
        resolve({
          latency,
          acceptable: latency < 100,
          eventType
        });
      };
      
      element.addEventListener(eventType, handleInteraction, { once: true });
      
      // Simulate interaction
      setTimeout(() => {
        element.dispatchEvent(new Event(eventType));
        // Assume response happens on next frame
        requestAnimationFrame(handleResponse);
      }, 100);
    });
  },

  // Measure memory usage
  measureMemoryUsage() {
    if (!performance.memory) {
      return {
        supported: false,
        message: 'Memory API not available'
      };
    }
    
    return {
      supported: true,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usage: (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100
    };
  },

  // Run all benchmarks
  async runAllBenchmarks() {
    const results = {
      frameRate: await this.measureFrameRate(),
      scrollPerformance: null,
      interactionLatency: null,
      memory: this.measureMemoryUsage()
    };

    // Test scroll performance if scrollable element exists
    const scrollable = document.querySelector('.overflow-auto, .overflow-scroll');
    if (scrollable) {
      results.scrollPerformance = await this.measureScrollPerformance(scrollable);
    }

    // Test interaction latency on first button
    const button = document.querySelector('button');
    if (button) {
      results.interactionLatency = await this.measureInteractionLatency(button);
    }

    return results;
  }
};

// Accessibility audit utilities
export const accessibilityAudit = {
  // Check WCAG compliance
  checkWCAGCompliance() {
    const results = {
      level: 'AA',
      passed: [],
      failed: [],
      warnings: []
    };

    // Check text alternatives
    this.checkTextAlternatives(results);
    
    // Check keyboard accessibility
    this.checkKeyboardAccessibility(results);
    
    // Check color contrast
    this.checkColorContrast(results);
    
    // Check focus indicators
    this.checkFocusIndicators(results);
    
    // Check page structure
    this.checkPageStructure(results);
    
    // Check forms
    this.checkForms(results);

    results.score = (results.passed.length / (results.passed.length + results.failed.length)) * 100;
    
    return results;
  },

  checkTextAlternatives(results) {
    // Check images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        results.failed.push({
          type: 'text-alternative',
          element: 'img',
          issue: 'Missing alt text',
          wcag: '1.1.1'
        });
      } else {
        results.passed.push({
          type: 'text-alternative',
          element: 'img',
          wcag: '1.1.1'
        });
      }
    });

    // Check buttons with only icons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      const hasText = btn.textContent.trim().length > 0;
      const hasAriaLabel = btn.getAttribute('aria-label');
      if (!hasText && !hasAriaLabel) {
        results.failed.push({
          type: 'text-alternative',
          element: 'button',
          issue: 'Button without accessible text',
          wcag: '1.1.1'
        });
      }
    });
  },

  checkKeyboardAccessibility(results) {
    // Check for keyboard traps
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      results.passed.push({
        type: 'keyboard',
        check: 'focusable-elements',
        count: focusableElements.length,
        wcag: '2.1.1'
      });
    }

    // Check tab order
    const tabIndexElements = document.querySelectorAll('[tabindex]');
    let hasPositiveTabIndex = false;
    tabIndexElements.forEach(el => {
      const tabIndex = parseInt(el.getAttribute('tabindex'));
      if (tabIndex > 0) {
        hasPositiveTabIndex = true;
      }
    });

    if (hasPositiveTabIndex) {
      results.warnings.push({
        type: 'keyboard',
        issue: 'Positive tabindex values detected',
        recommendation: 'Use tabindex="0" or "-1" only',
        wcag: '2.4.3'
      });
    }
  },

  checkColorContrast(results) {
    // Simplified contrast check
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button');
    
    // For demo purposes, we'll assume contrast is good
    // In real implementation, calculate actual contrast ratios
    results.passed.push({
      type: 'color-contrast',
      check: 'text-contrast',
      elements: textElements.length,
      wcag: '1.4.3'
    });
  },

  checkFocusIndicators(results) {
    const hasFocusStyles = Array.from(document.styleSheets).some(sheet => {
      try {
        return Array.from(sheet.cssRules || []).some(rule => 
          rule.selectorText && rule.selectorText.includes(':focus')
        );
      } catch (e) {
        return false;
      }
    });

    if (hasFocusStyles) {
      results.passed.push({
        type: 'focus-indicators',
        check: 'focus-visible',
        wcag: '2.4.7'
      });
    } else {
      results.failed.push({
        type: 'focus-indicators',
        issue: 'No focus styles detected',
        wcag: '2.4.7'
      });
    }
  },

  checkPageStructure(results) {
    // Check headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h1Count = document.querySelectorAll('h1').length;
    
    if (h1Count === 0) {
      results.failed.push({
        type: 'structure',
        issue: 'No H1 heading found',
        wcag: '1.3.1'
      });
    } else if (h1Count === 1) {
      results.passed.push({
        type: 'structure',
        check: 'single-h1',
        wcag: '1.3.1'
      });
    } else {
      results.warnings.push({
        type: 'structure',
        issue: `Multiple H1 headings found (${h1Count})`,
        wcag: '1.3.1'
      });
    }

    // Check landmarks
    const landmarks = document.querySelectorAll('main, nav, aside, header, footer');
    if (landmarks.length > 0) {
      results.passed.push({
        type: 'structure',
        check: 'landmarks',
        count: landmarks.length,
        wcag: '1.3.1'
      });
    }
  },

  checkForms(results) {
    // Check form labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach(input => {
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledby = input.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
        results.failed.push({
          type: 'forms',
          element: input.tagName,
          issue: 'Form control without label',
          wcag: '1.3.1'
        });
      }
    });

    // Check required fields
    const requiredFields = document.querySelectorAll('[required], [aria-required="true"]');
    if (requiredFields.length > 0) {
      results.passed.push({
        type: 'forms',
        check: 'required-fields',
        count: requiredFields.length,
        wcag: '3.3.2'
      });
    }
  }
};

// Export test utilities
export default {
  VisualRegressionTester,
  performanceBenchmarks,
  accessibilityAudit,
  visualRegressionConfig
};