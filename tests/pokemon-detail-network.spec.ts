import { test, expect } from '@playwright/test';

test.describe('Pokemon Detail Page - Network Debug', () => {
  test('monitor network requests', async ({ page }) => {
    // Monitor all network requests
    const requests: string[] = [];
    const failedRequests: string[] = [];
    
    page.on('request', request => {
      requests.push(`${request.method()} ${request.url()}`);
    });
    
    page.on('requestfailed', request => {
      failedRequests.push(`FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`Error response: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate to Pikachu's detail page
    console.log('Navigating to /pokedex/pikachu...');
    await page.goto('/pokedex/pikachu', { waitUntil: 'networkidle' });
    
    // Wait a bit more
    await page.waitForTimeout(2000);
    
    // Log all requests
    console.log('\n=== All Requests ===');
    requests.forEach(req => console.log(req));
    
    console.log('\n=== Failed Requests ===');
    failedRequests.forEach(req => console.log(req));
    
    // Check page content
    const bodyText = await page.locator('body').innerText();
    console.log('\n=== Page Body (first 500 chars) ===');
    console.log(bodyText.substring(0, 500));
    
    // Check for specific elements
    const hasError = await page.locator('text=Error').count();
    const hasLoading = await page.locator('text=Loading').count();
    const hasPokemonName = await page.locator('[data-testid="pokemon-name"]').count();
    
    console.log('\n=== Element Checks ===');
    console.log('Has Error:', hasError);
    console.log('Has Loading:', hasLoading);
    console.log('Has Pokemon Name:', hasPokemonName);
    
    // Check if any JavaScript errors
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    
    if (jsErrors.length > 0) {
      console.log('\n=== JavaScript Errors ===');
      jsErrors.forEach(err => console.log(err));
    }
    
    // Take screenshot
    await page.screenshot({ path: 'network-debug.png' });
    
    expect(failedRequests.length).toBe(0);
  });
});