import React, { useState, useEffect } from 'react';
import PokeballLoader from './PokeballLoader';

/**
 * Unified loading screen component for consistent loading experience
 */
export default function UnifiedLoadingScreen({
  message = "Loading...",
  type = "default", // default, pokemon, cards, trending, sets
  progress = null,
  showFacts = false,
  customMessage = null,
  overlay = true,
  preventFlash = true
}) {
  const [showContent, setShowContent] = useState(!preventFlash);

  // Prevent flash by showing content after a small delay
  useEffect(() => {
    if (preventFlash && !showContent) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50); // Small delay to prevent flash
      return () => clearTimeout(timer);
    }
  }, [preventFlash, showContent]);

  // Get theme-specific message
  const getThemeConfig = () => {
    switch (type) {
      case 'pokemon':
        return {
          defaultMessage: 'Loading Pokédex...'
        };
      case 'cards':
        return {
          defaultMessage: 'Loading cards...'
        };
      case 'trending':
        return {
          defaultMessage: 'Loading trending data...'
        };
      case 'sets':
        return {
          defaultMessage: 'Loading sets...'
        };
      default:
        return {
          defaultMessage: 'Loading...'
        };
    }
  };

  const theme = getThemeConfig();
  const displayMessage = customMessage || message || theme.defaultMessage;

  if (!showContent) {
    // Return minimal loader to prevent flash
    return <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50"></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
      <PokeballLoader 
        size="large" 
        text={displayMessage} 
        randomBall={true}
      />
      
      {/* Progress bar if provided - positioned at bottom like pokedex page */}
      {progress !== null && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-xs px-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Specialized loading components for different use cases
 */
export const PokemonLoadingScreen = (props) => (
  <UnifiedLoadingScreen {...props} type="pokemon" />
);

export const CardLoadingScreen = (props) => (
  <UnifiedLoadingScreen {...props} type="cards" />
);

export const TrendingLoadingScreen = (props) => (
  <UnifiedLoadingScreen {...props} type="trending" />
);

export const SetLoadingScreen = (props) => (
  <UnifiedLoadingScreen {...props} type="sets" />
);

/**
 * Hook for managing loading states with unified loading screen
 */
export function useUnifiedLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingType, setLoadingType] = useState('default');
  const [progress, setProgress] = useState(null);

  const startLoading = (message = 'Loading...', type = 'default') => {
    setLoadingMessage(message);
    setLoadingType(type);
    setIsLoading(true);
    setProgress(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setProgress(null);
  };

  const updateProgress = (value) => {
    setProgress(value);
  };

  const LoadingComponent = isLoading ? (
    <UnifiedLoadingScreen
      message={loadingMessage}
      type={loadingType}
      progress={progress}
      preventFlash={true}
    />
  ) : null;

  return {
    isLoading,
    startLoading,
    stopLoading,
    updateProgress,
    LoadingComponent
  };
}