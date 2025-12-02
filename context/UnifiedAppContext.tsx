/**
 * UnifiedAppContext - REFACTORED for performance (GAMMA-003)
 *
 * This file now uses the split focused contexts internally while
 * maintaining the same external API for backward compatibility.
 *
 * For better performance, components should migrate to use focused hooks:
 * - useThemeContext() instead of useAppContext().theme
 * - useFavoritesContext() instead of useAppContext().favorites
 * - useUIContext() instead of useAppContext().modal
 *
 * The old useAppContext() still works but causes more re-renders.
 */

import React, { ReactNode } from 'react';
import { UnifiedAppContextValue } from './modules/types';

// Import the new providers
import { AppProviders } from './AppProviders';
import { LegacyContextBridge, useLegacyAppContext, LegacyUnifiedAppContext } from './LegacyContextBridge';

// Re-export the legacy context for direct access if needed
export const UnifiedAppContext = LegacyUnifiedAppContext;

/**
 * useAppContext - The original hook, now backed by focused contexts
 * @deprecated For better performance, use focused hooks instead:
 * - useThemeContext() for theme
 * - useFavoritesContext() for favorites
 * - useUIContext() for modal, view, sorting
 */
export function useAppContext(): UnifiedAppContextValue {
  return useLegacyAppContext();
}

interface UnifiedAppProviderProps {
  children: ReactNode;
  /**
   * Enable performance monitoring by default
   * @default false
   */
  enablePerformanceMonitoring?: boolean;
}

/**
 * UnifiedAppProvider - Now uses focused providers internally
 *
 * This provider wraps all the new focused providers and includes
 * the LegacyContextBridge for backward compatibility.
 *
 * Components using useAppContext() will continue to work unchanged.
 */
export function UnifiedAppProvider({
  children,
  enablePerformanceMonitoring = false
}: UnifiedAppProviderProps) {
  return (
    <AppProviders enablePerformanceMonitoring={enablePerformanceMonitoring}>
      <LegacyContextBridge>
        {children}
      </LegacyContextBridge>
    </AppProviders>
  );
}

// Export legacy hooks for backward compatibility
export { useFavorites, useTheme, useModal, useSorting, useViewSettings, usePerformanceMonitor } from '../hooks/useUnifiedApp';

// Export new focused hooks for migration
export { useThemeContext, useThemeContextSafe } from './ThemeContext';
export { useFavoritesContext, useFavoritesContextSafe } from './FavoritesContext';
export { useUIContext, useUIContextSafe, useViewSettingsContext, useSortingContext, useModalContext } from './UIContext';
export { usePreferencesContext, usePreferencesContextSafe, useAccessibilityContext } from './PreferencesContext';
export { useOnboardingContext, useOnboardingContextSafe } from './OnboardingContext';
export { usePerformanceContext, usePerformanceContextSafe } from './PerformanceContext';

// Export AppProviders for direct use
export { AppProviders } from './AppProviders';
