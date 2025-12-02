/**
 * PreferencesContext - Focused context for user preferences & accessibility
 * Split from UnifiedAppContext for performance optimization (GAMMA-003)
 */

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { UserPreferences, AccessibilitySettings } from './modules/types';

// Preferences context value interface
export interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreference: (key: keyof UserPreferences, value: unknown) => void;
  updateAccessibilitySettings: (key: keyof AccessibilitySettings, value: unknown) => void;
  resetPreferences: () => void;
}

// Create the context
const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

// Storage key
const PREFERENCES_STORAGE_KEY = 'dextrends-preferences';

// Default accessibility settings
const defaultAccessibility: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  keyboardNavigation: true,
  screenReaderMode: false,
  focusIndicators: true,
  autoPlay: true,
  skipLinks: true,
  altTextAlways: false
};

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'light', // Note: Theme is managed by ThemeContext, this is for reference
  fontSize: 'medium',
  animations: true,
  colorContrast: 'normal',
  autoplayMedia: true,
  tooltips: true,
  accessibility: defaultAccessibility
};

// Get initial preferences from localStorage
function getInitialPreferences(): UserPreferences {
  if (typeof window === 'undefined') return defaultPreferences;

  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultPreferences,
        ...parsed,
        accessibility: {
          ...defaultAccessibility,
          ...(parsed.accessibility || {})
        }
      };
    }
  } catch (e) {
    // localStorage not available
  }

  return defaultPreferences;
}

// Provider props
interface PreferencesProviderProps {
  children: ReactNode;
}

// Preferences Provider Component
export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(getInitialPreferences);

  // Persist preferences to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      // localStorage not available
    }
  }, [preferences]);

  // Update a single preference
  const updatePreference = useCallback((
    key: keyof UserPreferences,
    value: unknown
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update accessibility settings
  const updateAccessibilitySettings = useCallback((
    key: keyof AccessibilitySettings,
    value: unknown
  ) => {
    setPreferences(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: value
      }
    }));
  }, []);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  const value: PreferencesContextValue = {
    preferences,
    updatePreference,
    updateAccessibilitySettings,
    resetPreferences
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

// Hook to use preferences context
export function usePreferencesContext(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferencesContext must be used within a PreferencesProvider');
  }
  return context;
}

// Safe hook that doesn't throw
export function usePreferencesContextSafe(): PreferencesContextValue | null {
  return useContext(PreferencesContext) ?? null;
}

// Convenience hook for accessibility settings
export function useAccessibilityContext() {
  const { preferences, updateAccessibilitySettings } = usePreferencesContext();
  return {
    accessibility: preferences.accessibility,
    updateAccessibility: updateAccessibilitySettings
  };
}

export default PreferencesContext;
