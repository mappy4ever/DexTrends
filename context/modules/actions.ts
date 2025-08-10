// Action creators for context state management

import { useCallback } from 'react';
import { 
  State, 
  ThemeMode, 
  FavoritesState, 
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
  persistState: (key: string, value: any) => void
) => {
  const updateTheme = useCallback((newTheme: ThemeMode) => {
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
  }, [setState, persistState]);

  const toggleTheme = useCallback((currentTheme: ThemeMode) => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  }, [updateTheme]);

  return { updateTheme, toggleTheme };
};

export const createFavoritesActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: any) => void
) => {
  const addToFavorites = useCallback((type: keyof FavoritesState, item: any) => {
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
  }, [setState, persistState]);

  const removeFromFavorites = useCallback((type: keyof FavoritesState, itemId: string | number) => {
    setState(prev => {
      const newFavorites = {
        ...prev.user.favorites,
        [type]: prev.user.favorites[type].filter((item: any) => 
          (typeof item === 'object' && item.id !== itemId) || item !== itemId
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
  }, [setState, persistState]);

  const updateFavorites = useCallback((favorites: Partial<FavoritesState>) => {
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
  }, [setState, persistState]);

  return { addToFavorites, removeFromFavorites, updateFavorites };
};

export const createViewActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: any) => void
) => {
  const updateViewSettings = useCallback((viewSettings: Partial<ViewSettings>) => {
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
  }, [setState, persistState]);

  const updateSorting = useCallback((sorting: Partial<SortingState>) => {
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
  }, [setState, persistState]);

  return { updateViewSettings, updateSorting };
};

export const createModalActions = (
  setState: React.Dispatch<React.SetStateAction<State>>
) => {
  const openModal = useCallback((type: string, data?: any) => {
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
  }, [setState]);

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
  }, [setState]);

  return { openModal, closeModal };
};

export const createPerformanceActions = (
  setState: React.Dispatch<React.SetStateAction<State>>
) => {
  const updatePerformanceMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
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
  }, [setState]);

  const updatePerformanceVitals = useCallback((vitals: Partial<PerformanceMetrics>) => {
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
  }, [setState]);

  const updateApiMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
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
  }, [setState]);

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
  }, [setState]);

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
  }, [setState]);

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
  persistState: (key: string, value: any) => void
) => {
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
  }, [setState]);

  const trackUserAction = useCallback((action: string, data?: Record<string, any>) => {
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
  }, [setState, persistState]);

  return { trackInteraction, trackUserAction };
};

export const createPreferenceActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: any) => void
) => {
  const updatePreference = useCallback((key: keyof UserPreferences, value: any) => {
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
  }, [setState, persistState]);

  const updateAccessibilitySettings = useCallback((key: keyof AccessibilitySettings, value: any) => {
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
  }, [setState, persistState]);

  return { updatePreference, updateAccessibilitySettings };
};

export const createOnboardingActions = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  persistState: (key: string, value: any) => void
) => {
  const startOnboarding = useCallback((tourId: string) => {
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
  }, [setState]);

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
  }, [setState]);

  const completeOnboarding = useCallback((tourId: string) => {
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
  }, [setState, persistState]);

  const shouldShowTooltip = useCallback((tooltipId: string, state: State): boolean => {
    return state.app.ui.contextualHelp.showTooltips && 
           !state.user.behavior.dismissedTooltips.includes(tooltipId);
  }, []);

  const dismissTooltip = useCallback((tooltipId: string) => {
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
  }, [setState, persistState]);

  return {
    startOnboarding,
    completeOnboardingStep,
    completeOnboarding,
    shouldShowTooltip,
    dismissTooltip
  };
};

export const createPersonalizationActions = () => {
  const getPersonalizedRecommendations = useCallback((state: State): PersonalizedRecommendations => {
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
  }, []);

  const optimizeForPerformance = useCallback((state: State): PerformanceOptimizations => {
    const { metrics } = state.app.performance;
    const connectionSpeed = metrics.connectionSpeed || 'unknown';
    const deviceMemory = metrics.deviceMemory || 8;
    
    const isSlowConnection = connectionSpeed === 'slow' || connectionSpeed === '2g' || connectionSpeed === '3g';
    const isLowMemory = deviceMemory < 4;
    
    return {
      enablePrefetching: !isSlowConnection,
      enableAnimations: !isSlowConnection && !isLowMemory && state.user.preferences.animations,
      lazyLoadImages: true,
      virtualizeGrids: isLowMemory || isSlowConnection,
      cacheStrategy: isSlowConnection ? 'aggressive' : 'conservative'
    };
  }, []);

  const getAccessibilityEnhancements = useCallback((state: State): AccessibilityEnhancements => {
    const { accessibility } = state.user.preferences;
    
    return {
      focusVisible: accessibility.focusIndicators,
      highContrast: accessibility.highContrast,
      screenReaderOptimized: accessibility.screenReaderMode,
      keyboardNavigation: accessibility.keyboardNavigation,
      reducedMotion: accessibility.reducedMotion,
      fontSize: state.user.preferences.fontSize
    };
  }, []);

  return {
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements
  };
};