/**
 * ThemeContext - Focused context for theme management
 * Split from UnifiedAppContext for performance optimization (GAMMA-003)
 *
 * This context only causes re-renders when theme changes,
 * not when favorites, modals, or other state changes.
 */

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { ThemeMode } from './modules/types';
import { createPersistState, createThemeManager } from './modules/storageUtils';

// Theme context value interface
export interface ThemeContextValue {
  theme: ThemeMode;
  mounted: boolean;
  toggleTheme: () => void;
  updateTheme: (theme: ThemeMode) => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Storage key for theme
const THEME_STORAGE_KEY = 'dextrends-theme';

// Get initial theme from localStorage or system preference
function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    // Check system preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {
    // localStorage not available
  }

  return 'light';
}

// Provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

// Theme Provider Component
export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(() => defaultTheme ?? getInitialTheme());
  const [mounted, setMounted] = useState(false);

  // Create utilities
  const persistState = createPersistState();
  const { applyTheme } = createThemeManager(persistState);

  // Mark as mounted (SSR compatibility)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to DOM when mounted or theme changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);

      // Also persist to localStorage
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (e) {
        // localStorage not available
      }
    }
  }, [theme, mounted, applyTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Set specific theme
  const updateTheme = useCallback((newTheme: ThemeMode) => {
    setTheme(newTheme);
  }, []);

  const value: ThemeContextValue = {
    theme,
    mounted,
    toggleTheme,
    updateTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

// Safe hook that doesn't throw (for components that might be outside provider)
export function useThemeContextSafe(): ThemeContextValue | null {
  return useContext(ThemeContext) ?? null;
}

export default ThemeContext;
