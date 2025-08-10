// State initialization utilities - extracted from UnifiedAppContext.tsx

import { State } from './types';

// Get initial state from localStorage if available (client-side only)
export const getInitialState = (): State => {
  const baseState: State = {
    user: {
      preferences: {
        theme: 'light',
        fontSize: 'medium',
        animations: true,
        colorContrast: 'normal',
        autoplayMedia: true,
        tooltips: true,
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          largeText: false,
          keyboardNavigation: true,
          screenReaderMode: false,
          focusIndicators: true,
          autoPlay: true,
          skipLinks: true,
          altTextAlways: false
        }
      },
      favorites: {
        pokemon: [],
        cards: [],
        decks: []
      },
      behavior: {
        interactionCount: 0,
        scrollDepth: 0,
        timeOnPage: 0,
        lastInteraction: null,
        visitCount: 0,
        preferredCardView: 'grid',
        favoriteCategories: [],
        searchHistory: [],
        recentActions: [],
        dismissedTooltips: []
      }
    },
    app: {
      ui: {
        sorting: {
          pokemon: { field: 'id', direction: 'asc' },
          cards: { field: 'name', direction: 'asc' }
        },
        view: {
          pokemonView: 'grid',
          cardSize: 'regular',
          cardView: 'grid',
          showAnimations: true
        },
        modal: {
          isOpen: false,
          type: null,
          data: null
        },
        contextualHelp: {
          showOnboarding: false,
          showTooltips: true,
          currentStep: 0,
          completedTours: [],
          currentTour: null
        }
      },
      performance: {
        metrics: {},
        monitoring: true,
        vitals: {},
        apiMetrics: {},
        isMonitoring: false,
        suggestions: [],
        testResults: null
      }
    },
    loading: {
      favorites: false,
      theme: false,
      view: false
    }
  };

  // Only attempt to load from localStorage on client side
  if (typeof window === 'undefined') {
    return baseState;
  }

  try {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      baseState.user.preferences.theme = savedTheme;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      baseState.user.preferences.theme = prefersDark ? 'dark' : 'light';
    }

    // Load favorites
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      baseState.user.favorites = { ...baseState.user.favorites, ...favorites };
    }

    // Load view settings
    const savedViewSettings = localStorage.getItem('viewSettings');
    if (savedViewSettings) {
      const viewSettings = JSON.parse(savedViewSettings);
      baseState.app.ui.view = { ...baseState.app.ui.view, ...viewSettings };
    }

    // Load sorting settings
    const savedSorting = localStorage.getItem('sorting');
    if (savedSorting) {
      const sorting = JSON.parse(savedSorting);
      baseState.app.ui.sorting = { ...baseState.app.ui.sorting, ...sorting };
    }

    // Load contextual help
    const savedHelp = localStorage.getItem('contextual-help');
    if (savedHelp) {
      const contextualHelp = JSON.parse(savedHelp);
      baseState.app.ui.contextualHelp = { ...baseState.app.ui.contextualHelp, ...contextualHelp };
    }

    // Load UX preferences
    const savedUXPrefs = localStorage.getItem('ux-preferences');
    if (savedUXPrefs) {
      const uxPrefs = JSON.parse(savedUXPrefs);
      baseState.user.preferences = { ...baseState.user.preferences, ...uxPrefs };
    }

    // Load user behavior data
    const savedBehavior = localStorage.getItem('user-behavior');
    if (savedBehavior) {
      const behavior = JSON.parse(savedBehavior);
      baseState.user.behavior = { 
        ...baseState.user.behavior, 
        ...behavior,
        visitCount: (behavior.visitCount || 0) + 1,
        timeOnPage: Date.now()
      };
    } else {
      // First visit
      baseState.user.behavior.visitCount = 1;
      baseState.user.behavior.timeOnPage = Date.now();
    }
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
  }

  return baseState;
};