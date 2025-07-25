import { test as base, expect as baseExpected } from '@playwright/test';
import { ConsoleLogger } from '../helpers/console-logger';
import { ApiMocker } from '../helpers/api-mock';
import { WaitStrategies } from '../helpers/wait-strategies';

// Define custom fixtures
type TestFixtures = {
  consoleLogger: ConsoleLogger;
  apiMocker: ApiMocker;
  waitStrategies: WaitStrategies;
  autoAttachConsoleLogger: void;
  autoMockAPIs: void;
};

// Extend the base test with our custom fixtures
export const test = base.extend<TestFixtures>({
  // Console logger fixture
  consoleLogger: async ({}, use) => {
    const logger = new ConsoleLogger();
    await use(logger);
  },

  // API mocker fixture
  apiMocker: async ({ page }, use) => {
    const mocker = new ApiMocker(page);
    await use(mocker);
  },

  // Wait strategies fixture
  waitStrategies: async ({ page }, use) => {
    const strategies = new WaitStrategies(page);
    await use(strategies);
  },

  // Auto-attach console logger to all pages
  autoAttachConsoleLogger: [async ({ page, consoleLogger }, use) => {
    // Attach logger to the default page
    await consoleLogger.attachToPage(page);
    
    // Also attach to any new pages created during the test
    page.context().on('page', async (newPage) => {
      await consoleLogger.attachToPage(newPage);
    });

    await use();

    // After test, check for console errors by default
    // This can be overridden in individual tests if needed
    if (process.env.ASSERT_NO_CONSOLE_ERRORS !== 'false') {
      // Filter out common, non-critical errors
      const errors = consoleLogger.getErrors();
      const criticalErrors = errors.filter(error => {
        // Ignore favicon 404 errors
        if (error.text.includes('favicon.ico') && error.text.includes('404')) {
          return false;
        }
        // Ignore HMR (Hot Module Replacement) errors
        if (error.text.includes('[HMR]')) {
          return false;
        }
        // Ignore Supabase 404 errors (tables might not exist)
        if (error.text.includes('supabase.co') && error.text.includes('404')) {
          return false;
        }
        // Ignore expected resource loading errors during development
        if (error.text.includes('Failed to load resource') && error.text.includes('404')) {
          return false;
        }
        // Ignore service worker registration errors
        if (error.text.includes('Service worker registration failed')) {
          return false;
        }
        // Ignore service worker script errors
        if (error.text.includes('sw.js') && error.text.includes('404')) {
          return false;
        }
        return true;
      });
      
      if (criticalErrors.length > 0) {
        // Log the full console report before throwing
        console.log('\n' + consoleLogger.getReport());
        const errorMessages = criticalErrors.map(err => 
          `[${err.timestamp.toISOString()}] ${err.text}${err.location ? ` at ${err.location.url}:${err.location.lineNumber}` : ''}`
        ).join('\n');
        throw new Error(`Found ${criticalErrors.length} critical console errors:\n${errorMessages}`);
      }
    }
  }, { auto: true }], // auto: true means this runs for every test automatically

  // Auto-mock APIs for all tests
  autoMockAPIs: [async ({ apiMocker }, use) => {
    // Enable API mocking by default to prevent hitting real APIs during tests
    await apiMocker.mockAllAPIs();
    console.log('[TEST] API mocking enabled - all external API calls will be intercepted');
    
    await use();
    
    // Optional: Allow real APIs to be restored after test if needed
    // Tests can call apiMocker.allowRealAPIs() if they specifically need real API access
  }, { auto: true }], // auto: true means this runs for every test automatically
});

// Export expect with custom matchers
export const expect = baseExpected.extend({
  // Custom matcher to check console messages
  toHaveConsoleMessage(consoleLogger: ConsoleLogger, expectedMessage: string | RegExp) {
    const messages = consoleLogger.getAllMessages();
    const found = messages.some(msg => {
      if (typeof expectedMessage === 'string') {
        return msg.text.includes(expectedMessage);
      } else {
        return expectedMessage.test(msg.text);
      }
    });

    return {
      pass: found,
      message: () => {
        if (found) {
          return `Expected console not to have message matching ${expectedMessage}`;
        } else {
          const allMessages = messages.map(m => m.text).join('\n');
          return `Expected console to have message matching ${expectedMessage}\nActual messages:\n${allMessages}`;
        }
      },
    };
  },

  // Custom matcher to check for no console errors
  toHaveNoConsoleErrors(consoleLogger: ConsoleLogger) {
    const errors = consoleLogger.getErrors();
    const pass = errors.length === 0;

    return {
      pass,
      message: () => {
        if (pass) {
          return 'Expected console to have errors';
        } else {
          const errorMessages = errors.map(err => err.text).join('\n');
          return `Expected no console errors, but found ${errors.length}:\n${errorMessages}`;
        }
      },
    };
  },

  // Custom matcher to check for no console warnings
  toHaveNoConsoleWarnings(consoleLogger: ConsoleLogger) {
    const warnings = consoleLogger.getWarnings();
    const pass = warnings.length === 0;

    return {
      pass,
      message: () => {
        if (pass) {
          return 'Expected console to have warnings';
        } else {
          const warningMessages = warnings.map(warn => warn.text).join('\n');
          return `Expected no console warnings, but found ${warnings.length}:\n${warningMessages}`;
        }
      },
    };
  },

  // Custom matcher to check console message count
  toHaveConsoleMessageCount(consoleLogger: ConsoleLogger, expectedCount: number, type?: 'log' | 'info' | 'warn' | 'error' | 'debug') {
    const actualCount = type ? consoleLogger.getMessageCount(type) : consoleLogger.getMessageCount();
    const pass = actualCount === expectedCount;

    return {
      pass,
      message: () => {
        const typeStr = type ? ` ${type}` : '';
        if (pass) {
          return `Expected console not to have ${expectedCount}${typeStr} messages`;
        } else {
          return `Expected console to have ${expectedCount}${typeStr} messages, but found ${actualCount}`;
        }
      },
    };
  },
});

// Type extensions for TypeScript
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toHaveConsoleMessage(expectedMessage: string | RegExp): R;
      toHaveNoConsoleErrors(): R;
      toHaveNoConsoleWarnings(): R;
      toHaveConsoleMessageCount(expectedCount: number, type?: 'log' | 'info' | 'warn' | 'error' | 'debug'): R;
    }
  }
}