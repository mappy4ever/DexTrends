import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useUX } from './EnhancedUXProvider.hooks';
import logger from "@/utils/logger";
import { useRouter } from 'next/router';

// Re-export hook for backward compatibility
export { useUX } from './EnhancedUXProvider.hooks';

// Type definitions
interface UserPreferences {
  theme: 'system' | 'light' | 'dark';
  animations: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorContrast: 'normal' | 'high';
  autoplayMedia: boolean;
  tooltips: boolean;
  keyboardNavigation: boolean;
}

interface ActionData {
  action: string;
  timestamp: number;
  page: string;
  [key: string]: unknown;
}

interface UserBehavior {
  scrollDepth: number;
  timeOnPage: number;
  interactionCount: number;
  lastInteraction: number | null;
  visitCount: number;
  preferredCardView: 'grid' | 'list';
  favoriteCategories: string[];
  searchHistory: string[];
  dismissedTooltips?: string[];
  recentActions?: ActionData[];
}

interface ContextualHelp {
  showOnboarding: boolean;
  showTooltips: boolean;
  currentStep: number;
  completedTours: string[];
  currentTour?: string | null;
}

interface AccessibilitySettings {
  screenReaderMode: boolean;
  highContrast: boolean;
  focusVisible: boolean;
  skipLinks: boolean;
  altTextAlways: boolean;
}

interface PersonalizedRecommendations {
  suggestedView: 'grid' | 'list';
  recommendedCategories: string[];
  suggestedSearches: string[];
  adaptiveLayout: 'advanced' | 'beginner';
}

interface PerformanceOptimizations {
  enablePrefetching: boolean;
  enableAnimations: boolean;
  lazyLoadImages: boolean;
  virtualizeGrids: boolean;
  cacheStrategy: 'aggressive' | 'conservative';
}

interface AccessibilityEnhancements {
  focusVisible: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  fontSize: string;
}

interface AdaptedLayout {
  layout: {
    cardView: 'grid' | 'list';
    sidebar: 'expanded' | 'collapsed';
    navigation: 'enhanced' | 'standard';
  };
  performance: {
    animations: boolean;
    prefetch: boolean;
    virtualization: boolean;
  };
  accessibility: AccessibilityEnhancements;
}

export interface UXContextValue {
  // State
  userPreferences: UserPreferences;
  userBehavior: UserBehavior;
  contextualHelp: ContextualHelp;
  accessibilitySettings: AccessibilitySettings;
  
  // Preference management
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  updateAccessibilitySettings: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  
  // Behavior tracking
  trackUserAction: (action: string, data?: Record<string, unknown>) => void;
  
  // Onboarding and help
  startOnboarding: (tourId: string) => void;
  completeOnboardingStep: () => void;
  completeOnboarding: (tourId: string) => void;
  shouldShowTooltip: (tooltipId: string) => boolean;
  dismissTooltip: (tooltipId: string) => void;
  
  // Personalization
  getPersonalizedRecommendations: () => PersonalizedRecommendations;
  optimizeForPerformance: () => PerformanceOptimizations;
  getAccessibilityEnhancements: () => AccessibilityEnhancements;
  adaptLayoutForUser: () => AdaptedLayout;
}

interface EnhancedUXProviderProps {
  children: ReactNode;
}

export const UXContext = createContext<UXContextValue | undefined>(undefined);

