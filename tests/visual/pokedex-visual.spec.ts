import { visualTest as test, STANDARD_VIEWPORTS, COMMON_MASKS } from '../helpers/visual-regression';
import { waitForNetworkIdle } from '../helpers/test-utils';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';

test.describe('Pokedex Visual Regression', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
    await page.goto('/pokedex');
    await waitForNetworkIdle(page);
    await pageHelpers.waitForLoadingComplete();
  });

  test('pokedex grid layout', async ({ page, visualRegression }) => {
    await visualRegression.compareSnapshot('pokedex-grid', {
      fullPage: false,
      mask: [
        COMMON_MASKS.loadingStates,
        { selector: '.pokemon-sprite' }, // Sprites might load at different times
      ],
    });
  });

  test('pokemon card hover states', async ({ page, visualRegression }) => {
    const pokemonCard = page.locator('[data-testid="pokemon-card"]').or(page.locator('.pokemon-card')).first();
    
    // Default state
    await visualRegression.compareElementSnapshot(
      '[data-testid="pokemon-card"]',
      'pokemon-card-default'
    );

    // Hover state
    await pokemonCard.hover();
    await page.waitForTimeout(300);
    await visualRegression.compareElementSnapshot(
      '[data-testid="pokemon-card"]',
      'pokemon-card-hover'
    );
  });

  test('pokemon detail page', async ({ page, visualRegression }) => {
    await pageHelpers.goToPokemonDetail('25'); // Pikachu
    await waitForNetworkIdle(page);

    await visualRegression.compareSnapshot('pokemon-detail-pikachu', {
      fullPage: true,
      mask: [
        COMMON_MASKS.dynamicCounts,
        { selector: '[data-testid="evolution-chain"]' }, // May have animations
      ],
    });
  });

  test('type filter UI', async ({ page, visualRegression }) => {
    // Capture filter dropdown/modal
    const typeFilter = page.locator('[data-testid="type-filter"]').or(page.locator('select[name="type"]')).first();
    
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await page.waitForTimeout(300);
      
      await visualRegression.compareSnapshot('type-filter-open', {
        fullPage: false,
      });
    }
  });

  test('search results', async ({ page, visualRegression }) => {
    await pageHelpers.searchPokemon('char');
    await page.waitForTimeout(1000);

    await visualRegression.compareSnapshot('search-results-char', {
      fullPage: false,
      mask: [COMMON_MASKS.loadingStates],
    });
  });

  test('pokemon sprites loading', async ({ page, visualRegression }) => {
    // Force slow network to capture loading states
    await page.route('**/*.png', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.reload();
    
    // Capture loading placeholders
    await visualRegression.compareSnapshot('pokemon-sprites-loading', {
      fullPage: false,
      animations: 'allow',
    });
  });

  test('responsive pokemon grid', async ({ page, visualRegression }) => {
    await visualRegression.compareResponsiveSnapshot(
      'pokedex-grid-responsive',
      [
        STANDARD_VIEWPORTS.mobile,
        STANDARD_VIEWPORTS.tablet,
        STANDARD_VIEWPORTS.desktop,
      ],
      {
        mask: [
          COMMON_MASKS.loadingStates,
          { selector: '.pokemon-sprite' },
        ],
      }
    );
  });

  test('pokemon forms and variants', async ({ page, visualRegression }) => {
    await pageHelpers.goToPokemonDetail('386'); // Deoxys (has forms)
    await waitForNetworkIdle(page);

    // Capture form selector if visible
    const formSelector = page.locator('[data-testid="form-selector"]').or(page.locator('.form-selector'));
    if (await formSelector.isVisible()) {
      await visualRegression.compareElementSnapshot(
        '[data-testid="form-selector"]',
        'pokemon-form-selector'
      );
    }
  });

  test('stats visualization', async ({ page, visualRegression }) => {
    await pageHelpers.goToPokemonDetail('6'); // Charizard
    await waitForNetworkIdle(page);

    const statsSection = page.locator('[data-testid="pokemon-stats"]').or(page.locator('.stats-section'));
    if (await statsSection.isVisible()) {
      await visualRegression.compareElementSnapshot(
        '[data-testid="pokemon-stats"]',
        'pokemon-stats-chart',
        {
          animations: 'disabled', // Disable stat bar animations
        }
      );
    }
  });

  test('evolution chain', async ({ page, visualRegression }) => {
    await pageHelpers.goToPokemonDetail('1'); // Bulbasaur
    await waitForNetworkIdle(page);

    const evolutionChain = page.locator('[data-testid="evolution-chain"]').or(page.locator('.evolution-chain'));
    if (await evolutionChain.isVisible()) {
      await visualRegression.compareElementSnapshot(
        '[data-testid="evolution-chain"]',
        'evolution-chain-display'
      );
    }
  });
});