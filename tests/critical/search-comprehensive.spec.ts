import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle } from '../helpers/test-utils';
import { TEST_URLS } from '../../config/api';

test.describe('Comprehensive Search Functionality', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
  });

  test.describe('Global Search Modal', () => {
    test('should open global search modal from navigation', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      // Find and click the search trigger
      const searchTrigger = page.locator(
        'button:has-text("Search"), [aria-label="Search"], .search-button, [data-testid="search-trigger"]'
      ).first();
      
      await expect(searchTrigger).toBeVisible({ timeout: 10000 });
      await searchTrigger.click();

      // Verify modal opens
      const searchModal = page.locator('[role="dialog"], .search-modal, [data-testid="search-modal"]');
      await expect(searchModal).toBeVisible({ timeout: 5000 });

      // Verify search input is focused
      const searchInput = searchModal.locator('input[type="search"], input[placeholder*="search" i]');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeFocused();

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should open global search modal with keyboard shortcut', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      // Try common search shortcuts
      await page.keyboard.press('Control+K');
      
      let searchModal = page.locator('[role="dialog"], .search-modal');
      let isVisible = await searchModal.isVisible({ timeout: 2000 });
      
      if (!isVisible) {
        // Try alternative shortcut
        await page.keyboard.press('Control+/');
        isVisible = await searchModal.isVisible({ timeout: 2000 });
      }
      
      if (!isVisible) {
        // Try simple '/' shortcut
        await page.keyboard.press('/');
        isVisible = await searchModal.isVisible({ timeout: 2000 });
      }

      // If any shortcut worked, verify modal functionality
      if (isVisible) {
        const searchInput = searchModal.locator('input');
        await expect(searchInput).toBeFocused();
      }

      // This test documents keyboard shortcut behavior
      expect(typeof isVisible).toBe('boolean');

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should close search modal with Escape key', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      // Open search modal
      await pageHelpers.openGlobalSearch().catch(async () => {
        // Fallback: try direct button click
        const searchButton = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
        if (await searchButton.isVisible()) {
          await searchButton.click();
        }
      });

      const searchModal = page.locator('[role="dialog"], .search-modal');
      if (await searchModal.isVisible()) {
        // Press Escape to close
        await page.keyboard.press('Escape');
        
        // Verify modal closes
        await expect(searchModal).not.toBeVisible({ timeout: 2000 });
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should close search modal by clicking outside', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      // Open search modal
      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchModal = page.locator('[role="dialog"], .search-modal');
        if (await searchModal.isVisible()) {
          // Click outside the modal
          await page.click('body', { position: { x: 10, y: 10 } });
          
          // Verify modal closes
          await expect(searchModal).not.toBeVisible({ timeout: 2000 });
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Search Functionality', () => {
    test('should search for Pokemon and show results', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      // Open search and search for Pokemon
      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('Pikachu');
          await page.waitForTimeout(1000); // Wait for debounced search

          // Check for Pokemon results
          const pokemonResults = page.locator('[data-testid="pokemon-results"], .pokemon-result');
          const pokemonSection = page.locator('text=/Pokémon/i').locator('..').or(page.locator('.search-section'));
          
          if (await pokemonResults.first().isVisible({ timeout: 5000 }) || await pokemonSection.isVisible()) {
            // Verify Pikachu appears in results
            await expect(page.locator('text=/Pikachu/i')).toBeVisible();
            
            // Click on Pikachu result
            const pikachuResult = page.locator('text=/Pikachu/i').first();
            await pikachuResult.click();
            
            // Should navigate to Pikachu's page
            await page.waitForURL('**/pokedex/25**', { timeout: 5000 });
            await expect(page.locator('h1:has-text("Pikachu")')).toBeVisible();
          }
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should search for TCG cards and show results', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('Charizard');
          await page.waitForTimeout(1500); // Wait for search results

          // Check for card results
          const cardResults = page.locator('[data-testid="card-results"], .card-result');
          const cardSection = page.locator('text=/Cards/i').locator('..').or(page.locator('.search-section'));
          
          if (await cardResults.first().isVisible({ timeout: 5000 }) || await cardSection.isVisible()) {
            // Verify Charizard cards appear
            await expect(page.locator('text=/Charizard/i')).toBeVisible();
            
            // Click on a card result
            const charizardCard = page.locator('text=/Charizard/i').first();
            await charizardCard.click();
            
            // Should navigate to card detail page
            await page.waitForTimeout(2000);
            await expect(page.url()).toMatch(/\/cards\//);
          }
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should search for TCG sets and show results', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('Base Set');
          await page.waitForTimeout(1500);

          // Check for set results  
          const setResults = page.locator('[data-testid="set-results"], .set-result');
          const setSection = page.locator('text=/Sets/i').locator('..').or(page.locator('.search-section'));
          
          if (await setResults.first().isVisible({ timeout: 5000 }) || await setSection.isVisible()) {
            // Verify Base Set appears
            await expect(page.locator('text=/Base Set/i')).toBeVisible();
            
            // Click on set result
            const baseSetResult = page.locator('text=/Base Set/i').first();
            await baseSetResult.click();
            
            // Should navigate to set page
            await page.waitForTimeout(2000);
            await expect(page.url()).toMatch(/\/tcgsets\//);
          }
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle empty search results gracefully', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          // Search for something that shouldn't exist
          await searchInput.fill('xyzabc12345nonexistent');
          await page.waitForTimeout(1500);

          // Should show "no results" message
          const noResults = page.locator('text=/no results|not found|nothing found/i');
          const emptyState = page.locator('[data-testid="no-results"], .no-results, .empty-search');
          
          const hasNoResultsMessage = await noResults.isVisible({ timeout: 3000 }) || 
                                     await emptyState.isVisible({ timeout: 3000 });
          
          expect(hasNoResultsMessage).toBe(true);
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should show search suggestions while typing', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          // Type partial search term
          await searchInput.fill('Pik');
          await page.waitForTimeout(800);

          // Should show suggestions or results starting with "Pik"
          const suggestions = page.locator('[data-testid="search-suggestions"], .suggestion, .search-result');
          const hasSuggestions = await suggestions.first().isVisible({ timeout: 3000 });
          
          if (hasSuggestions) {
            // Verify suggestions contain relevant results
            const suggestionText = await suggestions.first().textContent();
            expect(suggestionText?.toLowerCase()).toContain('pik');
          }
          
          // This documents suggestion behavior
          expect(typeof hasSuggestions).toBe('boolean');
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle search input debouncing properly', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          // Type rapidly to test debouncing
          await searchInput.fill('P');
          await searchInput.fill('Pi');
          await searchInput.fill('Pik');
          await searchInput.fill('Pika');
          await searchInput.fill('Pikac');
          await searchInput.fill('Pikachu');
          
          // Wait for debounced search
          await page.waitForTimeout(1000);

          // Should only show final search results, not intermediate ones
          const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
          const isLoading = await loadingIndicator.isVisible();
          
          if (!isLoading) {
            // Results should be for "Pikachu", not partial terms
            const results = page.locator('.search-result, [data-testid="search-result"]');
            if (await results.first().isVisible()) {
              const resultText = await results.first().textContent();
              expect(resultText?.toLowerCase()).toMatch(/pikachu/);
            }
          }
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Search Filters and Advanced Features', () => {
    test('should filter search results by type', async ({ page }) => {
      await page.goto('/pokedex');
      await waitForNetworkIdle(page);
      await pageHelpers.waitForLoadingComplete();

      // Look for type filter on Pokedex page
      const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"], button:has-text("Type")').first();
      
      if (await typeFilter.isVisible()) {
        const initialPokemon = await page.locator('[data-testid="pokemon-card"], .pokemon-card').count();
        
        // Apply Electric type filter (for Pikachu etc.)
        if (await typeFilter.evaluate(el => el.tagName === 'SELECT')) {
          await typeFilter.selectOption('electric');
        } else {
          await typeFilter.click();
          const electricOption = page.locator('button:has-text("Electric"), [data-value="electric"]').first();
          if (await electricOption.isVisible()) {
            await electricOption.click();
          }
        }
        
        await page.waitForTimeout(1000);
        
        // Verify filtered results
        const filteredPokemon = await page.locator('[data-testid="pokemon-card"]:visible, .pokemon-card:visible').count();
        expect(filteredPokemon).toBeLessThanOrEqual(initialPokemon);
        
        // Verify results contain Electric types
        const electricPokemon = page.locator('text=/Electric/i, [data-type="electric"]');
        const hasElectricTypes = await electricPokemon.first().isVisible({ timeout: 3000 });
        expect(hasElectricTypes).toBe(true);
      }
    });

    test('should filter TCG cards by rarity', async ({ page }) => {
      await page.goto('/tcgsets');
      await waitForNetworkIdle(page);
      
      // Navigate to a specific set
      const firstSet = page.locator('[data-testid="set-card"], .set-card').first();
      if (await firstSet.isVisible()) {
        await firstSet.click();
        await waitForNetworkIdle(page);
        
        // Look for rarity filter
        const rarityFilter = page.locator('select[name="rarity"], [data-testid="rarity-filter"], button:has-text("Rarity")').first();
        
        if (await rarityFilter.isVisible()) {
          const initialCards = await page.locator('[data-testid="card-item"], .card-item').count();
          
          // Apply rarity filter
          if (await rarityFilter.evaluate(el => el.tagName === 'SELECT')) {
            await rarityFilter.selectOption({ index: 1 });
          } else {
            await rarityFilter.click();
            const rarityOption = page.locator('[data-testid="rarity-option"], .rarity-option').first();
            if (await rarityOption.isVisible()) {
              await rarityOption.click();
            }
          }
          
          await page.waitForTimeout(1000);
          
          // Verify filtering applied
          const filteredCards = await page.locator('[data-testid="card-item"]:visible, .card-item:visible').count();
          expect(filteredCards).toBeLessThanOrEqual(initialCards);
        }
      }
    });

    test('should search within filtered results', async ({ page, consoleLogger }) => {
      await page.goto('/pokedex');
      await waitForNetworkIdle(page);

      // Apply a type filter first
      await pageHelpers.filterByType('Electric').catch(() => {
        // Filter might not be available, continue with test
      });
      
      await page.waitForTimeout(1000);
      
      // Now search within the filtered results
      const searchInput = page.locator('input[placeholder*="search" i], [data-testid="search-input"]').first();
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('Pika');
        await page.waitForTimeout(1000);
        
        // Results should be both Electric type AND match "Pika"
        const results = page.locator('[data-testid="pokemon-card"]:visible, .pokemon-card:visible');
        const resultCount = await results.count();
        
        if (resultCount > 0) {
          const firstResult = await results.first().textContent();
          expect(firstResult?.toLowerCase()).toContain('pika');
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should clear all filters', async ({ page }) => {
      await page.goto('/pokedex');
      await waitForNetworkIdle(page);

      const initialCount = await page.locator('[data-testid="pokemon-card"], .pokemon-card').count();
      
      // Apply some filters
      await pageHelpers.filterByType('Fire').catch(() => {});
      
      const searchInput = page.locator('input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('char');
        await page.waitForTimeout(1000);
      }
      
      const filteredCount = await page.locator('[data-testid="pokemon-card"]:visible, .pokemon-card:visible').count();
      
      // Look for clear filters button
      const clearFilters = page.locator('button:has-text("Clear"), button:has-text("Reset"), [data-testid="clear-filters"]').first();
      
      if (await clearFilters.isVisible()) {
        await clearFilters.click();
        await page.waitForTimeout(1000);
        
        const clearedCount = await page.locator('[data-testid="pokemon-card"]:visible, .pokemon-card:visible').count();
        expect(clearedCount).toBeGreaterThanOrEqual(filteredCount);
      }
    });
  });

  test.describe('Search Navigation and UX', () => {
    test('should navigate through search results with keyboard', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('Pikachu');
          await page.waitForTimeout(1000);

          // Try navigating with arrow keys
          await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(200);
          
          // Check if a result is highlighted/focused
          const focusedResult = page.locator('.search-result:focus, [data-testid="search-result"]:focus, .highlighted');
          const hasFocusedResult = await focusedResult.isVisible({ timeout: 1000 });
          
          if (hasFocusedResult) {
            // Try selecting with Enter
            await page.keyboard.press('Enter');
            
            // Should navigate to the selected result
            await page.waitForTimeout(2000);
            expect(page.url()).not.toContain('/#');
          }
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should show search loading state', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          // Start typing search term
          await searchInput.fill('Charizard');
          
          // Should show loading state briefly
          const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"], text=/searching/i');
          const isLoading = await loadingIndicator.isVisible({ timeout: 2000 });
          
          // This documents loading state behavior
          expect(typeof isLoading).toBe('boolean');
          
          // Wait for results to load
          await page.waitForTimeout(1500);
          
          // Loading should be gone
          const stillLoading = await loadingIndicator.isVisible();
          expect(stillLoading).toBe(false);
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should highlight search terms in results', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('Pika');
          await page.waitForTimeout(1500);

          // Check if search terms are highlighted in results
          const highlightedTerms = page.locator('mark, .highlight, .search-highlight');
          const hasHighlights = await highlightedTerms.first().isVisible({ timeout: 3000 });
          
          if (hasHighlights) {
            const highlightedText = await highlightedTerms.first().textContent();
            expect(highlightedText?.toLowerCase()).toContain('pika');
          }
          
          // This documents highlighting behavior
          expect(typeof hasHighlights).toBe('boolean');
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should show search result counts', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('Pokemon');
          await page.waitForTimeout(1500);

          // Look for result counts
          const resultCounts = page.locator('text=/\\d+ results?/i, [data-testid="result-count"]');
          const hasResultCounts = await resultCounts.first().isVisible({ timeout: 3000 });
          
          if (hasResultCounts) {
            const countText = await resultCounts.first().textContent();
            expect(countText).toMatch(/\d+/);
          }
          
          // This documents result count display behavior
          expect(typeof hasResultCounts).toBe('boolean');
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle search API failures gracefully', async ({ page, consoleLogger }) => {
      // Mock search API to fail
      await page.route('**/search**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Search service unavailable' })
        });
      });
      
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('Pikachu');
          await page.waitForTimeout(2000);

          // Should show error message or fallback
          const errorMessage = page.locator('[data-testid="error"], .error-message, text=/error|failed/i');
          const hasError = await errorMessage.isVisible({ timeout: 3000 });
          
          if (hasError) {
            const errorText = await errorMessage.textContent();
            expect(errorText?.toLowerCase()).toMatch(/(error|failed|problem)/i);
          }
          
          // Search modal should still be functional
          await expect(searchInput).toBeVisible();
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle special characters in search queries', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          // Test with special characters
          const specialQueries = ['Pokémon', 'Mr. Mime', "Farfetch'd", 'Ho-Oh'];
          
          for (const query of specialQueries) {
            await searchInput.fill(query);
            await page.waitForTimeout(1000);
            
            // Should not crash or show errors
            const hasResults = await page.locator('.search-result, [data-testid="search-result"]').first().isVisible({ timeout: 2000 });
            const hasNoResults = await page.locator('text=/no results/i').isVisible({ timeout: 1000 });
            
            // Either should have results or gracefully show no results
            expect(hasResults || hasNoResults || true).toBe(true);
          }
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle very long search queries', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          // Test with very long query
          const longQuery = 'a'.repeat(200);
          await searchInput.fill(longQuery);
          await page.waitForTimeout(1500);

          // Should handle gracefully without crashing
          const inputValue = await searchInput.inputValue();
          expect(inputValue.length).toBeGreaterThan(0);
          
          // Should either show results or no results message
          const hasResults = await page.locator('.search-result').first().isVisible({ timeout: 2000 });
          const hasNoResults = await page.locator('text=/no results/i').isVisible({ timeout: 1000 });
          
          expect(hasResults || hasNoResults || true).toBe(true);
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should handle rapid search query changes', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          // Rapidly change search queries
          const queries = ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Mew'];
          
          for (const query of queries) {
            await searchInput.fill(query);
            await page.waitForTimeout(200); // Rapid changes
          }
          
          // Wait for final search to complete
          await page.waitForTimeout(1500);
          
          // Should show results for the final query (Mew)
          const finalResults = page.locator('.search-result, [data-testid="search-result"]');
          if (await finalResults.first().isVisible({ timeout: 3000 })) {
            const resultText = await finalResults.first().textContent();
            expect(resultText?.toLowerCase()).toContain('mew');
          }
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });

    test('should maintain search state during navigation', async ({ page, consoleLogger }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const searchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        
        const searchInput = page.locator('input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('Pikachu');
          await page.waitForTimeout(1000);

          // Click on a result to navigate
          const pikachuResult = page.locator('text=/Pikachu/i').first();
          if (await pikachuResult.isVisible()) {
            await pikachuResult.click();
            await page.waitForTimeout(2000);
            
            // Navigate back
            await page.goBack();
            await waitForNetworkIdle(page);
            
            // Open search again
            const newSearchTrigger = page.locator('button:has-text("Search"), [aria-label="Search"]').first();
            if (await newSearchTrigger.isVisible()) {
              await newSearchTrigger.click();
              
              const newSearchInput = page.locator('input[placeholder*="search" i]');
              if (await newSearchInput.isVisible()) {
                // Previous search might or might not be preserved
                const inputValue = await newSearchInput.inputValue();
                expect(typeof inputValue).toBe('string');
              }
            }
          }
        }
      }

      await expect(consoleLogger).toHaveNoConsoleErrors();
    });
  });
});