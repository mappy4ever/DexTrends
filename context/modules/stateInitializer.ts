// State initialization utilities - extracted from UnifiedAppContext.tsx

import { State } from './types';
import logger from '../../utils/logger';

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

  // Helper function to safely parse JSON from localStorage
  const safeParseJSON = (key: string, fallback: any = null): any => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      
      // Check if it's valid JSON before parsing
      if (item.startsWith('{') || item.startsWith('[')) {
        return JSON.parse(item);
      }
      return fallback;
    } catch (error) {
      logger.warn(`Failed to parse localStorage item: ${key}`, { error });
      // Remove corrupted item
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore removal errors
      }
      return fallback;
    }
  };

  try {
    // Load theme with validation
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      baseState.user.preferences.theme = savedTheme;
    } else if (savedTheme) {
      // Remove invalid theme
      localStorage.removeItem('theme');
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      baseState.user.preferences.theme = prefersDark ? 'dark' : 'light';
    }

    // Load favorites with validation
    const favorites = safeParseJSON('favorites', {});
    if (favorites && typeof favorites === 'object') {
      baseState.user.favorites = { 
        pokemon: Array.isArray(favorites.pokemon) ? favorites.pokemon : [],
        cards: Array.isArray(favorites.cards) ? favorites.cards : [],
        decks: Array.isArray(favorites.decks) ? favorites.decks : []
      };
    }

    // Load view settings with validation
    const viewSettings = safeParseJSON('viewSettings', {});
    if (viewSettings && typeof viewSettings === 'object') {
      baseState.app.ui.view = { ...baseState.app.ui.view, ...viewSettings };
    }

    // Load sorting settings with validation
    const sorting = safeParseJSON('sorting', {});
    if (sorting && typeof sorting === 'object') {
      baseState.app.ui.sorting = { ...baseState.app.ui.sorting, ...sorting };
    }

    // Load contextual help with validation
    const contextualHelp = safeParseJSON('contextual-help', {});
    if (contextualHelp && typeof contextualHelp === 'object') {
      baseState.app.ui.contextualHelp = { ...baseState.app.ui.contextualHelp, ...contextualHelp };
    }

    // Load UX preferences with validation
    const uxPrefs = safeParseJSON('ux-preferences', {});
    if (uxPrefs && typeof uxPrefs === 'object') {
      baseState.user.preferences = { ...baseState.user.preferences, ...uxPrefs };
    }

    // Load user behavior data with validation
    const behavior = safeParseJSON('user-behavior', {});
    if (behavior && typeof behavior === 'object') {
      baseState.user.behavior = { 
        ...baseState.user.behavior, 
        ...behavior,
        visitCount: (typeof behavior.visitCount === 'number' ? behavior.visitCount : 0) + 1,
        timeOnPage: Date.now()
      };
    } else {
      // First visit
      baseState.user.behavior.visitCount = 1;
      baseState.user.behavior.timeOnPage = Date.now();
    }
  } catch (error) {
    logger.error('Critical error loading persisted state:', { error });
    // Clear all localStorage if there's a critical error
    try {
      localStorage.clear();
      logger.info('Cleared localStorage due to critical error');
    } catch (e) {
      // Ignore clear errors
    }
  }

  return baseState;
};