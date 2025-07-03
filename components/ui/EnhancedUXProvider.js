import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const UXContext = createContext();

export const useUX = () => {
  const context = useContext(UXContext);
  if (!context) {
    throw new Error('useUX must be used within EnhancedUXProvider');
  }
  return context;
};

export const EnhancedUXProvider = ({ children }) => {
  const router = useRouter();
  const [userPreferences, setUserPreferences] = useState({
    theme: 'system',
    animations: true,
    reducedMotion: false,
    fontSize: 'medium',
    colorContrast: 'normal',
    autoplayMedia: true,
    tooltips: true,
    keyboardNavigation: true
  });

  const [userBehavior, setUserBehavior] = useState({
    scrollDepth: 0,
    timeOnPage: 0,
    interactionCount: 0,
    lastInteraction: null,
    visitCount: 0,
    preferredCardView: 'grid',
    favoriteCategories: [],
    searchHistory: []
  });

  const [contextualHelp, setContextualHelp] = useState({
    showOnboarding: false,
    showTooltips: true,
    currentStep: 0,
    completedTours: []
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    screenReaderMode: false,
    highContrast: false,
    focusVisible: true,
    skipLinks: true,
    altTextAlways: false
  });

  useEffect(() => {
    initializeUXSettings();
    setupBehaviorTracking();
    setupAccessibilityDetection();
    
    return () => {
      saveBehaviorData();
    };
  }, []);

  const initializeUXSettings = () => {
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
      console.error('Failed to initialize UX settings:', error);
    }
  };

  const setupBehaviorTracking = () => {
    let scrollTimer;
    let interactionTimer;

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
  };

  const setupAccessibilityDetection = () => {
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
  };

  const saveBehaviorData = () => {
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
      console.error('Failed to save behavior data:', error);
    }
  };

  const updatePreference = useCallback((key, value) => {
    setUserPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('ux-preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateAccessibilitySettings = useCallback((key, value) => {
    setAccessibilitySettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('accessibility-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const trackUserAction = useCallback((action, data = {}) => {
    const actionData = {
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

  const startOnboarding = useCallback((tourId) => {
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

  const completeOnboarding = useCallback((tourId) => {
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

  const shouldShowTooltip = useCallback((tooltipId) => {
    if (!userPreferences.tooltips) return false;
    
    const dismissedTooltips = userBehavior.dismissedTooltips || [];
    return !dismissedTooltips.includes(tooltipId);
  }, [userPreferences.tooltips, userBehavior.dismissedTooltips]);

  const dismissTooltip = useCallback((tooltipId) => {
    setUserBehavior(prev => {
      const updated = {
        ...prev,
        dismissedTooltips: [...(prev.dismissedTooltips || []), tooltipId]
      };
      return updated;
    });
  }, []);

  const getPersonalizedRecommendations = useCallback(() => {
    const { favoriteCategories, preferredCardView, searchHistory } = userBehavior;
    
    return {
      suggestedView: preferredCardView,
      recommendedCategories: favoriteCategories.slice(0, 3),
      suggestedSearches: searchHistory.slice(0, 5),
      adaptiveLayout: userBehavior.interactionCount > 100 ? 'advanced' : 'beginner'
    };
  }, [userBehavior]);

  const optimizeForPerformance = useCallback(() => {
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

  const getAccessibilityEnhancements = useCallback(() => {
    return {
      focusVisible: accessibilitySettings.focusVisible,
      highContrast: accessibilitySettings.highContrast,
      screenReaderOptimized: accessibilitySettings.screenReaderMode,
      keyboardNavigation: userPreferences.keyboardNavigation,
      reducedMotion: userPreferences.reducedMotion,
      fontSize: userPreferences.fontSize
    };
  }, [accessibilitySettings, userPreferences]);

  const adaptLayoutForUser = useCallback(() => {
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
  }, [getPersonalizedRecommendations, optimizeForPerformance, getAccessibilityEnhancements]);

  const value = {
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