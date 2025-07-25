# DexTrends Testing Guide

![Playwright Tests](https://github.com/your-username/DexTrends/actions/workflows/playwright-tests.yml/badge.svg)

## Overview

This directory contains the comprehensive test suite for DexTrends, built with Playwright and enhanced with custom console logging capabilities.

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── battle-simulator.spec.ts
│   ├── collections.spec.ts
│   ├── console-logging-demo.spec.ts
│   ├── favorites.spec.ts
│   ├── homepage.spec.ts
│   ├── mobile.spec.ts
│   ├── pocket-mode.spec.ts
│   ├── pokedex.spec.ts
│   ├── simple-console-test.spec.ts
│   ├── tcg-cards.spec.ts
│   └── type-effectiveness.spec.ts
├── fixtures/               # Test fixtures and base configuration
│   └── test-base.ts       # Enhanced test base with console logging
├── helpers/                # Test utilities
│   ├── console-logger.ts   # Console logging system
│   ├── page-helpers.ts     # Page-specific helpers
│   └── test-utils.ts       # General test utilities
└── screenshots/            # Test failure screenshots

```

## Running Tests

### Local Development

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run tests with UI mode (recommended for debugging)
npm run test:ui

# Run tests with visible browser
npm run test:headed

# Debug specific test
npm run test:debug

# Run only mobile tests
npm run test:mobile

# Run specific test file
npm test -- tests/e2e/homepage.spec.ts

# Run tests in specific browser
npm test -- --project=chromium
```

### CI/CD

Tests automatically run on:
- Every push to `main` and `optimization-branch-progress`
- Every pull request to `main`
- Daily at 2 AM UTC (scheduled tests)

## Console Logging Features

Our tests include advanced console logging capabilities:

### Automatic Console Monitoring

Every test automatically captures and monitors console output:

```typescript
test('example test', async ({ page, consoleLogger }) => {
  await page.goto('/');
  
  // Automatically checks for console errors at test end
  // Ignores non-critical errors (favicon 404, HMR warnings)
});
```

### Manual Console Assertions

```typescript
// Check for specific messages
await expect(consoleLogger).toHaveConsoleMessage('Expected message');

// Verify no errors
await expect(consoleLogger).toHaveNoConsoleErrors();

// Check message counts
await expect(consoleLogger).toHaveConsoleMessageCount(0, 'error');

// Search for messages
const apiLogs = consoleLogger.findMessages('api');

// Get detailed report
console.log(consoleLogger.getReport());
```

### Console Logger API

- `getAllMessages()` - Get all captured messages
- `getErrors()` - Get only error messages
- `getWarnings()` - Get only warning messages
- `getMessageCount(type?)` - Get count by type
- `findMessages(searchText)` - Search messages
- `hasErrors()` - Check if any errors occurred
- `clear()` - Clear captured messages
- `getReport()` - Get formatted report
- `saveToFile(path)` - Save logs to file

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle } from '../helpers/test-utils';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
    await waitForNetworkIdle(page);
  });

  test('should do something', async ({ page, consoleLogger }) => {
    // Your test logic here
    
    // Automatic console error checking happens after test
  });
});
```

### Best Practices

1. **Use Page Helpers**: Leverage `DexTrendsPageHelpers` for common actions
2. **Wait for Network**: Use `waitForNetworkIdle()` after navigation
3. **Check Console**: Tests automatically fail on console errors
4. **Mobile Testing**: Always include mobile viewport tests
5. **Descriptive Names**: Use clear, descriptive test names
6. **Isolate Tests**: Each test should be independent
7. **Use Data Attributes**: Prefer `data-testid` attributes for selectors

### Selector Priority

1. `data-testid` attributes (most reliable)
2. ARIA roles and labels
3. Text content (for user-visible elements)
4. CSS classes (least preferred)

## Debugging Tests

### Visual Debugging

```bash
# Open UI mode for interactive debugging
npm run test:ui

# Run with browser visible
npm run test:headed

# Step through test with debugger
npm run test:debug
```

### Console Logs

Enable detailed console output:

```bash
# Set DEBUG environment variable
DEBUG=1 npm test

# Save console logs to file
SAVE_CONSOLE_LOGS=1 npm test
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots (in `test-results/`)
- Videos (in `test-results/`)
- Console logs (in test output)

## CI/CD Integration

### GitHub Actions Workflows

1. **playwright-tests.yml**: Main test suite with sharding
2. **quick-tests.yml**: Fast checks for PRs
3. **scheduled-tests.yml**: Daily production tests

### Environment Variables

Required for CI:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Test Reports

- HTML reports generated for all test runs
- Available as GitHub Actions artifacts
- Automatic PR comments with results

## Performance Testing

Performance metrics are captured:
- Page load times
- First contentful paint
- Largest contentful paint
- Time to interactive

Access metrics:
```typescript
const metrics = await getPerformanceMetrics(page);
console.log(`Page load: ${metrics.load}ms`);
```

## Accessibility Testing

Basic accessibility checks included:
```typescript
const a11y = await checkAccessibility(page);
console.log(`Missing alt texts: ${a11y.missingAltTexts.length}`);
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure port 3001 is free
2. **Browser installation**: Run `npx playwright install`
3. **Timeouts**: Increase timeouts for slow machines
4. **Flaky tests**: Add proper waits and assertions

### Ignoring Non-Critical Errors

The test base automatically ignores:
- Favicon 404 errors
- HMR (Hot Module Replacement) warnings
- Supabase 404s (when tables don't exist)

To disable automatic error checking:
```typescript
process.env.ASSERT_NO_CONSOLE_ERRORS = 'false';
```

## Contributing

When adding new tests:
1. Follow existing patterns
2. Include mobile viewport tests
3. Add console error checks
4. Document any special requirements
5. Ensure tests pass locally before pushing

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD Guide](https://playwright.dev/docs/ci)