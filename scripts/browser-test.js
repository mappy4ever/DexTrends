// Browser Console Test Script
// Copy and paste this into your browser console on http://localhost:3002/tcgexpansions/sv5

(function testTCGPage() {
    console.clear();
    console.log('%c🧪 TCG Set Detail Page Live Test', 'font-size: 20px; color: blue; font-weight: bold');
    
    // Test results storage
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    // Helper function to add test result
    function test(name, condition, details = '') {
        const passed = !!condition;
        results.tests.push({ name, passed, details });
        if (passed) results.passed++;
        else results.failed++;
        
        console.log(
            `${passed ? '✅' : '❌'} ${name}`,
            passed ? 'color: green' : 'color: red',
            details
        );
    }
    
    // Run tests
    console.group('📋 Component Tests');
    
    // Test 1: Page sections
    test('Set Header Loaded', 
        document.querySelector('h1') || document.querySelector('[class*="SetHeader"]'),
        'Header with set name should be visible'
    );
    
    test('Statistics Section Loaded',
        document.querySelectorAll('[class*="statistic"], [class*="Statistics"]').length > 0,
        'Statistics with rarity distribution'
    );
    
    test('Rarity Showcase Loaded',
        document.querySelectorAll('[class*="showcase"], [class*="Showcase"]').length > 0,
        'Horizontal scrolling rare cards'
    );
    
    test('Search Bar Present',
        document.querySelector('input[placeholder*="Search"], input[placeholder*="search"]'),
        'Smart search input field'
    );
    
    test('Card Grid Loaded',
        document.querySelectorAll('[class*="grid"] img').length > 0,
        'Grid of card images'
    );
    
    console.groupEnd();
    
    // Test 2: Rarity symbols
    console.group('🎯 Rarity Symbol Tests');
    
    const raritySymbols = document.querySelectorAll('img[src*="TCG-rarity"]');
    test('Rarity Symbols Present',
        raritySymbols.length > 0,
        `Found ${raritySymbols.length} rarity symbols`
    );
    
    if (raritySymbols.length > 0) {
        test('Rarity Symbols Loading',
            Array.from(raritySymbols).every(img => img.complete && img.naturalHeight > 0),
            'All symbols loaded successfully'
        );
    }
    
    console.groupEnd();
    
    // Test 3: Interactive elements
    console.group('🖱️ Interactive Elements');
    
    test('Filter Pills',
        document.querySelectorAll('button[class*="rounded-full"]').length > 0,
        'Quick filter buttons'
    );
    
    test('Floating Actions',
        document.querySelectorAll('[class*="floating"], [class*="Floating"]').length > 0,
        'Floating action buttons'
    );
    
    test('Clickable Cards',
        document.querySelectorAll('[class*="cursor-pointer"]').length > 0,
        'Cards should be clickable'
    );
    
    console.groupEnd();
    
    // Test 4: Performance
    console.group('⚡ Performance');
    
    const perf = performance.getEntriesByType('navigation')[0];
    test('Page Load Time',
        perf && perf.loadEventEnd < 3000,
        `${Math.round(perf.loadEventEnd)}ms (target: <3000ms)`
    );
    
    test('Card Count',
        document.querySelectorAll('img[alt], img[class*="card"]').length > 50,
        `${document.querySelectorAll('img[alt], img[class*="card"]').length} cards loaded`
    );
    
    console.groupEnd();
    
    // Summary
    console.log('\n%c📊 Test Summary', 'font-size: 16px; font-weight: bold');
    console.log(`Passed: ${results.passed}/${results.tests.length}`);
    console.log(`Failed: ${results.failed}/${results.tests.length}`);
    
    if (results.failed === 0) {
        console.log('%c✅ All tests passed!', 'color: green; font-size: 18px; font-weight: bold');
    } else {
        console.log('%c⚠️ Some tests failed - check details above', 'color: orange; font-size: 18px; font-weight: bold');
    }
    
    // Interactive test suggestions
    console.log('\n%c📝 Manual Tests to Perform:', 'font-size: 16px; font-weight: bold');
    console.log('1. Click on any card - should open a modal with details');
    console.log('2. Type "Pikachu" in search - cards should filter instantly');
    console.log('3. Click "Rare Secret" filter - should show only secret rare cards');
    console.log('4. Hover over rare cards - should see glow effects');
    console.log('5. Hold Shift and click multiple cards - bulk operations bar should appear');
    console.log('6. Click the floating action buttons - should show collection/portfolio options');
    
    return results;
})();