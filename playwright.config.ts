import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['json', { outputFile: 'test-results.json' }], ['html']] : 'html',
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
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
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