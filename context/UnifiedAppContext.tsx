import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';

// Import types and utilities from modules
import { 
  UnifiedAppContextValue, 
  State,
  ThemeMode
} from './modules/types';
import { getInitialState } from './modules/stateInitializer';
import { createPersistState, createThemeManager } from './modules/storageUtils';
import {
  createThemeActions,
  createFavoritesActions,
  createViewActions,
  createModalActions,
  createPerformanceActions,
  createBehaviorActions,
  createPreferenceActions,
  createOnboardingActions,
  createPersonalizationActions
} from './modules/actions';

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

  // Create utilities
  const persistState = createPersistState();
  const { applyTheme } = createThemeManager(persistState);

  // Create action creators
  const { updateTheme, toggleTheme } = createThemeActions(setState, persistState);
  const { addToFavorites, removeFromFavorites, updateFavorites } = createFavoritesActions(setState, persistState);
  const { updateViewSettings, updateSorting } = createViewActions(setState, persistState);
  const { openModal, closeModal } = createModalActions(setState);
  const {
    updatePerformanceMetrics,
    updatePerformanceVitals,
    updateApiMetrics,
    enablePerformanceMonitoring,
    disablePerformanceMonitoring
  } = createPerformanceActions(setState);
  const { trackInteraction, trackUserAction } = createBehaviorActions(setState, persistState);
  const { updatePreference, updateAccessibilitySettings } = createPreferenceActions(setState, persistState);
  const {
    startOnboarding,
    completeOnboardingStep,
    completeOnboarding,
    shouldShowTooltip,
    dismissTooltip
  } = createOnboardingActions(setState, persistState);
  const {
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements
  } = createPersonalizationActions();

  // SSR compatibility - mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme when mounted or theme changes
  useEffect(() => {
    if (mounted) {
      applyTheme(state.user.preferences.theme);
    }
  }, [state.user.preferences.theme, mounted, applyTheme]);

  // Create wrapped functions that pass state when needed
  const wrappedToggleTheme = useCallback(() => {
    toggleTheme(state.user.preferences.theme);
  }, [toggleTheme, state.user.preferences.theme]);

  const wrappedShouldShowTooltip = useCallback((tooltipId: string): boolean => {
    return shouldShowTooltip(tooltipId, state);
  }, [shouldShowTooltip, state]);

  const wrappedGetPersonalizedRecommendations = useCallback(() => {
    return getPersonalizedRecommendations(state);
  }, [getPersonalizedRecommendations, state]);

  const wrappedOptimizeForPerformance = useCallback(() => {
    return optimizeForPerformance(state);
  }, [optimizeForPerformance, state]);

  const wrappedGetAccessibilityEnhancements = useCallback(() => {
    return getAccessibilityEnhancements(state);
  }, [getAccessibilityEnhancements, state]);

  const value: UnifiedAppContextValue = {
    // State
    state,
    mounted,
    
    // Theme
    theme: state.user.preferences.theme,
    toggleTheme: wrappedToggleTheme,
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
    shouldShowTooltip: wrappedShouldShowTooltip,
    dismissTooltip,
    
    // Personalization
    getPersonalizedRecommendations: wrappedGetPersonalizedRecommendations,
    optimizeForPerformance: wrappedOptimizeForPerformance,
    getAccessibilityEnhancements: wrappedGetAccessibilityEnhancements,
    
    // Loading states
    loading: state.loading
  };

  return (
    <UnifiedAppContext.Provider value={value}>
      {children}
    </UnifiedAppContext.Provider>
  );
}

// Export legacy hooks for backward compatibility - moved to /hooks/useUnifiedApp.ts
export { useFavorites, useTheme, useModal, useSorting, useViewSettings, usePerformanceMonitor } from '../hooks/useUnifiedApp';