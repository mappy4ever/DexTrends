import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 *
 * Usage:
 *   npm test                    - Run all tests on Chromium only (default)
 *   npm test -- --project=all   - Run tests on all browsers
 *   npm test -- tests/e2e/      - Run only e2e tests
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // 1 retry locally to handle flaky tests
  workers: process.env.CI ? 1 : 4, // Use 4 workers locally for speed
  reporter: process.env.CI
    ? [['list'], ['json', { outputFile: 'test-results.json' }], ['html']]
    : [['list'], ['html', { open: 'never' }]], // Don't auto-open report locally
  use: {
    baseURL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Increase timeouts for slow API calls
    actionTimeout: 60000, // 60 seconds for actions
    navigationTimeout: 60000, // 60 seconds for navigation
    // Configure screenshot comparison
    ignoreHTTPSErrors: true,
  },

  // Global test timeout
  timeout: 120000, // 2 minutes per test

  projects: [
    // Default: Only run Chromium for fast local development
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Additional browsers - run with: npm test -- --project=firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports - run with: npm test -- --project="Mobile Chrome"
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // Meta project to run all browsers
    {
      name: 'all',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['chromium', 'firefox', 'webkit', 'Mobile Chrome', 'Mobile Safari'],
    },
  ],

  // Run your dev server before starting the tests
  webServer: {
    command: process.env.NODE_ENV === 'test-prod' ? 'npm run start' : 'npm run dev',
    port: parseInt(process.env.PORT || '3000', 10),
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      PORT: process.env.PORT || '3000'
    }
  },

  // Update expect settings for visual regression
  expect: {
    // Threshold for pixel differences (0-1)
    toHaveScreenshot: { 
      threshold: 0.2,
      maxDiffPixels: 100,
      animations: 'disabled',
    },
  },
});