import { test, expect } from '@playwright/test';

test.describe('TCG Set Detail Page Check', () => {
  test('Check specific set detail page', async ({ page }) => {
    console.log('Testing set detail page for sv10...');
    
    // Navigate directly to a known set
    await page.goto('http://localhost:3002/tcgsets/sv10');
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ path: 'sv10-detail-page.png', fullPage: true });
    
    // Check page elements
    const hasError = await page.locator('text=/error|failed/i').count() > 0;
    const hasLoading = await page.locator('text=/loading/i').count() > 0;
    const hasTitle = await page.locator('h1').count() > 0;
    const titleText = hasTitle ? await page.locator('h1').first().textContent() : 'No title';
    const hasCards = await page.locator('img[src*="pokemontcg.io"]').count() > 0;
    const cardCount = await page.locator('img[src*="pokemontcg.io"]').count();
    
    console.log('Page status:');
    console.log('- Has error:', hasError);
    console.log('- Has loading:', hasLoading);
    console.log('- Has title:', hasTitle);
    console.log('- Title text:', titleText);
    console.log('- Has cards:', hasCards);
    console.log('- Card count:', cardCount);
    
    // Check console for errors
    const consoleLogs: { type: string; text: string }[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('Failed')) {
        consoleLogs.push({
          type: msg.type(),
          text: msg.text()
        });
      }
    });
    
    // Check network requests
    const failedRequests: { url: string; status?: number; error?: string }[] = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    // Reload to capture logs
    await page.reload();
    await page.waitForTimeout(5000);
    
    console.log('\nConsole errors:');
    consoleLogs.forEach(log => console.log(`[${log.type}] ${log.text}`));
    
    console.log('\nFailed requests:');
    failedRequests.forEach(req => console.log(`Failed: ${req.url} - ${req.failure?.errorText}`));
    
    // Try a different set
    console.log('\n\nTesting base1 set...');
    await page.goto('http://localhost:3002/tcgsets/base1');
    await page.waitForTimeout(5000);
    
    const base1HasTitle = await page.locator('h1').count() > 0;
    const base1TitleText = base1HasTitle ? await page.locator('h1').first().textContent() : 'No title';
    const base1CardCount = await page.locator('img[src*="pokemontcg.io"]').count();
    
    console.log('Base1 page:');
    console.log('- Has title:', base1HasTitle);
    console.log('- Title text:', base1TitleText);
    console.log('- Card count:', base1CardCount);
    
    // Check API endpoint directly
    console.log('\n\nChecking API endpoints...');
    const apiResponse = await page.request.get('http://localhost:3002/api/tcg-sets/sv10');
    console.log('API /api/tcg-sets/sv10 status:', apiResponse.status());
    if (apiResponse.ok()) {
      const data = await apiResponse.json();
      console.log('API response has set:', !!data.set);
      console.log('API response cards count:', data.cards?.length || 0);
    }
  });
});