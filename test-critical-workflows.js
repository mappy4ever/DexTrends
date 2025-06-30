// Critical Workflow Test Script for DexTrends
// This script tests key user workflows using Puppeteer

const puppeteer = require('puppeteer');

async function testCriticalWorkflows() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();
  
  const results = {
    favorites: { passed: [], failed: [] },
    search: { passed: [], failed: [] },
    filtering: { passed: [], failed: [] },
    deckBuilder: { passed: [], failed: [] },
    persistence: { passed: [], failed: [] },
    consoleErrors: []
  };
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('pageerror', error => {
    results.consoleErrors.push({
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    // 1. Test Favorites Functionality
    console.log('\n=== Testing Favorites Functionality ===');
    
    // Test on Pokemon page
    await page.goto('http://localhost:3000/pokedex', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    // Find and click a favorite button
    const pokemonFavoriteButtons = await page.$$('[data-testid="favorite-button"], button[aria-label*="favorite" i], button[title*="favorite" i]');
    if (pokemonFavoriteButtons.length > 0) {
      await pokemonFavoriteButtons[0].click();
      await page.waitForTimeout(1000);
      results.favorites.passed.push('Pokemon favorite button clickable');
      
      // Check if state changed
      const isActive = await page.evaluate(el => {
        return el.classList.contains('active') || el.classList.contains('favorited') || 
               el.getAttribute('aria-pressed') === 'true';
      }, pokemonFavoriteButtons[0]);
      
      if (isActive) {
        results.favorites.passed.push('Pokemon favorite state changes on click');
      } else {
        results.favorites.failed.push('Pokemon favorite state did not change');
      }
    } else {
      results.favorites.failed.push('No Pokemon favorite buttons found');
    }
    
    // Test on Cards page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const cardFavoriteButtons = await page.$$('[data-testid="favorite-button"], .card-item button[aria-label*="favorite" i]');
    if (cardFavoriteButtons.length > 0) {
      await cardFavoriteButtons[0].click();
      await page.waitForTimeout(1000);
      results.favorites.passed.push('Card favorite button clickable');
    } else {
      results.favorites.failed.push('No card favorite buttons found');
    }
    
    // Check favorites page
    await page.goto('http://localhost:3000/favorites', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const favoriteItems = await page.$$('.favorite-item, [data-testid="favorite-item"]');
    if (favoriteItems.length > 0) {
      results.favorites.passed.push(`Favorites page shows ${favoriteItems.length} items`);
    } else {
      // Check if there's an empty state
      const emptyState = await page.$('.empty-state, [data-testid="empty-favorites"]');
      if (emptyState) {
        results.favorites.passed.push('Favorites page shows empty state when no favorites');
      } else {
        results.favorites.failed.push('Favorites page shows no items and no empty state');
      }
    }
    
    // 2. Test Search Functionality
    console.log('\n=== Testing Search Functionality ===');
    
    // Test global search
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    // Try to trigger global search (common patterns: Cmd+K, Ctrl+K, search button)
    try {
      await page.keyboard.down('Meta');
      await page.keyboard.press('k');
      await page.keyboard.up('Meta');
      await page.waitForTimeout(1000);
      
      const searchModal = await page.$('.search-modal, [data-testid="global-search"], [role="dialog"]');
      if (searchModal) {
        results.search.passed.push('Global search modal opens with Cmd+K');
        
        // Type in search
        await page.type('input[type="search"], input[placeholder*="search" i]', 'Pikachu');
        await page.waitForTimeout(1500);
        
        const searchResults = await page.$$('.search-result, [data-testid="search-result"]');
        if (searchResults.length > 0) {
          results.search.passed.push(`Global search returns ${searchResults.length} results`);
        } else {
          results.search.failed.push('Global search returns no results for "Pikachu"');
        }
        
        // Close modal
        await page.keyboard.press('Escape');
      } else {
        results.search.failed.push('Global search modal did not open');
      }
    } catch (e) {
      results.search.failed.push(`Global search error: ${e.message}`);
    }
    
    // Test page-specific search on Pokedex
    await page.goto('http://localhost:3000/pokedex', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const pokedexSearch = await page.$('input[type="search"], input[placeholder*="search" i]');
    if (pokedexSearch) {
      await pokedexSearch.type('Charizard');
      await page.waitForTimeout(1500);
      
      const pokemonCards = await page.$$('.pokemon-card, [data-testid="pokemon-card"]');
      if (pokemonCards.length > 0) {
        results.search.passed.push(`Pokedex search filters to ${pokemonCards.length} results`);
      } else {
        results.search.failed.push('Pokedex search returns no results');
      }
    } else {
      results.search.failed.push('No search input found on Pokedex page');
    }
    
    // 3. Test Filtering on Pokedex
    console.log('\n=== Testing Pokedex Filtering ===');
    
    await page.goto('http://localhost:3000/pokedex', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    // Look for filter buttons or dropdowns
    const filterButtons = await page.$$('button[aria-label*="filter" i], .filter-button, [data-testid="filter"]');
    const typeFilters = await page.$$('.type-filter, [data-testid="type-filter"], button[class*="type"]');
    
    if (typeFilters.length > 0) {
      // Click a type filter
      await typeFilters[0].click();
      await page.waitForTimeout(1500);
      
      const filteredPokemon = await page.$$('.pokemon-card, [data-testid="pokemon-card"]');
      results.filtering.passed.push(`Type filter applied, showing ${filteredPokemon.length} Pokemon`);
    } else if (filterButtons.length > 0) {
      await filterButtons[0].click();
      await page.waitForTimeout(1000);
      results.filtering.passed.push('Filter button is clickable');
    } else {
      results.filtering.failed.push('No filter options found on Pokedex page');
    }
    
    // 4. Test Deck Builder in Pocket Mode
    console.log('\n=== Testing Pocket Mode Deck Builder ===');
    
    await page.goto('http://localhost:3000/pocketmode/deckbuilder', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    // Check if deck builder loaded
    const deckBuilderContainer = await page.$('.deck-builder, [data-testid="deck-builder"]');
    if (deckBuilderContainer) {
      results.deckBuilder.passed.push('Deck builder page loads');
      
      // Try to add a card
      const addCardButtons = await page.$$('button[aria-label*="add" i], .add-card-button');
      if (addCardButtons.length > 0) {
        await addCardButtons[0].click();
        await page.waitForTimeout(1000);
        results.deckBuilder.passed.push('Can interact with add card buttons');
      }
      
      // Check deck counter
      const deckCounter = await page.$('.deck-counter, [data-testid="deck-counter"], .card-count');
      if (deckCounter) {
        const count = await page.evaluate(el => el.textContent, deckCounter);
        results.deckBuilder.passed.push(`Deck counter shows: ${count}`);
      }
    } else {
      results.deckBuilder.failed.push('Deck builder container not found');
    }
    
    // 5. Test Data Persistence
    console.log('\n=== Testing Data Persistence ===');
    
    // Add a favorite
    await page.goto('http://localhost:3000/pokedex', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const favButton = await page.$('[data-testid="favorite-button"], button[aria-label*="favorite" i]');
    if (favButton) {
      await favButton.click();
      await page.waitForTimeout(1000);
      
      // Refresh page to test persistence
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);
      
      // Check if favorite state persisted
      const favButtonAfterReload = await page.$('[data-testid="favorite-button"].active, button[aria-pressed="true"]');
      if (favButtonAfterReload) {
        results.persistence.passed.push('Favorites persist after page reload');
      } else {
        results.persistence.failed.push('Favorites do not persist after reload');
      }
    }
    
    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    if (Object.keys(localStorageData).length > 0) {
      results.persistence.passed.push(`Found ${Object.keys(localStorageData).length} localStorage keys`);
    }
    
  } catch (error) {
    console.error('Test error:', error);
    results.consoleErrors.push({
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
  
  // Print results
  console.log('\n\n=== TEST RESULTS ===\n');
  
  for (const [category, data] of Object.entries(results)) {
    if (category === 'consoleErrors') {
      console.log(`\n${category.toUpperCase()}:`);
      if (data.length === 0) {
        console.log('  ✅ No console errors detected');
      } else {
        data.forEach(error => {
          console.log(`  ❌ ${error.text}`);
          if (error.location) {
            console.log(`     at ${error.location.url}:${error.location.lineNumber}`);
          }
        });
      }
    } else {
      console.log(`\n${category.toUpperCase()}:`);
      console.log('  Passed:');
      data.passed.forEach(test => console.log(`    ✅ ${test}`));
      console.log('  Failed:');
      if (data.failed.length === 0) {
        console.log('    ✅ No failures');
      } else {
        data.failed.forEach(test => console.log(`    ❌ ${test}`));
      }
    }
  }
  
  await browser.close();
}

// Run tests
testCriticalWorkflows().catch(console.error);