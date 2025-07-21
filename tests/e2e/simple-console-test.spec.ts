import { test, expect } from '../fixtures/test-base';

test.describe('Simple Console Logging Test', () => {
  test('basic console logging functionality', async ({ page, consoleLogger }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait a bit for initial load
    await page.waitForTimeout(2000);
    
    // Log initial console state
    console.log('=== Initial Console State ===');
    console.log(`Total messages: ${consoleLogger.getMessageCount()}`);
    console.log(`Errors: ${consoleLogger.getMessageCount('error')}`);
    console.log(`Warnings: ${consoleLogger.getMessageCount('warn')}`);
    console.log(`Info: ${consoleLogger.getMessageCount('info')}`);
    console.log(`Logs: ${consoleLogger.getMessageCount('log')}`);
    
    // Test custom console messages
    await page.evaluate(() => {
      console.log('Test log message from Playwright');
      console.info('Test info message');
      console.warn('Test warning message');
      // Not creating errors to avoid test failure
    });
    
    // Wait for messages to be captured
    await page.waitForTimeout(100);
    
    // Verify our messages were captured
    await expect(consoleLogger).toHaveConsoleMessage('Test log message from Playwright');
    await expect(consoleLogger).toHaveConsoleMessage('Test info message');
    await expect(consoleLogger).toHaveConsoleMessage('Test warning message');
    
    // Find specific messages
    const testMessages = consoleLogger.findMessages('Test');
    console.log(`\nFound ${testMessages.length} test messages`);
    testMessages.forEach(msg => {
      console.log(`  - [${msg.type}] ${msg.text}`);
    });
    
    // Check navigation works
    console.log('\n=== Testing navigation ===');
    const messagesBefore = consoleLogger.getMessageCount();
    
    await page.getByRole('link', { name: /pokedex/i }).first().click();
    await page.waitForTimeout(2000);
    
    const messagesAfter = consoleLogger.getMessageCount();
    console.log(`Messages increased by ${messagesAfter - messagesBefore} after navigation`);
    
    // Log warnings if any
    const warnings = consoleLogger.getWarnings();
    if (warnings.length > 0) {
      console.log(`\n=== Warnings Found (${warnings.length}) ===`);
      warnings.slice(0, 5).forEach(warn => {
        console.log(`  - ${warn.text.substring(0, 100)}...`);
      });
    }
    
    console.log('\n✅ Console logging is working correctly!');
  });
});