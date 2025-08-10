/**
 * User Preferences Management System
 * Handles accessibility, theme, and display preferences
 */

import logger from './logger';

export interface UserPreferences {
  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReaderMode: boolean;
  
  // Display
  theme: 'light' | 'dark' | 'auto';
  cardDisplayMode: 'grid' | 'list';
  compactMode: boolean;
  
  // Features
  enableAnimations: boolean;
  enableSoundEffects: boolean;
  enableNotifications: boolean;
  autoPlayVideos: boolean;
  
  // Performance
  enableLowDataMode: boolean;
  enableBatterySaver: boolean;
  imageQuality: 'low' | 'medium' | 'high' | 'auto';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  // Accessibility
  highContrast: false,
  reduceMotion: false,
  fontSize: 'medium',
  screenReaderMode: false,
  
  // Display
  theme: 'auto',
  cardDisplayMode: 'grid',
  compactMode: false,
  
  // Features
  enableAnimations: true,
  enableSoundEffects: true,
  enableNotifications: true,
  autoPlayVideos: true,
  
  // Performance
  enableLowDataMode: false,
  enableBatterySaver: false,
  imageQuality: 'auto',
};

class UserPreferencesManager {
  private static instance: UserPreferencesManager;
  private preferences: UserPreferences = DEFAULT_PREFERENCES;
  private listeners: Set<(prefs: UserPreferences) => void> = new Set();
  private storageKey = 'dextrends_user_preferences';

  private constructor() {
    this.loadPreferences();
    this.detectSystemPreferences();
  }

  static getInstance(): UserPreferencesManager {
    if (!UserPreferencesManager.instance) {
      UserPreferencesManager.instance = new UserPreferencesManager();
    }
    return UserPreferencesManager.instance;
  }

  private loadPreferences(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      logger.error('Failed to load user preferences:', { error });
    }
  }

  private savePreferences(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    } catch (error) {
      logger.error('Failed to save user preferences:', { error });
    }
  }

  private detectSystemPreferences(): void {
    if (typeof window === 'undefined') return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches && this.preferences.reduceMotion === false) {
      this.preferences.reduceMotion = true;
      this.preferences.enableAnimations = false;
    }

    // Detect prefers-color-scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (this.preferences.theme === 'auto') {
      // Apply system preference but don't override explicit user choice
      this.notifyListeners();
    }

    // Detect high contrast mode
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    if (prefersHighContrast.matches && this.preferences.highContrast === false) {
      this.preferences.highContrast = true;
    }

    // Listen for changes
    prefersReducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        this.updatePreference('reduceMotion', true);
        this.updatePreference('enableAnimations', false);
      }
    });

    prefersDark.addEventListener('change', () => {
      if (this.preferences.theme === 'auto') {
        this.notifyListeners();
      }
    });

    prefersHighContrast.addEventListener('change', (e) => {
      this.updatePreference('highContrast', e.matches);
    });
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  getPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferences[key];
  }

  updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.preferences[key] = value;
    this.savePreferences();
    this.notifyListeners();
  }

  updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
    this.notifyListeners();
  }

  resetToDefaults(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
    this.notifyListeners();
  }

  subscribe(listener: (prefs: UserPreferences) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const prefs = this.getPreferences();
    this.listeners.forEach(listener => listener(prefs));
  }

  // Helper methods for common checks
  isHighContrastMode(): boolean {
    return this.preferences.highContrast;
  }

  isReducedMotionMode(): boolean {
    return this.preferences.reduceMotion;
  }

  getCurrentTheme(): 'light' | 'dark' {
    if (this.preferences.theme === 'auto') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return this.preferences.theme;
  }

  isLowDataMode(): boolean {
    return this.preferences.enableLowDataMode;
  }

  isBatterySaverMode(): boolean {
    return this.preferences.enableBatterySaver;
  }
}

// Export singleton instance
export const userPreferencesManager = UserPreferencesManager.getInstance();

// Export convenience functions
export const getUserPreferences = () => userPreferencesManager.getPreferences();
export const getUserPreference = <K extends keyof UserPreferences>(key: K) => 
  userPreferencesManager.getPreference(key);
export const updateUserPreference = <K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
) => userPreferencesManager.updatePreference(key, value);
export const updateUserPreferences = (updates: Partial<UserPreferences>) =>
  userPreferencesManager.updatePreferences(updates);
export const subscribeToPreferences = (listener: (prefs: UserPreferences) => void) =>
  userPreferencesManager.subscribe(listener);
export const isHighContrastMode = () => userPreferencesManager.isHighContrastMode();
export const isReducedMotionMode = () => userPreferencesManager.isReducedMotionMode();
export const getCurrentTheme = () => userPreferencesManager.getCurrentTheme();