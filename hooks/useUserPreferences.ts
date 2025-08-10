/**
 * React Hook for User Preferences
 * Provides reactive access to user preferences with automatic updates
 */

import { useState, useEffect, useCallback } from 'react';
import {
  UserPreferences,
  userPreferencesManager,
  getUserPreferences,
  updateUserPreference,
  updateUserPreferences,
  subscribeToPreferences,
} from '../utils/userPreferences';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());

  useEffect(() => {
    // Subscribe to preference changes
    const unsubscribe = subscribeToPreferences((newPrefs) => {
      setPreferences(newPrefs);
    });

    return unsubscribe;
  }, []);

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    updateUserPreference(key, value);
  }, []);

  const updateMultiplePreferences = useCallback((updates: Partial<UserPreferences>) => {
    updateUserPreferences(updates);
  }, []);

  const resetToDefaults = useCallback(() => {
    userPreferencesManager.resetToDefaults();
  }, []);

  // Convenience getters
  const isHighContrast = preferences.highContrast;
  const isReducedMotion = preferences.reduceMotion;
  const theme = userPreferencesManager.getCurrentTheme();
  const isLowDataMode = preferences.enableLowDataMode;
  const isBatterySaver = preferences.enableBatterySaver;

  return {
    preferences,
    updatePreference,
    updateMultiplePreferences,
    resetToDefaults,
    // Convenience properties
    isHighContrast,
    isReducedMotion,
    theme,
    isLowDataMode,
    isBatterySaver,
  };
}

// Hook for specific preference
export function useUserPreference<K extends keyof UserPreferences>(key: K) {
  const { preferences, updatePreference } = useUserPreferences();
  
  const value = preferences[key];
  const setValue = useCallback((newValue: UserPreferences[K]) => {
    updatePreference(key, newValue);
  }, [key, updatePreference]);

  return [value, setValue] as const;
}

// Hook for accessibility preferences only
export function useAccessibilityPreferences() {
  const { preferences, updatePreference } = useUserPreferences();

  return {
    highContrast: preferences.highContrast,
    reduceMotion: preferences.reduceMotion,
    fontSize: preferences.fontSize,
    screenReaderMode: preferences.screenReaderMode,
    setHighContrast: (value: boolean) => updatePreference('highContrast', value),
    setReduceMotion: (value: boolean) => updatePreference('reduceMotion', value),
    setFontSize: (value: 'small' | 'medium' | 'large') => updatePreference('fontSize', value),
    setScreenReaderMode: (value: boolean) => updatePreference('screenReaderMode', value),
  };
}

// Hook for theme preferences
export function useThemePreference() {
  const { preferences, updatePreference } = useUserPreferences();
  const currentTheme = userPreferencesManager.getCurrentTheme();

  return {
    themeMode: preferences.theme,
    currentTheme,
    setThemeMode: (mode: 'light' | 'dark' | 'auto') => updatePreference('theme', mode),
    toggleTheme: () => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      updatePreference('theme', nextTheme);
    },
  };
}

// Hook for performance preferences
export function usePerformancePreferences() {
  const { preferences, updatePreference } = useUserPreferences();

  return {
    enableLowDataMode: preferences.enableLowDataMode,
    enableBatterySaver: preferences.enableBatterySaver,
    imageQuality: preferences.imageQuality,
    setLowDataMode: (value: boolean) => updatePreference('enableLowDataMode', value),
    setBatterySaver: (value: boolean) => updatePreference('enableBatterySaver', value),
    setImageQuality: (quality: 'low' | 'medium' | 'high' | 'auto') => 
      updatePreference('imageQuality', quality),
  };
}