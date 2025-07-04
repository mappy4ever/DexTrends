import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/visual-test-results.json' }],
    ['junit', { outputFile: 'test-results/visual-test-results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers and iPhone models */
  projects: [
    // Desktop browsers
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

    // iPhone models for visual regression testing
    {
      name: 'iPhone SE',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'iPhone 12 Mini',
      use: {
        ...devices['iPhone 12 Mini'],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'iPhone 12',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'iPhone 12 Pro',
      use: {
        ...devices['iPhone 12 Pro'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'iPhone 12 Pro Max',
      use: {
        ...devices['iPhone 12 Pro Max'],
        viewport: { width: 428, height: 926 },
      },
    },
    {
      name: 'iPhone 13',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'iPhone 13 Pro',
      use: {
        ...devices['iPhone 13 Pro'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'iPhone 13 Pro Max',
      use: {
        ...devices['iPhone 13 Pro Max'],
        viewport: { width: 428, height: 926 },
      },
    },
    {
      name: 'iPhone 14',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'iPhone 14 Plus',
      use: {
        ...devices['iPhone 14 Plus'],
        viewport: { width: 428, height: 926 },
      },
    },
    {
      name: 'iPhone 14 Pro',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: 'iPhone 14 Pro Max',
      use: {
        ...devices['iPhone 14 Pro Max'],
        viewport: { width: 430, height: 932 },
      },
    },
    {
      name: 'iPhone 15',
      use: {
        ...devices['iPhone 15'],
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: 'iPhone 15 Plus',
      use: {
        ...devices['iPhone 15 Plus'],
        viewport: { width: 430, height: 932 },
      },
    },
    {
      name: 'iPhone 15 Pro',
      use: {
        ...devices['iPhone 15 Pro'],
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: 'iPhone 15 Pro Max',
      use: {
        ...devices['iPhone 15 Pro Max'],
        viewport: { width: 430, height: 932 },
      },
    },

    // Tablet viewports
    {
      name: 'iPad',
      use: {
        ...devices['iPad'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'iPad Pro',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },
  ],

  /* Visual comparison settings */
  expect: {
    // Global screenshot comparison options
    toHaveScreenshot: {
      // Threshold for pixel differences (0-1, where 0.2 = 20% difference allowed)
      threshold: 0.2,
      // Animation handling (use projects config instead)
      // animations: 'disabled',
      // CSS media type (use projects config instead)
      // mode: 'light',
      // Clip to visible viewport (use projects config instead)
      // clip: { x: 0, y: 0, width: 1280, height: 720 },
    },
    // Compare screenshots visually
    toMatchSnapshot: {
      threshold: 0.2,
      // animations: 'disabled', // Not supported in toMatchSnapshot
    },
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },

  /* Global test timeout */
  timeout: 30 * 1000, // 30 seconds per test

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
});