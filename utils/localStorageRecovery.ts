import logger from './logger';

/**
 * localStorage recovery utilities to handle corrupted data and provide recovery mechanisms
 */

interface RecoveryResult {
  success: boolean;
  cleared: string[];
  errors: string[];
}

/**
 * Validates if a string is valid JSON
 */
const isValidJSON = (str: string): boolean => {
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates localStorage integrity and removes corrupted entries
 */
export const validateLocalStorage = (): RecoveryResult => {
  const result: RecoveryResult = {
    success: true,
    cleared: [],
    errors: []
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return result;
  }

  try {
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        
        // Skip non-JSON keys (like theme which is just a string)
        if (key === 'theme' || key === 'sw-recovery-needed') {
          continue;
        }
        
        // Check if value looks like JSON
        if (value && (value.startsWith('{') || value.startsWith('['))) {
          if (!isValidJSON(value)) {
            logger.warn('Removing corrupted localStorage item:', { key });
            localStorage.removeItem(key);
            result.cleared.push(key);
          }
        }
      } catch (error) {
        logger.error('Error validating localStorage item:', { key, error });
        result.errors.push(key);
        // Try to remove problematic item
        try {
          localStorage.removeItem(key);
          result.cleared.push(key);
        } catch {
          // Ignore removal errors
        }
      }
    }
  } catch (error) {
    logger.error('Critical error during localStorage validation:', { error });
    result.success = false;
  }

  if (result.cleared.length > 0) {
    logger.info('localStorage recovery completed:', { 
      cleared: result.cleared,
      errors: result.errors 
    });
  }

  return result;
};

/**
 * Clear all app-related localStorage items
 */
export const clearAppStorage = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const appKeys = [
    'theme',
    'favorites',
    'viewSettings',
    'sorting',
    'contextual-help',
    'ux-preferences',
    'user-behavior',
    'performance-metrics',
    'onboarding-state',
    'modal-state'
  ];

  for (const key of appKeys) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.warn('Failed to remove localStorage item:', { key, error });
    }
  }

  logger.info('App storage cleared');
};

/**
 * Check if recovery mode is needed
 */
export const isRecoveryNeeded = (): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    return localStorage.getItem('sw-recovery-needed') === 'true';
  } catch {
    return false;
  }
};

/**
 * Set recovery flag
 */
export const setRecoveryFlag = (needed: boolean): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    if (needed) {
      localStorage.setItem('sw-recovery-needed', 'true');
    } else {
      localStorage.removeItem('sw-recovery-needed');
    }
  } catch (error) {
    logger.error('Failed to set recovery flag:', { error });
  }
};

/**
 * Perform full recovery - clear caches, validate storage, reload
 */
export const performFullRecovery = async (): Promise<void> => {
  logger.info('Starting full recovery process');

  // Step 1: Validate localStorage
  const validationResult = validateLocalStorage();
  
  // Step 2: Clear service worker caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          logger.info('Deleting cache:', { name });
          return caches.delete(name);
        })
      );
    } catch (error) {
      logger.error('Failed to clear caches:', { error });
    }
  }

  // Step 3: Unregister all service workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          logger.info('Unregistering service worker:', { 
            scope: registration.scope 
          });
          return registration.unregister();
        })
      );
    } catch (error) {
      logger.error('Failed to unregister service workers:', { error });
    }
  }

  // Step 4: Clear recovery flag
  setRecoveryFlag(false);

  // Step 5: Reload the page
  logger.info('Recovery complete, reloading page');
  window.location.reload();
};

/**
 * Initialize recovery system on app start
 */
export const initializeRecovery = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if recovery is needed
  if (isRecoveryNeeded()) {
    logger.info('Recovery mode detected, performing recovery');
    performFullRecovery();
    return;
  }

  // Validate localStorage on startup
  const result = validateLocalStorage();
  
  if (!result.success || result.cleared.length > 0) {
    logger.info('localStorage issues detected and fixed', result);
  }
};

export default {
  validateLocalStorage,
  clearAppStorage,
  isRecoveryNeeded,
  setRecoveryFlag,
  performFullRecovery,
  initializeRecovery
};