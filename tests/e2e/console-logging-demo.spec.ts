import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { 
  waitForNetworkIdle, 
  categorizeErrors, 
  getPerformanceMetrics,
  checkBrokenImages 
} from '../helpers/test-utils';

test.describe('Console Logging Demo', () => {
  test('comprehensive console logging example', async ({ page, consoleLogger }) => {
    const pageHelpers = new DexTrendsPageHelpers(page);
    
    // Navigate to homepage
    await page.goto('/');
    await waitForNetworkIdle(page);
    
    // 1. Basic console message checking
    console.log('=== Testing Console Logging Features ===');
    
    // Check total message count
    const totalMessages = consoleLogger.getMessageCount();
    console.log(`Total console messages: ${totalMessages}`);
    
    // Check messages by type
    console.log(`Errors: ${consoleLogger.getMessageCount('error')}`);
    console.log(`Warnings: ${consoleLogger.getMessageCount('warn')}`);
    console.log(`Info: ${consoleLogger.getMessageCount('info')}`);
    console.log(`Logs: ${consoleLogger.getMessageCount('log')}`);
    
    // 2. Search for specific messages
    const reactMessages = consoleLogger.findMessages('react', false);
    console.log(`Found ${reactMessages.length} React-related messages`);
    
    const apiMessages = consoleLogger.findMessages('api');
    console.log(`Found ${apiMessages.length} API-related messages`);
    
    // 3. Check for specific error patterns
    const errors = consoleLogger.getErrors();
    if (errors.length > 0) {
      console.log('\n=== Console Errors Found ===');
      const categorized = categorizeErrors(consoleLogger);
      console.log(`Network errors: ${categorized.networkErrors.length}`);
      console.log(`JavaScript errors: ${categorized.jsErrors.length}`);
      console.log(`Resource errors: ${categorized.resourceErrors.length}`);
      console.log(`Other errors: ${categorized.otherErrors.length}`);
    }
    
    // 4. Navigate to a page that might have more console activity
    await pageHelpers.goToPokemonDetail('25'); // Pikachu
    await waitForNetworkIdle(page);
    
    // Check for new messages after navigation
    const messagesAfterNav = consoleLogger.getMessageCount();
    console.log(`\nMessages after navigation: ${messagesAfterNav} (increased by ${messagesAfterNav - totalMessages})`);
    
    // 5. Test error scenarios (intentionally trigger an error)
    await page.evaluate(() => {
      console.log('This is a test log message');
      console.warn('This is a test warning');
      console.info('This is a test info message');
      // Note: We're not actually triggering an error to avoid failing the test
      // console.error('This is a test error');
    });
    
    // Verify our test messages were captured
    await expect(consoleLogger).toHaveConsoleMessage('This is a test log message');
    await expect(consoleLogger).toHaveConsoleMessage('This is a test warning');
    
    // 6. Performance metrics
    const metrics = await getPerformanceMetrics(page);
    console.log('\n=== Performance Metrics ===');
    console.log(`DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`Page Load: ${metrics.load}ms`);
    console.log(`First Paint: ${metrics.firstPaint}ms`);
    console.log(`First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
    
    // 7. Check for broken images
    const brokenImages = await checkBrokenImages(page);
    if (brokenImages.length > 0) {
      console.log(`\nFound ${brokenImages.length} broken images:`);
      brokenImages.forEach(img => console.log(`  - ${img}`));
    }
    
    // 8. Generate console report
    if (process.env.DEBUG) {
      console.log('\n=== Full Console Report ===');
      console.log(consoleLogger.getReport());
    }
    
    // 9. Custom assertions
    await expect(consoleLogger).toHaveNoConsoleErrors();
    await expect(consoleLogger).toHaveConsoleMessageCount(0, 'error');
    
    // Save console logs to file for debugging (optional)
    if (process.env.SAVE_CONSOLE_LOGS) {
      await consoleLogger.saveToFile(`tests/logs/console-${Date.now()}.log`);
    }
  });

  test('test with expected console errors', async ({ page, consoleLogger }) => {
    // For this test, we'll disable automatic error assertion
    process.env.ASSERT_NO_CONSOLE_ERRORS = 'false';
    
    await page.goto('/');
    
    // Intentionally cause a console error
    await page.evaluate(() => {
      console.error('This is an expected error for testing');
      throw new Error('This is an expected page error');
    }).catch(() => {
      // Catch the error to prevent test failure
    });
    
    // Verify error was captured
    const errors = consoleLogger.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    await expect(consoleLogger).toHaveConsoleMessage(/expected error/i);
    
    // Reset the environment variable
    delete process.env.ASSERT_NO_CONSOLE_ERRORS;
  });

  test('monitor console during user interactions', async ({ page, consoleLogger }) => {
    const pageHelpers = new DexTrendsPageHelpers(page);
    
    await page.goto('/pokedex');
    await pageHelpers.waitForLoadingComplete();
    
    // Clear existing console messages
    consoleLogger.clear();
    
    // Perform user interaction
    await pageHelpers.filterByType('fire');
    
    // Check console messages generated by the interaction
    const messagesAfterFilter = consoleLogger.getAllMessages();
    console.log(`Messages generated by filtering: ${messagesAfterFilter.length}`);
    
    // Look for any performance-related logs
    const perfLogs = consoleLogger.findMessages('performance');
    if (perfLogs.length > 0) {
      console.log('Performance-related logs found:');
      perfLogs.forEach(log => console.log(`  - ${log.text}`));
    }
    
    // Ensure no errors during interaction
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });
});