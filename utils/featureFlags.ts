// Feature flags to control app enhancements

// Feature flag names as a union type for type safety
export type FeatureFlagName = 
  // Performance features
  | 'ENABLE_SOUND_EFFECTS'
  | 'ENABLE_PERFORMANCE_TRACKER'
  | 'ENABLE_MEMORY_MANAGER'
  | 'ENABLE_BUNDLE_OPTIMIZER'
  | 'ENABLE_RESOURCE_OPTIMIZER'
  // Visual features
  | 'ENABLE_HOLOGRAPHIC_EFFECTS'
  | 'ENABLE_MOUSE_TRACKING'
  | 'ENABLE_CARD_FLIP'
  | 'ENABLE_MOUSE_TRAIL'
  | 'ENABLE_KONAMI_CODE'
  // UX features
  | 'ENABLE_ROUTE_TRANSITIONS'
  | 'ENABLE_PAGE_PROGRESS'
  | 'ENABLE_QUICK_ACTIONS'
  // Development features
  | 'ENABLE_DEV_PERFORMANCE_MONITOR'
  // Navigation features
  | 'ENABLE_NAVIGATION_FIX';

// Feature flags interface
interface FeatureFlags {
  // Performance features
  ENABLE_SOUND_EFFECTS: boolean;
  ENABLE_PERFORMANCE_TRACKER: boolean;
  ENABLE_MEMORY_MANAGER: boolean;
  ENABLE_BUNDLE_OPTIMIZER: boolean;
  ENABLE_RESOURCE_OPTIMIZER: boolean;
  
  // Visual features
  ENABLE_HOLOGRAPHIC_EFFECTS: boolean;
  ENABLE_MOUSE_TRACKING: boolean;
  ENABLE_CARD_FLIP: boolean;
  ENABLE_MOUSE_TRAIL: boolean;
  ENABLE_KONAMI_CODE: boolean;
  
  // UX features
  ENABLE_ROUTE_TRANSITIONS: boolean;
  ENABLE_PAGE_PROGRESS: boolean;
  ENABLE_QUICK_ACTIONS: boolean;
  
  // Development features
  ENABLE_DEV_PERFORMANCE_MONITOR: boolean;
  
  // Navigation features
  ENABLE_NAVIGATION_FIX: boolean;
}

// Feature flags configuration
export const FEATURE_FLAGS: FeatureFlags = {
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
export const isFeatureEnabled = (flagName: FeatureFlagName): boolean => {
  return FEATURE_FLAGS[flagName] === true;
};

// Helper function to enable/disable features dynamically
export const toggleFeature = (flagName: FeatureFlagName, enabled: boolean): void => {
  if (typeof window !== 'undefined') {
    FEATURE_FLAGS[flagName] = enabled;
    localStorage.setItem(`feature_${flagName}`, enabled.toString());
  }
};

// Initialize feature flags from localStorage on client side
export const initializeFeatureFlags = (): void => {
  if (typeof window !== 'undefined') {
    (Object.keys(FEATURE_FLAGS) as FeatureFlagName[]).forEach(flagName => {
      const stored = localStorage.getItem(`feature_${flagName}`);
      if (stored !== null) {
        FEATURE_FLAGS[flagName] = stored === 'true';
      }
    });
  }
};

// Export types for use in other files
export type { FeatureFlags };