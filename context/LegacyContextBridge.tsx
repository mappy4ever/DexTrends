/**
 * LegacyContextBridge - Maintains backward compatibility with UnifiedAppContext
 *
 * This component bridges the new focused contexts to provide the same
 * interface as the original UnifiedAppContext. This allows gradual migration
 * without breaking existing components.
 *
 * DEPRECATION NOTICE: This bridge is temporary. Components should migrate
 * to use the focused context hooks directly for better performance.
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useThemeContext } from './ThemeContext';
import { useFavoritesContext } from './FavoritesContext';
import { useUIContext } from './UIContext';
import { usePreferencesContext } from './PreferencesContext';
import { useOnboardingContext } from './OnboardingContext';
import { usePerformanceContext } from './PerformanceContext';
import {
  UnifiedAppContextValue,
  State,
  PersonalizedRecommendations,
  PerformanceOptimizations,
  AccessibilityEnhancements
} from './modules/types';

// Create the legacy context
const LegacyUnifiedAppContext = createContext<UnifiedAppContextValue | undefined>(undefined);

interface LegacyContextBridgeProps {
  children: ReactNode;
}

/**
 * LegacyContextBridge combines all focused contexts into the original
 * UnifiedAppContext interface for backward compatibility.
 */
export function LegacyContextBridge({ children }: LegacyContextBridgeProps) {
  // Get all focused context values
  const theme = useThemeContext();
  const favorites = useFavoritesContext();
  const ui = useUIContext();
  const preferences = usePreferencesContext();
  const onboarding = useOnboardingContext();
  const performance = usePerformanceContext();

  // Reconstruct the legacy State object
  const state: State = useMemo(() => ({
    user: {
      preferences: preferences.preferences,
      favorites: favorites.favorites,
      behavior: onboarding.behavior
    },
    app: {
      ui: {
        sorting: ui.sorting,
        view: ui.viewSettings,
        modal: ui.modal,
        contextualHelp: onboarding.contextualHelp
      },
      performance: performance.performance
    },
    loading: {
      favorites: false,
      theme: false,
      view: false
    }
  }), [
    preferences.preferences,
    favorites.favorites,
    onboarding.behavior,
    ui.sorting,
    ui.viewSettings,
    ui.modal,
    onboarding.contextualHelp,
    performance.performance
  ]);

  // Personalization functions (computed from state)
  const getPersonalizedRecommendations = useMemo(() => {
    return (): PersonalizedRecommendations => {
      const isAdvanced = onboarding.behavior.interactionCount > 100;
      return {
        suggestedView: onboarding.behavior.preferredCardView,
        recommendedCategories: onboarding.behavior.favoriteCategories.slice(0, 5),
        suggestedSearches: onboarding.behavior.searchHistory.slice(0, 5),
        adaptiveLayout: isAdvanced ? 'advanced' : 'beginner'
      };
    };
  }, [onboarding.behavior]);

  const optimizeForPerformance = useMemo(() => {
    return (): PerformanceOptimizations => {
      const vitals = performance.performance.vitals as Record<string, number> | undefined;
      const fcp = vitals?.['FCP'] ?? 0;
      const isSlowDevice = fcp > 3000;
      return {
        enablePrefetching: !isSlowDevice,
        enableAnimations: preferences.preferences.animations && !isSlowDevice,
        lazyLoadImages: true,
        virtualizeGrids: true,
        cacheStrategy: isSlowDevice ? 'aggressive' : 'conservative'
      };
    };
  }, [performance.performance.vitals, preferences.preferences.animations]);

  const getAccessibilityEnhancements = useMemo(() => {
    return (): AccessibilityEnhancements => {
      const a11y = preferences.preferences.accessibility;
      return {
        focusVisible: a11y.focusIndicators,
        highContrast: a11y.highContrast,
        screenReaderOptimized: a11y.screenReaderMode,
        keyboardNavigation: a11y.keyboardNavigation,
        reducedMotion: a11y.reducedMotion,
        fontSize: preferences.preferences.fontSize
      };
    };
  }, [preferences.preferences]);

  // Construct the legacy context value
  const value: UnifiedAppContextValue = useMemo(() => ({
    // State
    state,
    mounted: theme.mounted,

    // Theme
    theme: theme.theme,
    toggleTheme: theme.toggleTheme,
    updateTheme: theme.updateTheme,

    // Favorites
    favorites: favorites.favorites,
    addToFavorites: favorites.addToFavorites,
    removeFromFavorites: favorites.removeFromFavorites,
    updateFavorites: favorites.updateFavorites,

    // View Settings
    viewSettings: ui.viewSettings,
    updateViewSettings: ui.updateViewSettings,

    // Sorting
    sorting: ui.sorting,
    updateSorting: ui.updateSorting,

    // Modal
    modal: ui.modal,
    openModal: ui.openModal,
    closeModal: ui.closeModal,

    // Performance
    performance: performance.performance,
    updatePerformanceMetrics: performance.updatePerformanceMetrics,
    updatePerformanceVitals: performance.updatePerformanceVitals,
    updateApiMetrics: performance.updateApiMetrics,
    enablePerformanceMonitoring: performance.enablePerformanceMonitoring,
    disablePerformanceMonitoring: performance.disablePerformanceMonitoring,

    // Behavior
    behavior: onboarding.behavior,
    trackInteraction: onboarding.trackInteraction,
    trackUserAction: onboarding.trackUserAction,

    // UX and Preferences
    userPreferences: preferences.preferences,
    updatePreference: preferences.updatePreference,
    updateAccessibilitySettings: preferences.updateAccessibilitySettings,

    // Contextual Help and Onboarding
    contextualHelp: onboarding.contextualHelp,
    startOnboarding: onboarding.startOnboarding,
    completeOnboardingStep: onboarding.completeOnboardingStep,
    completeOnboarding: onboarding.completeOnboarding,
    shouldShowTooltip: onboarding.shouldShowTooltip,
    dismissTooltip: onboarding.dismissTooltip,

    // Personalization
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements,

    // Loading states
    loading: state.loading
  }), [
    state,
    theme,
    favorites,
    ui,
    performance,
    onboarding,
    preferences,
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements
  ]);

  return (
    <LegacyUnifiedAppContext.Provider value={value}>
      {children}
    </LegacyUnifiedAppContext.Provider>
  );
}

/**
 * useLegacyAppContext - For components that still use the old interface
 * @deprecated Use focused hooks instead (useThemeContext, useFavoritesContext, etc.)
 */
export function useLegacyAppContext(): UnifiedAppContextValue {
  const context = useContext(LegacyUnifiedAppContext);
  if (!context) {
    throw new Error('useLegacyAppContext must be used within a LegacyContextBridge');
  }
  return context;
}

export { LegacyUnifiedAppContext };
export default LegacyContextBridge;
