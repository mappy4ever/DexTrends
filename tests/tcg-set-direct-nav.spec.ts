import { test, expect } from '@playwright/test';

test('Direct navigation to set detail page', async ({ page }) => {
  console.log('Testing direct navigation to sv10...');
  
  // Listen for console messages
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    // Print important logs immediately
    if (text.includes('Router') || text.includes('API') || text.includes('set') || text.includes('error')) {
      console.log(`[PAGE ${msg.type()}] ${text}`);
    }
  });
  
  // Navigate directly to sv10
  await page.goto('http://localhost:3001/tcgexpansions/sv10');
  
  // Wait a bit for all console logs
  await page.waitForTimeout(5000);
  
  // Check page state
  const pageContent = await page.content();
  const hasSetNotFound = pageContent.includes('Set Not Found');
  const hasLoading = pageContent.includes('Loading');
  const hasError = pageContent.includes('Error') || pageContent.includes('error');
  
  console.log('\nPage analysis:');
  console.log('- URL:', page.url());
  console.log('- Has "Set Not Found":', hasSetNotFound);
  console.log('- Has loading text:', hasLoading);
  console.log('- Has error:', hasError);
  
  // Check for h1 title
  const h1Elements = await page.locator('h1').all();
  console.log('- Number of h1 elements:', h1Elements.length);
  if (h1Elements.length > 0) {
    const h1Text = await h1Elements[0].textContent();
    console.log('- H1 text:', h1Text);
  }
  
  // Check for any visible text
  const visibleText = await page.locator('body').innerText();
  console.log('\nVisible text on page (first 500 chars):');
  console.log(visibleText.substring(0, 500));
  
  // Check network requests
  const failedRequests: string[] = [];
  page.on('requestfailed', request => {
    failedRequests.push(`${request.url()} - ${request.failure()?.errorText}`);
  });
  
  // Check if API call was made
  const apiRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/tcgexpansions/')) {
      apiRequests.push(request.url());
    }
  });
  
  // Take screenshot
  await page.screenshot({ path: 'tcg-set-direct-nav-sv10.png', fullPage: true });
  
  // Print all console logs
  console.log('\nAll console logs:');
  consoleLogs.forEach(log => console.log(log));
  
  console.log('\nAPI requests made:', apiRequests);
  console.log('Failed requests:', failedRequests);
});