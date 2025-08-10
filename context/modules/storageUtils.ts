// Storage utilities for context persistence

import { useCallback } from 'react';

// Create a persistent state utility
export const createPersistState = () => {
  return useCallback((key: string, value: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to persist ${key}:`, error);
      }
    }
  }, []);
};

// Theme management utilities
export const createThemeManager = (persistState: (key: string, value: any) => void) => {
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, []);

  return { applyTheme };
};