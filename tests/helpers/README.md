# Test API Mocking System

This directory contains helpers for mocking external APIs during tests to prevent hitting real endpoints.

## Files

### `api-mock.ts`
- **ApiMocker class**: Intercepts and mocks all external API calls
- **Automatic integration**: Automatically applied to all tests via test-base.ts
- **Prevents API rate limiting**: No real API calls during testing

### `mock-api-data.ts`
- **Static mock data**: Contains sample Pokemon and species data
- **Common test cases**: Includes Pikachu (#25), Charizard (#6), Bulbasaur (#1)
- **Consistent testing**: Same data returned across all test runs

## Usage

### Automatic Mocking (Default)
All tests automatically have API mocking enabled. No setup required.

```typescript
import { test, expect } from '../fixtures/test-base';

test('pokemon page loads', async ({ page }) => {
  // API calls will be automatically mocked
  await page.goto('/pokedex/25'); // Pikachu - uses mock data
  await expect(page.locator('[data-testid="pokemon-name"]')).toHaveText('Pikachu');
});
```

### Allow Real APIs (When Needed)
For tests that specifically need real API access:

```typescript
test('real API integration test', async ({ page, apiMocker }) => {
  // Disable mocking for this test
  await apiMocker.allowRealAPIs();
  
  // Now real API calls will go through
  await page.goto('/pokedex/25');
});
```

### Benefits
- ✅ **No API rate limiting** - Tests never hit real endpoints
- ✅ **Consistent results** - Same data every test run
- ✅ **Faster tests** - No network delays
- ✅ **Offline testing** - Works without internet
- ✅ **Predictable data** - Known responses for reliable assertions