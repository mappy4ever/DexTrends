// Unified App Context hooks
import { useAppContext } from '../context/UnifiedAppContext';

// Legacy hooks for backward compatibility
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