// Action creators for context state management
import { 
  State, 
  ThemeMode, 
  FavoritesState,
  FavoritePokemon,
  FavoriteCard,
  FavoriteDeck,
  ViewSettings, 
  SortingState, 
  PerformanceMetrics,
  UserPreferences,
  AccessibilitySettings,
  UserAction,
  PersonalizedRecommendations,
  PerformanceOptimizations,
  AccessibilityEnhancements
} from './types';

export const createThemeActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: unknown) => void
) => {
  const updateTheme = (newTheme: ThemeMode) => {
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
  };

  const toggleTheme = (currentTheme: ThemeMode) => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  return { updateTheme, toggleTheme };
};

export const createFavoritesActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: unknown) => void
) => {
  const addToFavorites = (type: keyof FavoritesState, item: FavoritePokemon | FavoriteCard | FavoriteDeck) => {
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
  };

  const removeFromFavorites = (type: keyof FavoritesState, itemId: string | number) => {
    setState(prev => {
      const newFavorites = {
        ...prev.user.favorites,
        [type]: prev.user.favorites[type].filter((item: FavoritePokemon | FavoriteCard | FavoriteDeck) => 
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
  };

  const updateFavorites = (favorites: Partial<FavoritesState>) => {
    setState(prev => {
      const newFavorites = { ...prev.user.favorites, ...favorites };
      persistState('favorites', newFavorites);
      return {
        ...prev,
        user: {
          ...prev.user,
          favorites: newFavorites
        }
      };
    });
  };

  return { addToFavorites, removeFromFavorites, updateFavorites };
};

export const createViewActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: unknown) => void
) => {
  const updateViewSettings = (viewSettings: Partial<ViewSettings>) => {
    setState(prev => {
      const newViewSettings = { ...prev.app.ui.view, ...viewSettings };
      persistState('viewSettings', newViewSettings);
      return {
        ...prev,
        app: {
          ...prev.app,
          ui: {
            ...prev.app.ui,
            view: newViewSettings
          }
        }
      };
    });
  };

  const updateSorting = (sorting: Partial<SortingState>) => {
    setState(prev => {
      const newSorting = { ...prev.app.ui.sorting, ...sorting };
      persistState('sorting', newSorting);
      return {
        ...prev,
        app: {
          ...prev.app,
          ui: {
            ...prev.app.ui,
            sorting: newSorting
          }
        }
      };
    });
  };

  return { updateViewSettings, updateSorting };
};

export const createModalActions = (
  setState: React.Dispatch<React.SetStateAction<State>>
) => {
  const openModal = (type: string, data?: unknown) => {
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
  };

  const closeModal = () => {
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
  };

  return { openModal, closeModal };
};

export const createPerformanceActions = (
  setState: React.Dispatch<React.SetStateAction<State>>
) => {
  const updatePerformanceMetrics = (metrics: Partial<PerformanceMetrics>) => {
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
  };

  const updatePerformanceVitals = (vitals: Partial<PerformanceMetrics>) => {
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
  };

  const updateApiMetrics = (metrics: Partial<PerformanceMetrics>) => {
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
  };

  const enablePerformanceMonitoring = () => {
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
  };

  const disablePerformanceMonitoring = () => {
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
  };

  return {
    updatePerformanceMetrics,
    updatePerformanceVitals,
    updateApiMetrics,
    enablePerformanceMonitoring,
    disablePerformanceMonitoring
  };
};

export const createBehaviorActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: unknown) => void
) => {
  const trackInteraction = () => {
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
  };

  const trackUserAction = (action: string, data?: Record<string, any>) => {
    setState(prev => {
      const newAction: UserAction = {
        action,
        timestamp: Date.now(),
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        ...data
      };
      
      const recentActions = [newAction, ...prev.user.behavior.recentActions].slice(0, 50);
      const behavior = {
        ...prev.user.behavior,
        recentActions
      };
      
      persistState('user-behavior', behavior);
      
      return {
        ...prev,
        user: {
          ...prev.user,
          behavior
        }
      };
    });
  };

  return { trackInteraction, trackUserAction };
};

