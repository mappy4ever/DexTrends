// Feature flags to control app enhancements
export const FEATURE_FLAGS = {
  // Performance features
  ENABLE_SOUND_EFFECTS: true, // Enhanced audio experience
  ENABLE_PERFORMANCE_TRACKER: false, // Disabled for stability
  ENABLE_MEMORY_MANAGER: false, // Disabled for stability
  ENABLE_BUNDLE_OPTIMIZER: false, // Disabled for stability
  ENABLE_RESOURCE_OPTIMIZER: false, // Disabled for stability
  
  // Visual features
  ENABLE_HOLOGRAPHIC_EFFECTS: true, // Holographic card animations
  ENABLE_MOUSE_TRACKING: true, // Mouse tracking for 3D effects
  ENABLE_CARD_FLIP: true, // Card flip animations
  ENABLE_MOUSE_TRAIL: false, // Disabled by default
  ENABLE_KONAMI_CODE: true, // Safe easter egg
  
  // UX features
  ENABLE_ROUTE_TRANSITIONS: true, // Re-enabled with conservative settings
  ENABLE_PAGE_PROGRESS: true, // Safe to enable
  ENABLE_QUICK_ACTIONS: true, // Safe to enable
  
  // Development features
  ENABLE_DEV_PERFORMANCE_MONITOR: process.env.NODE_ENV === 'development',
  
  // Navigation features
  ENABLE_NAVIGATION_FIX: false, // KEEP DISABLED - this was causing the infinite loops
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (flagName) => {
  return FEATURE_FLAGS[flagName] === true;
};

// Helper function to enable/disable features dynamically
export const toggleFeature = (flagName, enabled) => {
  if (typeof window !== 'undefined') {
    FEATURE_FLAGS[flagName] = enabled;
    localStorage.setItem(`feature_${flagName}`, enabled.toString());
  }
};

// Initialize feature flags from localStorage on client side
export const initializeFeatureFlags = () => {
  if (typeof window !== 'undefined') {
    Object.keys(FEATURE_FLAGS).forEach(flagName => {
      const stored = localStorage.getItem(`feature_${flagName}`);
      if (stored !== null) {
        FEATURE_FLAGS[flagName] = stored === 'true';
      }
    });
  }
};