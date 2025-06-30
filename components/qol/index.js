// QOL (Quality of Life) Components Index
// This file exports all QOL enhancement components for easy importing
import React from 'react';

// Notification system
export { 
  NotificationProvider, 
  useNotifications, 
  useSmartNotifications 
} from './NotificationSystem';

// Smart search enhancements
export { 
  SmartSearchEnhancer, 
  GlobalSearchShortcuts 
} from './SmartSearchEnhancer';

// Contextual help and tooltips
export { 
  default as ContextualHelpProvider,
  SmartTooltip,
  SmartErrorBoundary 
} from './ContextualHelp';

// Skeleton loading components
export { 
  default as SmartSkeleton,
  CardSkeleton,
  CardGridSkeleton,
  PokemonListSkeleton,
  PokemonListGridSkeleton,
  CardDetailSkeleton,
  SearchResultsSkeleton,
  NavigationSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  CommentSkeleton,
  PageSkeleton
} from './SkeletonLoaders';

// Keyboard shortcuts manager
export { 
  default as KeyboardShortcutsManager 
} from './KeyboardShortcuts';

// User preferences system
export { 
  PreferencesProvider,
  usePreferences,
  PreferencesPanel
} from './UserPreferences';

// Utility functions and hooks for QOL features
export const QOLUtils = {
  // Quick notification helpers
  showSuccess: (message, options = {}) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('success', message, options);
    }
  },
  
  showError: (message, options = {}) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('error', message, { persistent: true, ...options });
    }
  },
  
  showInfo: (message, options = {}) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('info', message, options);
    }
  },
  
  showWarning: (message, options = {}) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('warning', message, options);
    }
  },
  
  // Local storage helpers with error handling
  getStorageItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get storage item: ${key}`, error);
      return defaultValue;
    }
  },
  
  setStorageItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set storage item: ${key}`, error);
      return false;
    }
  },
  
  // Debounce utility
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Copy to clipboard with notification
  copyToClipboard: async (text, successMessage = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      QOLUtils.showSuccess(successMessage);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      QOLUtils.showSuccess(successMessage);
      return true;
    }
  },
  
  // Format currency with proper locale
  formatCurrency: (amount, currency = 'USD', locale = 'en-US') => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      return `$${amount.toFixed(2)}`;
    }
  },
  
  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime: (date) => {
    try {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      const now = new Date();
      const diff = date - now;
      const diffInSeconds = Math.floor(diff / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (Math.abs(diffInDays) > 0) {
        return rtf.format(diffInDays, 'day');
      } else if (Math.abs(diffInHours) > 0) {
        return rtf.format(diffInHours, 'hour');
      } else if (Math.abs(diffInMinutes) > 0) {
        return rtf.format(diffInMinutes, 'minute');
      } else {
        return rtf.format(diffInSeconds, 'second');
      }
    } catch (error) {
      return date.toLocaleDateString();
    }
  },
  
  // Generate random ID
  generateId: () => {
    return `qol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Check if device is mobile
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Smooth scroll to element
  scrollToElement: (elementId, behavior = 'smooth') => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior, block: 'start' });
    }
  }
};

// Hook for managing component state with localStorage persistence
export const usePersistedState = (key, defaultValue) => {
  const [state, setState] = React.useState(() => {
    return QOLUtils.getStorageItem(key, defaultValue);
  });

  const setPersistedState = (value) => {
    setState(value);
    QOLUtils.setStorageItem(key, value);
  };

  return [state, setPersistedState];
};

// Hook for detecting online/offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
};

// Hook for detecting if element is in viewport
export const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
};

// QOL Constants
export const QOL_CONSTANTS = {
  STORAGE_KEYS: {
    PREFERENCES: 'userPreferences',
    SEARCH_HISTORY: 'searchHistory',
    POPULAR_SEARCHES: 'popularSearches',
    FAVORITES: 'favorites',
    THEME: 'theme'
  },
  
  NOTIFICATION_TYPES: {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
    LOADING: 'LOADING',
    CARD_ADDED: 'CARD_ADDED',
    POKEMON_FOUND: 'POKEMON_FOUND'
  },
  
  KEYBOARD_SHORTCUTS: {
    SEARCH: 'ctrl+k',
    HELP: 'f1',
    POKEDEX: 'ctrl+shift+p',
    CARDS: 'ctrl+shift+c',
    FAVORITES: 'ctrl+shift+f',
    HOME: 'ctrl+shift+h',
    THEME_TOGGLE: 'ctrl+shift+t'
  },
  
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280
  }
};