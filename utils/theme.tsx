import React, { createContext, useContext, useState, useEffect } from 'react';
import logger from '@/utils/logger';

/**
 * Unified Theming System
 * 
 * Features:
 * - Dark/Light mode with system preference
 * - Custom color schemes
 * - Dynamic theme switching
 * - Persistent preferences
 * - CSS variables integration
 * - Accessibility support
 */

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

interface ThemeConfig {
  theme: Theme;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'comfortable';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  animations: boolean;
  highContrast: boolean;
}

// Color schemes
const colorSchemes: Record<ColorScheme, { light: ThemeColors; dark: ThemeColors }> = {
  default: {
    light: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6'
    },
    dark: {
      primary: '#a78bfa',
      secondary: '#f472b6',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#34d399',
      info: '#60a5fa'
    }
  },
  ocean: {
    light: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#0891b2',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      textMuted: '#0369a1',
      border: '#bae6fd',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6'
    },
    dark: {
      primary: '#38bdf8',
      secondary: '#22d3ee',
      accent: '#06b6d4',
      background: '#082f49',
      surface: '#0c4a6e',
      text: '#e0f2fe',
      textMuted: '#7dd3fc',
      border: '#0284c7',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#34d399',
      info: '#60a5fa'
    }
  },
  forest: {
    light: {
      primary: '#16a34a',
      secondary: '#22c55e',
      accent: '#84cc16',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      textMuted: '#166534',
      border: '#bbf7d0',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6'
    },
    dark: {
      primary: '#4ade80',
      secondary: '#86efac',
      accent: '#bef264',
      background: '#052e16',
      surface: '#14532d',
      text: '#dcfce7',
      textMuted: '#86efac',
      border: '#16a34a',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#34d399',
      info: '#60a5fa'
    }
  },
  sunset: {
    light: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#fbbf24',
      background: '#fffbeb',
      surface: '#fef3c7',
      text: '#78350f',
      textMuted: '#92400e',
      border: '#fed7aa',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6'
    },
    dark: {
      primary: '#fb923c',
      secondary: '#fdba74',
      accent: '#fcd34d',
      background: '#451a03',
      surface: '#78350f',
      text: '#fef3c7',
      textMuted: '#fed7aa',
      border: '#ea580c',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#34d399',
      info: '#60a5fa'
    }
  },
  midnight: {
    light: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#a855f7',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#2e1065',
      textMuted: '#4c1d95',
      border: '#ddd6fe',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6'
    },
    dark: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      accent: '#c084fc',
      background: '#1e1b4b',
      surface: '#2e1065',
      text: '#f3e8ff',
      textMuted: '#c4b5fd',
      border: '#6366f1',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#34d399',
      info: '#60a5fa'
    }
  }
};

// Theme context
interface ThemeContextValue {
  config: ThemeConfig;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setSpacing: (spacing: 'compact' | 'normal' | 'comfortable') => void;
  setBorderRadius: (radius: 'none' | 'small' | 'medium' | 'large') => void;
  toggleAnimations: () => void;
  toggleHighContrast: () => void;
  resetTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme Provider
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // Load saved preferences
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('themeConfig');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    
    // Default config
    return {
      theme: 'system',
      colorScheme: 'default',
      colors: colorSchemes.default.light,
      fontSize: 'medium',
      spacing: 'normal',
      borderRadius: 'medium',
      animations: true,
      highContrast: false
    };
  });

  const [isDark, setIsDark] = useState(false);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const actualTheme = config.theme === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : config.theme;
    
    setIsDark(actualTheme === 'dark');
    
    // Apply color scheme
    const colors = colorSchemes[config.colorScheme][actualTheme];
    setConfig(prev => ({ ...prev, colors }));
    
    // Set CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply theme classes
    root.classList.toggle('dark', actualTheme === 'dark');
    root.classList.toggle('high-contrast', config.highContrast);
    root.classList.toggle('no-animations', !config.animations);
    
    // Font size classes
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    const fontSizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    }[config.fontSize];
    root.classList.add(fontSizeClass);
    
    // Spacing classes
    root.setAttribute('data-spacing', config.spacing);
    
    // Border radius
    root.setAttribute('data-radius', config.borderRadius);
    
    // Save preferences
    localStorage.setItem('themeConfig', JSON.stringify(config));
    
    logger.debug('Theme applied', { theme: actualTheme, config });
  }, [config]);

  // Listen for system theme changes
  useEffect(() => {
    if (config.theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      const colors = colorSchemes[config.colorScheme][newTheme];
      setConfig(prev => ({ ...prev, colors }));
      setIsDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.theme, config.colorScheme]);

  const contextValue: ThemeContextValue = {
    config,
    isDark,
    setTheme: (theme) => setConfig(prev => ({ ...prev, theme })),
    setColorScheme: (scheme) => setConfig(prev => ({ ...prev, colorScheme: scheme })),
    setFontSize: (size) => setConfig(prev => ({ ...prev, fontSize: size })),
    setSpacing: (spacing) => setConfig(prev => ({ ...prev, spacing })),
    setBorderRadius: (radius) => setConfig(prev => ({ ...prev, borderRadius: radius })),
    toggleAnimations: () => setConfig(prev => ({ ...prev, animations: !prev.animations })),
    toggleHighContrast: () => setConfig(prev => ({ ...prev, highContrast: !prev.highContrast })),
    resetTheme: () => {
      const defaultConfig: ThemeConfig = {
        theme: 'system',
        colorScheme: 'default',
        colors: colorSchemes.default.light,
        fontSize: 'medium',
        spacing: 'normal',
        borderRadius: 'medium',
        animations: true,
        highContrast: false
      };
      setConfig(defaultConfig);
      localStorage.removeItem('themeConfig');
    }
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Theme switcher component
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { config, setTheme, isDark } = useTheme();

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={className}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Get themed className
 */
export function getThemedClass(baseClass: string, variant?: string): string {
  const classes = [baseClass];
  
  if (variant) {
    classes.push(`${baseClass}--${variant}`);
  }
  
  return classes.join(' ');
}

/**
 * Pokemon type themed colors
 */
export const typeThemes = {
  normal: { light: '#A8A878', dark: '#C6C6A7' },
  fire: { light: '#F08030', dark: '#F5AC78' },
  water: { light: '#6890F0', dark: '#9DB7F5' },
  electric: { light: '#F8D030', dark: '#FAE078' },
  grass: { light: '#78C850', dark: '#A7DB8D' },
  ice: { light: '#98D8D8', dark: '#BCE6E6' },
  fighting: { light: '#C03028', dark: '#D67873' },
  poison: { light: '#A040A0', dark: '#C183C1' },
  ground: { light: '#E0C068', dark: '#EBD69D' },
  flying: { light: '#A890F0', dark: '#C6B7F5' },
  psychic: { light: '#F85888', dark: '#FA92B2' },
  bug: { light: '#A8B820', dark: '#C6D16E' },
  rock: { light: '#B8A038', dark: '#D1C17D' },
  ghost: { light: '#705898', dark: '#A292BC' },
  dragon: { light: '#7038F8', dark: '#A27DFA' },
  dark: { light: '#705848', dark: '#A29288' },
  steel: { light: '#B8B8D0', dark: '#D1D1E0' },
  fairy: { light: '#EE99AC', dark: '#F4BDC9' }
};

/**
 * Apply type-based theme
 */
export function useTypeTheme(type: keyof typeof typeThemes) {
  const { isDark } = useTheme();
  return typeThemes[type][isDark ? 'dark' : 'light'];
}