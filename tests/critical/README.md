# Critical User Path Tests

This directory contains comprehensive end-to-end tests for critical user journeys that must always work correctly. These tests focus on core functionality that users rely on daily.

## Test Files Overview

### 1. `favorites-comprehensive.spec.ts` (22 tests)
Tests the complete favorites functionality including:
- **Adding Items to Favorites** (3 tests)
  - Pokemon from detail pages
  - TCG cards from modals
  - Visual feedback and state changes

- **Removing Items from Favorites** (4 tests)
  - Individual item removal
  - Bulk operations
  - Confirmation dialogs

- **Data Persistence** (3 tests)
  - Cross-session persistence
  - Multi-tab synchronization
  - Error handling for storage failures

- **Filtering and Sorting** (3 tests)
  - Type-based filtering
  - Multiple sort criteria
  - Search within favorites

- **Mobile Responsiveness** (2 tests)
  - Touch interactions
  - Swipe gestures for management

- **Error Handling and Edge Cases** (7 tests)
  - Empty state handling
  - Network failure resilience
  - Rapid interaction handling

### 2. `search-comprehensive.spec.ts` (26 tests)
Tests the global search functionality including:
- **Global Search Modal** (4 tests)
  - Opening from navigation
  - Keyboard shortcuts
  - Modal closing behaviors

- **Search Functionality** (6 tests)
  - Pokemon search with results
  - TCG card search
  - Set search
  - Empty results handling
  - Search suggestions
  - Input debouncing

- **Search Filters and Advanced Features** (4 tests)
  - Type filtering
  - Rarity filtering
  - Combined filter search
  - Filter clearing

- **Search Navigation and UX** (4 tests)
  - Keyboard navigation
  - Loading states
  - Result highlighting
  - Result count display

- **Error Handling and Edge Cases** (8 tests)
  - API failure handling
  - Special character support
  - Long query handling
  - Rapid query changes
  - Navigation state preservation

### 3. `pokemon-tabs-comprehensive.spec.ts` (25 tests)
Tests Pokemon detail page tab functionality including:
- **Tab Navigation and Visibility** (4 tests)
  - All tabs display correctly
  - Active tab highlighting
  - Tab persistence after refresh
  - Keyboard navigation

- **Tab Content Loading** (8 tests)
  - Overview tab content
  - Stats tab with charts
  - Evolution chain display
  - Moves list with filtering
  - Breeding information
  - Location data
  - Competitive analysis
  - TCG cards integration

- **Tab Switching Performance** (3 tests)
  - Fast switching without lag
  - Lazy content loading
  - Rapid switching stability

- **Deep Linking and URL State** (2 tests)
  - Direct tab links
  - URL updates on tab change

- **Error Handling and Edge Cases** (4 tests)
  - Missing Pokemon handling
  - Tab content loading failures
  - Slow network adaptation
  - Screen reader accessibility

- **Mobile Responsiveness** (2 tests)
  - Mobile tab interaction
  - Tab overflow handling

## Testing Philosophy

### Focus Areas
1. **User-Critical Paths**: Features users depend on daily
2. **Data Persistence**: Ensuring user data is never lost
3. **Error Resilience**: Graceful handling of failures
4. **Cross-Device Support**: Mobile and desktop compatibility
5. **Accessibility**: Screen reader and keyboard support

### Test Characteristics
- **Reliable**: Tests use robust selectors and wait strategies
- **Comprehensive**: Cover happy paths, edge cases, and error states
- **User-Focused**: Test actual user behaviors, not implementation details
- **Performance-Aware**: Monitor loading times and responsiveness
- **Accessible**: Verify ARIA attributes and keyboard navigation

### Error Handling Strategy
Each test includes:
- Console error monitoring via `consoleLogger`
- Graceful fallbacks for missing features
- Network failure simulation
- Edge case coverage (empty states, rapid interactions)

## Running the Tests

```bash
# Run all critical tests
npm test tests/critical/

# Run specific test suite
npm test tests/critical/favorites-comprehensive.spec.ts
npm test tests/critical/search-comprehensive.spec.ts
npm test tests/critical/pokemon-tabs-comprehensive.spec.ts

# Run with UI for debugging
npm run test:ui tests/critical/

# Run in headed mode to watch execution
npm run test:headed tests/critical/
```

## Success Metrics

These tests ensure:
- ✅ 0 console errors during normal operations
- ✅ All critical user flows complete successfully
- ✅ Data persistence works across sessions
- ✅ Mobile users have full functionality
- ✅ Error states provide helpful feedback
- ✅ Performance remains acceptable under load

## Maintenance Notes

### When to Update Tests
- New features added to favorites/search/tabs
- UI component changes that affect selectors
- API endpoint changes
- New error scenarios discovered

### Test Data Dependencies
- Tests use well-known Pokemon (Pikachu #25, Charizard, etc.)
- TCG set tests use stable sets (sv1, base-set)
- Mock data provided for API failures

### Browser Compatibility
Tests run on:
- Chromium (primary)
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

These tests form the foundation of quality assurance for DexTrends' most important user experiences.