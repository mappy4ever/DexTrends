/**
 * AppProviders - Combines all focused context providers
 * This is the new recommended way to wrap your app
 *
 * Split from UnifiedAppContext for performance optimization (GAMMA-003)
 *
 * Provider order matters for dependencies:
 * 1. ThemeProvider - No dependencies
 * 2. PreferencesProvider - May use theme
 * 3. FavoritesProvider - Independent
 * 4. UIProvider - Independent
 * 5. OnboardingProvider - May track UI interactions
 * 6. PerformanceProvider - Should be innermost (monitors everything)
 */

import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { FavoritesProvider } from './FavoritesContext';
import { UIProvider } from './UIContext';
import { PreferencesProvider } from './PreferencesContext';
import { OnboardingProvider } from './OnboardingContext';
import { PerformanceProvider } from './PerformanceContext';

interface AppProvidersProps {
  children: ReactNode;
  /**
   * Enable performance monitoring by default
   * @default false
   */
  enablePerformanceMonitoring?: boolean;
}

/**
 * AppProviders wraps all focused context providers in the correct order.
 *
 * Usage in _app.tsx:
 * ```tsx
 * import { AppProviders } from '@/context/AppProviders';
 *
 * function MyApp({ Component, pageProps }) {
 *   return (
 *     <AppProviders>
 *       <Component {...pageProps} />
 *     </AppProviders>
 *   );
 * }
 * ```
 */
export function AppProviders({
  children,
  enablePerformanceMonitoring = false
}: AppProvidersProps) {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <FavoritesProvider>
          <UIProvider>
            <OnboardingProvider>
              <PerformanceProvider initialMonitoring={enablePerformanceMonitoring}>
                {children}
              </PerformanceProvider>
            </OnboardingProvider>
          </UIProvider>
        </FavoritesProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

/**
 * Re-export individual providers for custom composition
 */
export { ThemeProvider } from './ThemeContext';
export { FavoritesProvider } from './FavoritesContext';
export { UIProvider } from './UIContext';
export { PreferencesProvider } from './PreferencesContext';
export { OnboardingProvider } from './OnboardingContext';
export { PerformanceProvider } from './PerformanceContext';

/**
 * Re-export hooks for convenience
 */
export { useThemeContext, useThemeContextSafe } from './ThemeContext';
export { useFavoritesContext, useFavoritesContextSafe } from './FavoritesContext';
export { useUIContext, useUIContextSafe, useViewSettingsContext, useSortingContext, useModalContext } from './UIContext';
export { usePreferencesContext, usePreferencesContextSafe, useAccessibilityContext } from './PreferencesContext';
export { useOnboardingContext, useOnboardingContextSafe } from './OnboardingContext';
export { usePerformanceContext, usePerformanceContextSafe } from './PerformanceContext';

export default AppProviders;
