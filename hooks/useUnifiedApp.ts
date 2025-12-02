/**
 * Unified App Context hooks - OPTIMIZED for performance (GAMMA-003)
 *
 * These hooks now use focused contexts internally, providing the same
 * interface while avoiding unnecessary re-renders.
 *
 * Each hook only subscribes to the context it needs:
 * - useFavorites() only re-renders on favorites changes
 * - useTheme() only re-renders on theme changes
 * - useModal() only re-renders on modal changes
 */

import { useThemeContext } from '../context/ThemeContext';
import { useFavoritesContext } from '../context/FavoritesContext';
import { useUIContext } from '../context/UIContext';
import { usePerformanceContext } from '../context/PerformanceContext';

/**
 * useFavorites - Get favorites state and actions
 * Only re-renders when favorites change (not on theme or modal changes)
 */
export const useFavorites = () => {
  const context = useFavoritesContext();
  return {
    favorites: context.favorites,
    addToFavorites: context.addToFavorites,
    removeFromFavorites: context.removeFromFavorites,
    updateFavorites: context.updateFavorites,
    // Bonus: new helper methods
    isFavorite: context.isFavorite,
    getFavoriteCount: context.getFavoriteCount
  };
};

/**
 * useTheme - Get theme state and actions
 * Only re-renders when theme changes (not on favorites or modal changes)
 */
export const useTheme = () => {
  const context = useThemeContext();
  return {
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    updateTheme: context.updateTheme,
    // Bonus: mounted state for SSR
    mounted: context.mounted
  };
};

/**
 * useModal - Get modal state and actions
 * Only re-renders when modal state changes
 */
export const useModal = () => {
  const { modal, openModal, closeModal } = useUIContext();
  return {
    modal,
    openModal,
    closeModal
  };
};

/**
 * useSorting - Get sorting state and actions
 * Only re-renders when sorting changes
 */
export const useSorting = () => {
  const { sorting, updateSorting } = useUIContext();
  return {
    sorting,
    updateSorting
  };
};

/**
 * useViewSettings - Get view settings and actions
 * Only re-renders when view settings change
 */
export const useViewSettings = () => {
  const { viewSettings, updateViewSettings } = useUIContext();
  return {
    viewSettings,
    updateViewSettings
  };
};

/**
 * usePerformanceMonitor - Get performance monitoring state and actions
 * Only re-renders when performance metrics change
 */
export const usePerformanceMonitor = () => {
  const context = usePerformanceContext();
  return {
    performance: context.performance,
    updatePerformanceMetrics: context.updatePerformanceMetrics,
    updatePerformanceVitals: context.updatePerformanceVitals,
    updateApiMetrics: context.updateApiMetrics,
    enablePerformanceMonitoring: context.enablePerformanceMonitoring,
    disablePerformanceMonitoring: context.disablePerformanceMonitoring,
    // Bonus: summary helper
    getPerformanceSummary: context.getPerformanceSummary
  };
};
