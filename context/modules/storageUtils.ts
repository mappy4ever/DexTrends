// Storage utilities for context persistence
import logger from '../../utils/logger';

// Create a persistent state utility
export const createPersistState = () => {
  return (key: string, value: unknown) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        logger.warn(`Failed to persist ${key}:`, error);
      }
    }
  };
};

// Theme management utilities
export const createThemeManager = (persistState: (key: string, value: unknown) => void) => {
  const applyTheme = (theme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  };

  return { applyTheme };
};