export const createPreferenceActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: unknown) => void
) => {
  const updatePreference = (key: keyof UserPreferences, value: unknown) => {
    setState(prev => {
      const newPreferences = {
        ...prev.user.preferences,
        [key]: value
      };
      persistState('ux-preferences', newPreferences);
      return {
        ...prev,
        user: {
          ...prev.user,
          preferences: newPreferences
        }
      };
    });
  };

  const updateAccessibilitySettings = (key: keyof AccessibilitySettings, value: unknown) => {
    setState(prev => {
      const newAccessibility = {
        ...prev.user.preferences.accessibility,
        [key]: value
      };
      const newPreferences = {
        ...prev.user.preferences,
        accessibility: newAccessibility
      };
      persistState('ux-preferences', newPreferences);
      return {
        ...prev,
        user: {
          ...prev.user,
          preferences: newPreferences
        }
      };
    });
  };

  return { updatePreference, updateAccessibilitySettings };
};

export const createOnboardingActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: unknown) => void
) => {
  const startOnboarding = (tourId: string) => {
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
  };

  const completeOnboardingStep = () => {
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
  };

  const completeOnboarding = (tourId: string) => {
    setState(prev => {
      const contextualHelp = {
        ...prev.app.ui.contextualHelp,
        showOnboarding: false,
        currentTour: null,
        currentStep: 0,
        completedTours: [...prev.app.ui.contextualHelp.completedTours, tourId]
      };
      persistState('contextual-help', contextualHelp);
      return {
        ...prev,
        app: {
          ...prev.app,
          ui: {
            ...prev.app.ui,
            contextualHelp
          }
        }
      };
    });
  };

  const shouldShowTooltip = (tooltipId: string, state: State): boolean => {
    return state.app.ui.contextualHelp.showTooltips && 
           !state.user.behavior.dismissedTooltips.includes(tooltipId);
  };

  const dismissTooltip = (tooltipId: string) => {
    setState(prev => {
      const behavior = {
        ...prev.user.behavior,
        dismissedTooltips: [...prev.user.behavior.dismissedTooltips, tooltipId]
      };
      persistState('user-behavior', behavior);
      return {
        ...prev,
        user: {
          ...prev.user,
          behavior
        }
      };
    });
  };

  return {
    startOnboarding,
    completeOnboardingStep,
    completeOnboarding,
    shouldShowTooltip,
    dismissTooltip
  };
};

export const createPersonalizationActions = () => {
  const getPersonalizedRecommendations = (state: State): PersonalizedRecommendations => {
    const { behavior } = state.user;
    const { visitCount, interactionCount, preferredCardView, favoriteCategories, searchHistory } = behavior;
    
    // Adaptive layout based on interaction patterns
    const adaptiveLayout = interactionCount > 100 || visitCount > 10 ? 'advanced' : 'beginner';
    
    // Suggested view based on usage
    const suggestedView = preferredCardView;
    
    // Recommended categories based on favorites and search
    const recommendedCategories = favoriteCategories.length > 0 
      ? favoriteCategories.slice(0, 3)
      : ['popular', 'trending', 'new'];
    
    // Suggested searches based on history
    const suggestedSearches = searchHistory.slice(0, 5);
    
    return {
      suggestedView,
      recommendedCategories,
      suggestedSearches,
      adaptiveLayout
    };
  };

  const optimizeForPerformance = (state: State): PerformanceOptimizations => {
    const { metrics } = state.app.performance;
    const connectionSpeed = metrics.connectionSpeed || 'unknown';
    const deviceMemory = typeof metrics.deviceMemory === 'number' ? metrics.deviceMemory : 8;
    
    const isSlowConnection = connectionSpeed === 'slow' || connectionSpeed === '2g' || connectionSpeed === '3g';
    const isLowMemory = deviceMemory < 4;
    
    return {
      enablePrefetching: !isSlowConnection,
      enableAnimations: !isSlowConnection && !isLowMemory && state.user.preferences.animations,
      lazyLoadImages: true,
      virtualizeGrids: isLowMemory || isSlowConnection,
      cacheStrategy: isSlowConnection ? 'aggressive' : 'conservative'
    };
  };

  const getAccessibilityEnhancements = (state: State): AccessibilityEnhancements => {
    const { accessibility } = state.user.preferences;
    
    return {
      focusVisible: accessibility.focusIndicators,
      highContrast: accessibility.highContrast,
      screenReaderOptimized: accessibility.screenReaderMode,
      keyboardNavigation: accessibility.keyboardNavigation,
      reducedMotion: accessibility.reducedMotion,
      fontSize: state.user.preferences.fontSize
    };
  };

  return {
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements
  };
};