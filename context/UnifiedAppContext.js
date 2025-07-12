import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Unified App Context for consolidating state management
const UnifiedAppContext = createContext();

// Custom hook to use the unified context
export function useAppContext() {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    throw new Error('useAppContext must be used within a UnifiedAppProvider');
  }
  return context;
}

// Consolidated state shape integrating all context providers
const initialState = {
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

export function UnifiedAppProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [mounted, setMounted] = useState(false);

  // SSR compatibility
  useEffect(() => {
    setMounted(true);
    loadPersistedState();
  }, []);

  // Load persisted state from localStorage
  const loadPersistedState = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load theme
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            preferences: {
              ...prev.user.preferences,
              theme: savedTheme
            }
          }
        }));
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            preferences: {
              ...prev.user.preferences,
              theme: prefersDark ? 'dark' : 'light'
            }
          }
        }));
      }

      // Load favorites
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            favorites: { ...prev.user.favorites, ...favorites }
          }
        }));
      }

      // Load view settings
      const savedViewSettings = localStorage.getItem('viewSettings');
      if (savedViewSettings) {
        const viewSettings = JSON.parse(savedViewSettings);
        setState(prev => ({
          ...prev,
          app: {
            ...prev.app,
            ui: {
              ...prev.app.ui,
              view: { ...prev.app.ui.view, ...viewSettings }
            }
          }
        }));
      }

      // Load sorting settings
      const savedSorting = localStorage.getItem('sorting');
      if (savedSorting) {
        const sorting = JSON.parse(savedSorting);
        setState(prev => ({
          ...prev,
          app: {
            ...prev.app,
            ui: {
              ...prev.app.ui,
              sorting: { ...prev.app.ui.sorting, ...sorting }
            }
          }
        }));
      }

      // Load contextual help
      const savedHelp = localStorage.getItem('contextual-help');
      if (savedHelp) {
        const contextualHelp = JSON.parse(savedHelp);
        setState(prev => ({
          ...prev,
          app: {
            ...prev.app,
            ui: {
              ...prev.app.ui,
              contextualHelp: { ...prev.app.ui.contextualHelp, ...contextualHelp }
            }
          }
        }));
      }

      // Load UX preferences
      const savedUXPrefs = localStorage.getItem('ux-preferences');
      if (savedUXPrefs) {
        const uxPrefs = JSON.parse(savedUXPrefs);
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            preferences: { ...prev.user.preferences, ...uxPrefs }
          }
        }));
      }

      // Load user behavior data
      const savedBehavior = localStorage.getItem('user-behavior');
      if (savedBehavior) {
        const behavior = JSON.parse(savedBehavior);
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            behavior: { 
              ...prev.user.behavior, 
              ...behavior,
              visitCount: (behavior.visitCount || 0) + 1,
              timeOnPage: Date.now()
            }
          }
        }));
      } else {
        // First visit
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            behavior: {
              ...prev.user.behavior,
              visitCount: 1,
              timeOnPage: Date.now()
            }
          }
        }));
      }

    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }
  }, []);

  // Persist state to localStorage
  const persistState = useCallback((key, value) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to persist ${key}:`, error);
      }
    }
  }, []);

  // Theme actions
  const updateTheme = useCallback((newTheme) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        preferences: {
          ...prev.user.preferences,
          theme: newTheme
        }
      }
    }));
    persistState('theme', newTheme);
  }, [persistState]);

  const toggleTheme = useCallback(() => {
    const currentTheme = state.user.preferences.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  }, [state.user.preferences.theme, updateTheme]);

  // Favorites actions
  const updateFavorites = useCallback((favorites) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        favorites: { ...prev.user.favorites, ...favorites }
      }
    }));
    persistState('favorites', favorites);
  }, [persistState]);

  const addToFavorites = useCallback((type, item) => {
    setState(prev => {
      const newFavorites = {
        ...prev.user.favorites,
        [type]: [...prev.user.favorites[type], item]
      };
      persistState('favorites', newFavorites);
      return {
        ...prev,
        user: {
          ...prev.user,
          favorites: newFavorites
        }
      };
    });
  }, [persistState]);

  const removeFromFavorites = useCallback((type, itemId) => {
    setState(prev => {
      const newFavorites = {
        ...prev.user.favorites,
        [type]: prev.user.favorites[type].filter(item => 
          typeof item === 'object' ? item.id !== itemId : item !== itemId
        )
      };
      persistState('favorites', newFavorites);
      return {
        ...prev,
        user: {
          ...prev.user,
          favorites: newFavorites
        }
      };
    });
  }, [persistState]);

  // View settings actions
  const updateViewSettings = useCallback((viewSettings) => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        ui: {
          ...prev.app.ui,
          view: { ...prev.app.ui.view, ...viewSettings }
        }
      }
    }));
    persistState('viewSettings', viewSettings);
  }, [persistState]);

  // Sorting actions
  const updateSorting = useCallback((sorting) => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        ui: {
          ...prev.app.ui,
          sorting: { ...prev.app.ui.sorting, ...sorting }
        }
      }
    }));
    persistState('sorting', sorting);
  }, [persistState]);

  // Modal actions
  const openModal = useCallback((type, data = null) => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        ui: {
          ...prev.app.ui,
          modal: { isOpen: true, type, data }
        }
      }
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        ui: {
          ...prev.app.ui,
          modal: { isOpen: false, type: null, data: null }
        }
      }
    }));
  }, []);

  // Performance actions
  const updatePerformanceMetrics = useCallback((metrics) => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        performance: {
          ...prev.app.performance,
          metrics: { ...prev.app.performance.metrics, ...metrics }
        }
      }
    }));
  }, []);

  // Enhanced behavior tracking from EnhancedUXProvider
  const trackInteraction = useCallback(() => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        behavior: {
          ...prev.user.behavior,
          interactionCount: prev.user.behavior.interactionCount + 1,
          lastInteraction: Date.now()
        }
      }
    }));
  }, []);

  const trackUserAction = useCallback((action, data = {}) => {
    const actionData = {
      action,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      ...data
    };

    setState(prev => {
      const recentActions = prev.user.behavior.recentActions || [];
      return {
        ...prev,
        user: {
          ...prev.user,
          behavior: {
            ...prev.user.behavior,
            recentActions: [actionData, ...recentActions].slice(0, 50)
          }
        }
      };
    });
  }, []);

  // UX and accessibility methods
  const updatePreference = useCallback((key, value) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        preferences: {
          ...prev.user.preferences,
          [key]: value
        }
      }
    }));
  }, []);

  const updateAccessibilitySettings = useCallback((key, value) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        preferences: {
          ...prev.user.preferences,
          accessibility: {
            ...prev.user.preferences.accessibility,
            [key]: value
          }
        }
      }
    }));
  }, []);

  // Contextual help methods
  const startOnboarding = useCallback((tourId) => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        ui: {
          ...prev.app.ui,
          contextualHelp: {
            ...prev.app.ui.contextualHelp,
            showOnboarding: true,
            currentTour: tourId,
            currentStep: 0
          }
        }
      }
    }));
  }, []);

  const completeOnboardingStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        ui: {
          ...prev.app.ui,
          contextualHelp: {
            ...prev.app.ui.contextualHelp,
            currentStep: prev.app.ui.contextualHelp.currentStep + 1
          }
        }
      }
    }));
  }, []);

  const completeOnboarding = useCallback((tourId) => {
    setState(prev => {
      const newContextualHelp = {
        ...prev.app.ui.contextualHelp,
        showOnboarding: false,
        completedTours: [...prev.app.ui.contextualHelp.completedTours, tourId],
        currentTour: null,
        currentStep: 0
      };
      
      persistState('contextual-help', newContextualHelp);
      
      return {
        ...prev,
        app: {
          ...prev.app,
          ui: {
            ...prev.app.ui,
            contextualHelp: newContextualHelp
          }
        }
      };
    });
  }, [persistState]);

  const shouldShowTooltip = useCallback((tooltipId) => {
    if (!state.user.preferences.tooltips) return false;
    
    const dismissedTooltips = state.user.behavior.dismissedTooltips || [];
    return !dismissedTooltips.includes(tooltipId);
  }, [state.user.preferences.tooltips, state.user.behavior.dismissedTooltips]);

  const dismissTooltip = useCallback((tooltipId) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        behavior: {
          ...prev.user.behavior,
          dismissedTooltips: [...(prev.user.behavior.dismissedTooltips || []), tooltipId]
        }
      }
    }));
  }, []);

  // Performance methods
  const updatePerformanceVitals = useCallback((vitals) => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        performance: {
          ...prev.app.performance,
          vitals: { ...prev.app.performance.vitals, ...vitals }
        }
      }
    }));
  }, []);

  const updateApiMetrics = useCallback((metrics) => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        performance: {
          ...prev.app.performance,
          apiMetrics: { ...prev.app.performance.apiMetrics, ...metrics }
        }
      }
    }));
  }, []);

  const enablePerformanceMonitoring = useCallback(() => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        performance: {
          ...prev.app.performance,
          isMonitoring: true
        }
      }
    }));
  }, []);

  const disablePerformanceMonitoring = useCallback(() => {
    setState(prev => ({
      ...prev,
      app: {
        ...prev.app,
        performance: {
          ...prev.app.performance,
          isMonitoring: false
        }
      }
    }));
  }, []);

  // Personalization methods
  const getPersonalizedRecommendations = useCallback(() => {
    const { favoriteCategories, preferredCardView, searchHistory, interactionCount } = state.user.behavior;
    
    return {
      suggestedView: preferredCardView,
      recommendedCategories: favoriteCategories.slice(0, 3),
      suggestedSearches: searchHistory.slice(0, 5),
      adaptiveLayout: interactionCount > 100 ? 'advanced' : 'beginner'
    };
  }, [state.user.behavior]);

  const optimizeForPerformance = useCallback(() => {
    const { visitCount, interactionCount } = state.user.behavior;
    const { animations, accessibility } = state.user.preferences;
    
    return {
      enablePrefetching: visitCount > 5,
      enableAnimations: animations && !accessibility.reducedMotion,
      lazyLoadImages: true,
      virtualizeGrids: interactionCount > 50,
      cacheStrategy: visitCount > 10 ? 'aggressive' : 'conservative'
    };
  }, [state.user.behavior, state.user.preferences]);

  const getAccessibilityEnhancements = useCallback(() => {
    const { accessibility, keyboardNavigation, fontSize } = state.user.preferences;
    
    return {
      focusVisible: accessibility.focusIndicators,
      highContrast: accessibility.highContrast,
      screenReaderOptimized: accessibility.screenReaderMode,
      keyboardNavigation: accessibility.keyboardNavigation,
      reducedMotion: accessibility.reducedMotion,
      fontSize: fontSize
    };
  }, [state.user.preferences]);

  // Consolidated context value
  const contextValue = {
    // State
    state,
    mounted,
    
    // Theme
    theme: state.user.preferences.theme,
    toggleTheme,
    updateTheme,
    
    // Favorites
    favorites: state.user.favorites,
    addToFavorites,
    removeFromFavorites,
    updateFavorites,
    
    // View Settings
    viewSettings: state.app.ui.view,
    updateViewSettings,
    
    // Sorting
    sorting: state.app.ui.sorting,
    updateSorting,
    
    // Modal
    modal: state.app.ui.modal,
    openModal,
    closeModal,
    
    // Performance
    performance: state.app.performance,
    updatePerformanceMetrics,
    updatePerformanceVitals,
    updateApiMetrics,
    enablePerformanceMonitoring,
    disablePerformanceMonitoring,
    
    // Behavior
    behavior: state.user.behavior,
    trackInteraction,
    trackUserAction,
    
    // UX and Preferences
    userPreferences: state.user.preferences,
    updatePreference,
    updateAccessibilitySettings,
    
    // Contextual Help and Onboarding
    contextualHelp: state.app.ui.contextualHelp,
    startOnboarding,
    completeOnboardingStep,
    completeOnboarding,
    shouldShowTooltip,
    dismissTooltip,
    
    // Personalization
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements,
    
    // Loading states
    loading: state.loading
  };

  return (
    <UnifiedAppContext.Provider value={contextValue}>
      {children}
    </UnifiedAppContext.Provider>
  );
}

// Legacy hook exports for backward compatibility during migration
export const useFavorites = () => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    return { 
      favorites: { pokemon: [], cards: [], decks: [] }, 
      addToFavorites: () => {}, 
      removeFromFavorites: () => {} 
    };
  }
  const { favorites, addToFavorites, removeFromFavorites } = context;
  return { favorites, addToFavorites, removeFromFavorites };
};

export const useTheme = () => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    // Return SSR-safe defaults when context is not available
    return { 
      theme: 'light', 
      toggleTheme: () => {}, 
      mounted: false 
    };
  }
  const { theme, toggleTheme, mounted } = context;
  return { theme: mounted ? theme : 'light', toggleTheme, mounted };
};

export const useViewSettings = () => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    return { 
      viewSettings: { pokemonView: 'grid', cardSize: 'regular', cardView: 'grid', showAnimations: true }, 
      updateViewSettings: () => {} 
    };
  }
  const { viewSettings, updateViewSettings } = context;
  return { viewSettings, updateViewSettings };
};

export const useSorting = () => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    return { 
      sorting: { pokemon: { field: 'id', direction: 'asc' }, cards: { field: 'name', direction: 'asc' } }, 
      updateSorting: () => {} 
    };
  }
  const { sorting, updateSorting } = context;
  return { sorting, updateSorting };
};

export const useModal = () => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    return { 
      modal: { isOpen: false, type: null, data: null }, 
      openModal: () => {}, 
      closeModal: () => {} 
    };
  }
  const { modal, openModal, closeModal } = context;
  return { modal, openModal, closeModal };
};

// Legacy hook for EnhancedUXProvider compatibility
export const useUX = () => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    return {
      userPreferences: { theme: 'light', fontSize: 'medium', animations: true },
      userBehavior: { interactionCount: 0, scrollDepth: 0, timeOnPage: 0 },
      contextualHelp: { showOnboarding: false, showTooltips: true, currentStep: 0, completedTours: [] },
      accessibilitySettings: { reducedMotion: false, highContrast: false, keyboardNavigation: true },
      updatePreference: () => {},
      updateAccessibilitySettings: () => {},
      trackUserAction: () => {},
      startOnboarding: () => {},
      completeOnboardingStep: () => {},
      completeOnboarding: () => {},
      shouldShowTooltip: () => false,
      dismissTooltip: () => {},
      getPersonalizedRecommendations: () => ({}),
      optimizeForPerformance: () => ({}),
      getAccessibilityEnhancements: () => ({})
    };
  }
  
  const { 
    userPreferences, 
    behavior, 
    contextualHelp, 
    updatePreference, 
    updateAccessibilitySettings,
    trackUserAction,
    startOnboarding,
    completeOnboardingStep,
    completeOnboarding,
    shouldShowTooltip,
    dismissTooltip,
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements
  } = context;
  
  return {
    userPreferences,
    userBehavior: behavior,
    contextualHelp,
    accessibilitySettings: userPreferences.accessibility,
    updatePreference,
    updateAccessibilitySettings,
    trackUserAction,
    startOnboarding,
    completeOnboardingStep,
    completeOnboarding,
    shouldShowTooltip,
    dismissTooltip,
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements
  };
};

// Legacy hook for PerformanceProvider compatibility
export const usePerformance = () => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    return {
      vitals: {},
      apiMetrics: {},
      isMonitoring: false,
      suggestions: [],
      testResults: null,
      enableOptimizations: () => {},
      disableOptimizations: () => {},
      updateVitals: () => {},
      updateApiMetrics: () => {}
    };
  }
  
  const { 
    performance,
    updatePerformanceVitals,
    updateApiMetrics,
    enablePerformanceMonitoring,
    disablePerformanceMonitoring
  } = context;
  
  return {
    vitals: performance.vitals,
    apiMetrics: performance.apiMetrics,
    isMonitoring: performance.isMonitoring,
    suggestions: performance.suggestions,
    testResults: performance.testResults,
    enableOptimizations: enablePerformanceMonitoring,
    disableOptimizations: disablePerformanceMonitoring,
    updateVitals: updatePerformanceVitals,
    updateApiMetrics
  };
};

export default UnifiedAppProvider;