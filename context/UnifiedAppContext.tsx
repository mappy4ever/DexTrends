import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';

// Types
type ThemeMode = 'light' | 'dark';
type SortDirection = 'asc' | 'desc';
type ViewType = 'grid' | 'list';
type CardSize = 'small' | 'regular' | 'large';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  focusIndicators: boolean;
  autoPlay: boolean;
  skipLinks: boolean;
  altTextAlways: boolean;
}

interface UserPreferences {
  theme: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  colorContrast: 'normal' | 'high';
  autoplayMedia: boolean;
  tooltips: boolean;
  accessibility: AccessibilitySettings;
}

interface UserBehavior {
  interactionCount: number;
  scrollDepth: number;
  timeOnPage: number;
  lastInteraction: number | null;
  visitCount: number;
  preferredCardView: ViewType;
  favoriteCategories: string[];
  searchHistory: string[];
  recentActions: UserAction[];
  dismissedTooltips: string[];
}

interface UserAction {
  action: string;
  timestamp: number;
  page: string;
  [key: string]: any;
}

interface FavoritesState {
  pokemon: any[];
  cards: any[];
  decks: any[];
}

interface UserState {
  preferences: UserPreferences;
  favorites: FavoritesState;
  behavior: UserBehavior;
}

interface SortingState {
  pokemon: { field: string; direction: SortDirection };
  cards: { field: string; direction: SortDirection };
}

interface ViewSettings {
  pokemonView: ViewType;
  cardSize: CardSize;
  cardView: ViewType;
  showAnimations: boolean;
}

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: any;
}

interface ContextualHelp {
  showOnboarding: boolean;
  showTooltips: boolean;
  currentStep: number;
  completedTours: string[];
  currentTour: string | null;
}

interface UIState {
  sorting: SortingState;
  view: ViewSettings;
  modal: ModalState;
  contextualHelp: ContextualHelp;
}

interface PerformanceMetrics {
  [key: string]: any;
}

interface PerformanceState {
  metrics: PerformanceMetrics;
  monitoring: boolean;
  vitals: PerformanceMetrics;
  apiMetrics: PerformanceMetrics;
  isMonitoring: boolean;
  suggestions: string[];
  testResults: any;
}

interface AppState {
  ui: UIState;
  performance: PerformanceState;
}

interface LoadingState {
  favorites: boolean;
  theme: boolean;
  view: boolean;
}

interface State {
  user: UserState;
  app: AppState;
  loading: LoadingState;
}

interface PersonalizedRecommendations {
  suggestedView: ViewType;
  recommendedCategories: string[];
  suggestedSearches: string[];
  adaptiveLayout: 'advanced' | 'beginner';
}

interface PerformanceOptimizations {
  enablePrefetching: boolean;
  enableAnimations: boolean;
  lazyLoadImages: boolean;
  virtualizeGrids: boolean;
  cacheStrategy: 'aggressive' | 'conservative';
}

