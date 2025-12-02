/**
 * OnboardingContext - Focused context for onboarding, help, and behavior tracking
 * Split from UnifiedAppContext for performance optimization (GAMMA-003)
 */

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode, useRef } from 'react';
import { ContextualHelp, UserBehavior, UserAction } from './modules/types';

// Onboarding context value interface
export interface OnboardingContextValue {
  // Contextual Help
  contextualHelp: ContextualHelp;
  startOnboarding: (tourId: string) => void;
  completeOnboardingStep: () => void;
  completeOnboarding: (tourId: string) => void;
  shouldShowTooltip: (tooltipId: string) => boolean;
  dismissTooltip: (tooltipId: string) => void;

  // Behavior Tracking
  behavior: UserBehavior;
  trackInteraction: () => void;
  trackUserAction: (action: string, data?: Record<string, unknown>) => void;
}

// Create the context
const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

// Storage keys
const ONBOARDING_STORAGE_KEY = 'dextrends-onboarding';
const BEHAVIOR_STORAGE_KEY = 'dextrends-behavior';

// Default states
const defaultContextualHelp: ContextualHelp = {
  showOnboarding: true,
  showTooltips: true,
  currentStep: 0,
  completedTours: [],
  currentTour: null
};

const defaultBehavior: UserBehavior = {
  interactionCount: 0,
  scrollDepth: 0,
  timeOnPage: 0,
  lastInteraction: null,
  visitCount: 0,
  preferredCardView: 'grid',
  favoriteCategories: [],
  searchHistory: [],
  recentActions: [],
  dismissedTooltips: []
};

// Get initial states from localStorage
function getInitialContextualHelp(): ContextualHelp {
  if (typeof window === 'undefined') return defaultContextualHelp;

  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      return { ...defaultContextualHelp, ...JSON.parse(stored) };
    }
  } catch (e) {
    // localStorage not available
  }

  return defaultContextualHelp;
}

function getInitialBehavior(): UserBehavior {
  if (typeof window === 'undefined') return defaultBehavior;

  try {
    const stored = localStorage.getItem(BEHAVIOR_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultBehavior,
        ...parsed,
        visitCount: (parsed.visitCount || 0) + 1
      };
    }
  } catch (e) {
    // localStorage not available
  }

  return { ...defaultBehavior, visitCount: 1 };
}

// Provider props
interface OnboardingProviderProps {
  children: ReactNode;
}

// Onboarding Provider Component
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [contextualHelp, setContextualHelp] = useState<ContextualHelp>(getInitialContextualHelp);
  const [behavior, setBehavior] = useState<UserBehavior>(getInitialBehavior);

  // Use ref for behavior to avoid stale closures in callbacks
  const behaviorRef = useRef(behavior);
  useEffect(() => {
    behaviorRef.current = behavior;
  }, [behavior]);

  // Persist contextual help to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(contextualHelp));
    } catch (e) {
      // localStorage not available
    }
  }, [contextualHelp]);

  // Persist behavior to localStorage (debounced)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(behavior));
      } catch (e) {
        // localStorage not available
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [behavior]);

  // Start a new onboarding tour
  const startOnboarding = useCallback((tourId: string) => {
    setContextualHelp(prev => ({
      ...prev,
      showOnboarding: true,
      currentTour: tourId,
      currentStep: 0
    }));
  }, []);

  // Complete current step
  const completeOnboardingStep = useCallback(() => {
    setContextualHelp(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  }, []);

  // Complete entire tour
  const completeOnboarding = useCallback((tourId: string) => {
    setContextualHelp(prev => ({
      ...prev,
      showOnboarding: false,
      currentTour: null,
      currentStep: 0,
      completedTours: prev.completedTours.includes(tourId)
        ? prev.completedTours
        : [...prev.completedTours, tourId]
    }));
  }, []);

  // Check if tooltip should be shown
  const shouldShowTooltip = useCallback((tooltipId: string): boolean => {
    return (
      contextualHelp.showTooltips &&
      !behaviorRef.current.dismissedTooltips.includes(tooltipId)
    );
  }, [contextualHelp.showTooltips]);

  // Dismiss a tooltip
  const dismissTooltip = useCallback((tooltipId: string) => {
    setBehavior(prev => ({
      ...prev,
      dismissedTooltips: prev.dismissedTooltips.includes(tooltipId)
        ? prev.dismissedTooltips
        : [...prev.dismissedTooltips, tooltipId]
    }));
  }, []);

  // Track generic interaction
  const trackInteraction = useCallback(() => {
    setBehavior(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      lastInteraction: Date.now()
    }));
  }, []);

  // Track specific user action
  const trackUserAction = useCallback((action: string, data?: Record<string, unknown>) => {
    const userAction: UserAction = {
      action,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      ...data
    };

    setBehavior(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      lastInteraction: Date.now(),
      recentActions: [userAction, ...prev.recentActions].slice(0, 50) // Keep last 50 actions
    }));
  }, []);

  const value: OnboardingContextValue = {
    contextualHelp,
    startOnboarding,
    completeOnboardingStep,
    completeOnboarding,
    shouldShowTooltip,
    dismissTooltip,
    behavior,
    trackInteraction,
    trackUserAction
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook to use onboarding context
export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
}

// Safe hook that doesn't throw
export function useOnboardingContextSafe(): OnboardingContextValue | null {
  return useContext(OnboardingContext) ?? null;
}

export default OnboardingContext;