export const EnhancedUXProvider: React.FC<EnhancedUXProviderProps> = ({ children }) => {
  const router = useRouter();
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: 'system',
    animations: true,
    reducedMotion: false,
    fontSize: 'medium',
    colorContrast: 'normal',
    autoplayMedia: true,
    tooltips: true,
    keyboardNavigation: true
  });

  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    scrollDepth: 0,
    timeOnPage: 0,
    interactionCount: 0,
    lastInteraction: null,
    visitCount: 0,
    preferredCardView: 'grid',
    favoriteCategories: [],
    searchHistory: []
  });

  const [contextualHelp, setContextualHelp] = useState<ContextualHelp>({
    showOnboarding: false,
    showTooltips: true,
    currentStep: 0,
    completedTours: []
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    screenReaderMode: false,
    highContrast: false,
    focusVisible: true,
    skipLinks: true,
    altTextAlways: false
  });

  const initializeUXSettings = useCallback(() => {
    try {
      // Load user preferences
      const savedPreferences = localStorage.getItem('ux-preferences');
      if (savedPreferences) {
        setUserPreferences(prev => ({ ...prev, ...JSON.parse(savedPreferences) }));
      }

      // Load user behavior data
      const savedBehavior = localStorage.getItem('user-behavior');
      if (savedBehavior) {
        setUserBehavior(prev => ({ ...prev, ...JSON.parse(savedBehavior) }));
      }

      // Load contextual help state
      const savedHelp = localStorage.getItem('contextual-help');
      if (savedHelp) {
        setContextualHelp(prev => ({ ...prev, ...JSON.parse(savedHelp) }));
      }

      // Load accessibility settings
      const savedA11y = localStorage.getItem('accessibility-settings');
      if (savedA11y) {
        setAccessibilitySettings(prev => ({ ...prev, ...JSON.parse(savedA11y) }));
      }

      // Increment visit count
      setUserBehavior(prev => ({
        ...prev,
        visitCount: prev.visitCount + 1,
        timeOnPage: Date.now()
      }));

    } catch (error) {
      logger.error('Failed to initialize UX settings:', error);
    }
  }, []);

  const setupBehaviorTracking = useCallback(() => {
    let scrollTimer: NodeJS.Timeout;
    let interactionTimer: NodeJS.Timeout;

    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
      
      setUserBehavior(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent)
      }));
    };

    // Track user interactions
    const handleInteraction = () => {
      setUserBehavior(prev => ({
        ...prev,
        interactionCount: prev.interactionCount + 1,
        lastInteraction: Date.now()
      }));
    };

    // Debounced scroll tracking
    const debouncedScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScroll, 100);
    };

    // Debounced interaction tracking
    const debouncedInteraction = () => {
      clearTimeout(interactionTimer);
      interactionTimer = setTimeout(handleInteraction, 500);
    };

    // Add event listeners
    window.addEventListener('scroll', debouncedScroll, { passive: true });
    document.addEventListener('click', debouncedInteraction);
    document.addEventListener('keydown', debouncedInteraction);
    document.addEventListener('touchstart', debouncedInteraction, { passive: true });

    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      document.removeEventListener('click', debouncedInteraction);
      document.removeEventListener('keydown', debouncedInteraction);
      document.removeEventListener('touchstart', debouncedInteraction);
      clearTimeout(scrollTimer);
      clearTimeout(interactionTimer);
    };
  }, []);

  const setupAccessibilityDetection = useCallback(() => {
    // Detect if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setUserPreferences(prev => ({ ...prev, reducedMotion: true, animations: false }));
    }

    // Detect high contrast mode
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (highContrastQuery.matches) {
      setAccessibilitySettings(prev => ({ ...prev, highContrast: true }));
    }

    // Detect color scheme preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (userPreferences.theme === 'system') {
      setUserPreferences(prev => ({ 
        ...prev, 
        theme: darkModeQuery.matches ? 'dark' : 'light'
      }));
    }

    // Listen for changes
    mediaQuery.addEventListener('change', (e) => {
      setUserPreferences(prev => ({ 
        ...prev, 
        reducedMotion: e.matches,
        animations: !e.matches 
      }));
    });

    highContrastQuery.addEventListener('change', (e) => {
      setAccessibilitySettings(prev => ({ ...prev, highContrast: e.matches }));
    });

    if (userPreferences.theme === 'system') {
      darkModeQuery.addEventListener('change', (e) => {
        setUserPreferences(prev => ({ 
          ...prev, 
          theme: e.matches ? 'dark' : 'light'
        }));
      });
    }
  }, [userPreferences.theme]);

  const saveBehaviorData = useCallback(() => {
    try {
      // Calculate time on page
      const timeSpent = Date.now() - userBehavior.timeOnPage;
      const updatedBehavior = {
        ...userBehavior,
        timeOnPage: timeSpent
      };

      localStorage.setItem('user-behavior', JSON.stringify(updatedBehavior));
      localStorage.setItem('ux-preferences', JSON.stringify(userPreferences));
      localStorage.setItem('contextual-help', JSON.stringify(contextualHelp));
      localStorage.setItem('accessibility-settings', JSON.stringify(accessibilitySettings));
    } catch (error) {
      logger.error('Failed to save behavior data:', error);
    }
  }, [userBehavior, userPreferences, contextualHelp, accessibilitySettings]);

  useEffect(() => {
    initializeUXSettings();
  }, [initializeUXSettings]);

  useEffect(() => {
    const cleanup = setupBehaviorTracking();
    
    return () => {
      cleanup();
    };
  }, [setupBehaviorTracking]);

  useEffect(() => {
    setupAccessibilityDetection();
  }, [setupAccessibilityDetection]);

  useEffect(() => {
    return () => {
      saveBehaviorData();
    };
  }, [saveBehaviorData]);

  const updatePreference = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setUserPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('ux-preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateAccessibilitySettings = useCallback(<K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setAccessibilitySettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('accessibility-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const trackUserAction = useCallback((action: string, data: Record<string, unknown> = {}) => {
    const actionData: ActionData = {
      action,
      timestamp: Date.now(),
      page: router.pathname,
      ...data
    };

    // Store recent actions (keep last 50)
    setUserBehavior(prev => {
      const recentActions = prev.recentActions || [];
      const updated = {
        ...prev,
        recentActions: [actionData, ...recentActions].slice(0, 50)
      };
      return updated;
    });
  }, [router.pathname]);

  const startOnboarding = useCallback((tourId: string) => {
    setContextualHelp(prev => ({
      ...prev,
      showOnboarding: true,
      currentTour: tourId,
      currentStep: 0
    }));
  }, []);

  const completeOnboardingStep = useCallback(() => {
    setContextualHelp(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  }, []);

  const completeOnboarding = useCallback((tourId: string) => {
    setContextualHelp(prev => {
      const updated = {
        ...prev,
        showOnboarding: false,
        completedTours: [...prev.completedTours, tourId],
        currentTour: null,
        currentStep: 0
      };
      localStorage.setItem('contextual-help', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const shouldShowTooltip = useCallback((tooltipId: string): boolean => {
    if (!userPreferences.tooltips) return false;
    
    const dismissedTooltips = userBehavior.dismissedTooltips || [];
    return !dismissedTooltips.includes(tooltipId);
  }, [userPreferences.tooltips, userBehavior.dismissedTooltips]);

  const dismissTooltip = useCallback((tooltipId: string) => {
    setUserBehavior(prev => {
      const updated = {
        ...prev,
        dismissedTooltips: [...(prev.dismissedTooltips || []), tooltipId]
      };
      return updated;
    });
  }, []);

  const getPersonalizedRecommendations = useCallback((): PersonalizedRecommendations => {
    const { favoriteCategories, preferredCardView, searchHistory } = userBehavior;
    
    return {
      suggestedView: preferredCardView,
      recommendedCategories: favoriteCategories.slice(0, 3),
      suggestedSearches: searchHistory.slice(0, 5),
      adaptiveLayout: userBehavior.interactionCount > 100 ? 'advanced' : 'beginner'
    };
  }, [userBehavior]);

  const optimizeForPerformance = useCallback((): PerformanceOptimizations => {
    const { visitCount, interactionCount } = userBehavior;
    
    // Return performance optimizations based on user behavior
    return {
      enablePrefetching: visitCount > 5,
      enableAnimations: userPreferences.animations && !userPreferences.reducedMotion,
      lazyLoadImages: true,
      virtualizeGrids: interactionCount > 50,
      cacheStrategy: visitCount > 10 ? 'aggressive' : 'conservative'
    };
  }, [userBehavior, userPreferences]);

  const getAccessibilityEnhancements = useCallback((): AccessibilityEnhancements => {
    return {
      focusVisible: accessibilitySettings.focusVisible,
      highContrast: accessibilitySettings.highContrast,
      screenReaderOptimized: accessibilitySettings.screenReaderMode,
      keyboardNavigation: userPreferences.keyboardNavigation,
      reducedMotion: userPreferences.reducedMotion,
      fontSize: userPreferences.fontSize
    };
  }, [accessibilitySettings, userPreferences]);

  const adaptLayoutForUser = useCallback((): AdaptedLayout => {
    const recommendations = getPersonalizedRecommendations();
    const performance = optimizeForPerformance();
    const a11y = getAccessibilityEnhancements();
    
    return {
      layout: {
        cardView: recommendations.suggestedView,
        sidebar: userBehavior.interactionCount > 20 ? 'expanded' : 'collapsed',
        navigation: a11y.keyboardNavigation ? 'enhanced' : 'standard'
      },
      performance: {
        animations: performance.enableAnimations,
        prefetch: performance.enablePrefetching,
        virtualization: performance.virtualizeGrids
      },
      accessibility: a11y
    };
  }, [getPersonalizedRecommendations, optimizeForPerformance, getAccessibilityEnhancements, userBehavior.interactionCount]);

  const value: UXContextValue = {
    // State
    userPreferences,
    userBehavior,
    contextualHelp,
    accessibilitySettings,
    
    // Preference management
    updatePreference,
    updateAccessibilitySettings,
    
    // Behavior tracking
    trackUserAction,
    
    // Onboarding and help
    startOnboarding,
    completeOnboardingStep,
    completeOnboarding,
    shouldShowTooltip,
    dismissTooltip,
    
    // Personalization
    getPersonalizedRecommendations,
    optimizeForPerformance,
    getAccessibilityEnhancements,
    adaptLayoutForUser
  };

  return (
    <UXContext.Provider value={value}>
      {children}
    </UXContext.Provider>
  );
};

export default EnhancedUXProvider;