interface AccessibilityEnhancements {
  focusVisible: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface UnifiedAppContextValue {
  // State
  state: State;
  mounted: boolean;
  
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  updateTheme: (newTheme: ThemeMode) => void;
  
  // Favorites
  favorites: FavoritesState;
  addToFavorites: (type: keyof FavoritesState, item: any) => void;
  removeFromFavorites: (type: keyof FavoritesState, itemId: string | number) => void;
  updateFavorites: (favorites: Partial<FavoritesState>) => void;
  
  // View Settings
  viewSettings: ViewSettings;
  updateViewSettings: (viewSettings: Partial<ViewSettings>) => void;
  
  // Sorting
  sorting: SortingState;
  updateSorting: (sorting: Partial<SortingState>) => void;
  
  // Modal
  modal: ModalState;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  
  // Performance
  performance: PerformanceState;
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  updatePerformanceVitals: (vitals: Partial<PerformanceMetrics>) => void;
  updateApiMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  enablePerformanceMonitoring: () => void;
  disablePerformanceMonitoring: () => void;
  
  // Behavior
  behavior: UserBehavior;
  trackInteraction: () => void;
  trackUserAction: (action: string, data?: Record<string, any>) => void;
  
  // UX and Preferences
  userPreferences: UserPreferences;
  updatePreference: (key: keyof UserPreferences, value: any) => void;
  updateAccessibilitySettings: (key: keyof AccessibilitySettings, value: any) => void;
  
  // Contextual Help and Onboarding
  contextualHelp: ContextualHelp;
  startOnboarding: (tourId: string) => void;
  completeOnboardingStep: () => void;
  completeOnboarding: (tourId: string) => void;
  shouldShowTooltip: (tooltipId: string) => boolean;
  dismissTooltip: (tooltipId: string) => void;
  
  // Personalization
  getPersonalizedRecommendations: () => PersonalizedRecommendations;
  optimizeForPerformance: () => PerformanceOptimizations;
  getAccessibilityEnhancements: () => AccessibilityEnhancements;
  
  // Loading states
  loading: LoadingState;
}

// Get initial state from localStorage if available (client-side only)
const getInitialState = (): State => {
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

// Unified App Context for consolidating state management
const UnifiedAppContext = createContext<UnifiedAppContextValue | undefined>(undefined);

// Custom hook to use the unified context
export function useAppContext(): UnifiedAppContextValue {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    throw new Error('useAppContext must be used within a UnifiedAppProvider');
  }
  return context;
}

interface UnifiedAppProviderProps {
  children: ReactNode;
}

export function UnifiedAppProvider({ children }: UnifiedAppProviderProps) {
  // Initialize state with localStorage data if available
  const [state, setState] = useState<State>(getInitialState);
  const [mounted, setMounted] = useState(false);

  // SSR compatibility - mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme class when mounted or theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentTheme = state.user.preferences.theme;
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Also set the theme in localStorage for consistency
      localStorage.setItem('theme', currentTheme);
    }
  }, [state.user.preferences.theme]);

  // Persist state to localStorage
  const persistState = useCallback((key: string, value: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to persist ${key}:`, error);
      }
    }
  }, []);

  // Theme actions
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
  }, [persistState]);

  const toggleTheme = useCallback(() => {
    const newTheme = state.user.preferences.theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  }, [state.user.preferences.theme, updateTheme]);

  // Favorites actions
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
  }, [persistState]);

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
  }, [persistState]);

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
  }, [persistState]);

  // View settings actions
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
  }, [persistState]);

  // Sorting actions
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
  }, [persistState]);

  // Modal actions
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
  }, []);

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
  }, []);

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

  // Behavior tracking
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
  }, [persistState]);

  // UX Preferences
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
  }, [persistState]);

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
  }, [persistState]);

  // Contextual Help and Onboarding
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
  }, [persistState]);

  const shouldShowTooltip = useCallback((tooltipId: string): boolean => {
    return state.app.ui.contextualHelp.showTooltips && 
           !state.user.behavior.dismissedTooltips.includes(tooltipId);
  }, [state.app.ui.contextualHelp.showTooltips, state.user.behavior.dismissedTooltips]);

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
  }, [persistState]);

  // Personalization
  const getPersonalizedRecommendations = useCallback((): PersonalizedRecommendations => {
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
  }, [state.user.behavior]);

  const optimizeForPerformance = useCallback((): PerformanceOptimizations => {
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
  }, [state.app.performance.metrics, state.user.preferences.animations]);

  const getAccessibilityEnhancements = useCallback((): AccessibilityEnhancements => {
    const { accessibility } = state.user.preferences;
    
    return {
      focusVisible: accessibility.focusIndicators,
      highContrast: accessibility.highContrast,
      screenReaderOptimized: accessibility.screenReaderMode,
      keyboardNavigation: accessibility.keyboardNavigation,
      reducedMotion: accessibility.reducedMotion,
      fontSize: state.user.preferences.fontSize
    };
  }, [state.user.preferences]);

  // Legacy hooks for backward compatibility
  const useFavorites = () => ({
    favorites: state.user.favorites,
    addToFavorites,
    removeFromFavorites,
    updateFavorites
  });

  const useTheme = () => ({
    theme: state.user.preferences.theme,
    toggleTheme,
    updateTheme
  });

  const useModal = () => ({
    modal: state.app.ui.modal,
    openModal,
    closeModal
  });

  const useSorting = () => ({
    sorting: state.app.ui.sorting,
    updateSorting
  });

  const useViewSettings = () => ({
    viewSettings: state.app.ui.view,
    updateViewSettings
  });

  const usePerformanceMonitor = () => ({
    performance: state.app.performance,
    updatePerformanceMetrics,
    updatePerformanceVitals,
    updateApiMetrics,
    enablePerformanceMonitoring,
    disablePerformanceMonitoring
  });

  const value: UnifiedAppContextValue = {
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
    <UnifiedAppContext.Provider value={value}>
      {children}
    </UnifiedAppContext.Provider>
  );
}

// Export legacy hooks for backward compatibility
export const useFavorites = () => {
  const context = useAppContext();
  return {
    favorites: context.favorites,
    addToFavorites: context.addToFavorites,
    removeFromFavorites: context.removeFromFavorites,
    updateFavorites: context.updateFavorites
  };
};

export const useTheme = () => {
  const context = useAppContext();
  return {
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    updateTheme: context.updateTheme
  };
};

export const useModal = () => {
  const context = useAppContext();
  return {
    modal: context.modal,
    openModal: context.openModal,
    closeModal: context.closeModal
  };
};

export const useSorting = () => {
  const context = useAppContext();
  return {
    sorting: context.sorting,
    updateSorting: context.updateSorting
  };
};

export const useViewSettings = () => {
  const context = useAppContext();
  return {
    viewSettings: context.viewSettings,
    updateViewSettings: context.updateViewSettings
  };
};

export const usePerformanceMonitor = () => {
  const context = useAppContext();
  return {
    performance: context.performance,
    updatePerformanceMetrics: context.updatePerformanceMetrics,
    updatePerformanceVitals: context.updatePerformanceVitals,
    updateApiMetrics: context.updateApiMetrics,
    enablePerformanceMonitoring: context.enablePerformanceMonitoring,
    disablePerformanceMonitoring: context.disablePerformanceMonitoring
  };
};