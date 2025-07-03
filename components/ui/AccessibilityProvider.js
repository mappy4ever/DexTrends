import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Accessibility context for managing accessibility preferences and features
 */
const AccessibilityContext = createContext();

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

/**
 * Accessibility preferences with localStorage persistence
 */
const ACCESSIBILITY_STORAGE_KEY = 'pokemon_accessibility_preferences';

const DEFAULT_PREFERENCES = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  keyboardNavigation: true,
  screenReaderMode: false,
  focusIndicators: true,
  autoPlay: true
};

export function AccessibilityProvider({ children }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage and system preferences
  useEffect(() => {
    try {
      // Load saved preferences
      const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      const savedPreferences = saved ? JSON.parse(saved) : {};

      // Check system preferences
      const systemPreferences = {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches
      };

      // Merge preferences (system > saved > default)
      const mergedPreferences = {
        ...DEFAULT_PREFERENCES,
        ...savedPreferences,
        ...systemPreferences
      };

      setPreferences(mergedPreferences);
      applyPreferences(mergedPreferences);
      setIsLoaded(true);
    } catch (error) {
      setPreferences(DEFAULT_PREFERENCES);
      setIsLoaded(true);
    }
  }, []);

  // Apply preferences to document
  const applyPreferences = (prefs) => {
    const root = document.documentElement;
    const body = document.body;

    // Reduced motion
    if (prefs.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // High contrast
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (prefs.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Focus indicators
    if (prefs.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Screen reader mode
    if (prefs.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
  };

  // Update preference
  const updatePreference = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    applyPreferences(newPreferences);

    // Save to localStorage
    try {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      // Silent fail
    }
  };

  // Reset to defaults
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    applyPreferences(DEFAULT_PREFERENCES);
    
    try {
      localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    } catch (error) {
      // Silent fail
    }
  };

  // Skip to main content
  const skipToMain = () => {
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Announce to screen readers
  const announce = (message, priority = 'polite') => {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  const contextValue = {
    preferences,
    updatePreference,
    resetPreferences,
    skipToMain,
    announce,
    isLoaded
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Screen reader announcer */}
      <div
        id="sr-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      ></div>
      
      {/* Skip to main content link */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-pokemon-blue focus:text-white focus:rounded"
      >
        Skip to main content
      </a>
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation() {
  const { preferences } = useAccessibility();

  useEffect(() => {
    if (!preferences.keyboardNavigation) return;

    const handleKeyDown = (e) => {
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }

      // Escape key to close modals/dropdowns
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('[role="dialog"]')) {
          const closeButton = activeElement.closest('[role="dialog"]').querySelector('[aria-label*="close"], [aria-label*="Close"]');
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [preferences.keyboardNavigation]);
}

/**
 * Hook for focus management
 */
export function useFocusManagement() {
  const { preferences } = useAccessibility();

  const trapFocus = (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  const restoreFocus = (element) => {
    if (element && element.focus) {
      element.focus();
    }
  };

  return { trapFocus, restoreFocus };
}

export default AccessibilityProvider;