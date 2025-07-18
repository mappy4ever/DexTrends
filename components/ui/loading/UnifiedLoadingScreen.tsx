import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PokeballSVG } from '../PokeballSVG';

/**
 * Unified loading screen component for consistent loading experience
 */
interface UnifiedLoadingScreenProps {
  message?: string;
  type?: 'default' | 'pokemon' | 'cards' | 'trending' | 'sets' | 'pokedex' | 'pocket' | 'data';
  progress?: number | null;
  showFacts?: boolean;
  customMessage?: string | null;
  overlay?: boolean;
  preventFlash?: boolean;
}

export default function UnifiedLoadingScreen({
  message = "Loading...", type = "default",
  progress = null, showFacts = false, customMessage = null, overlay = true, preventFlash = true
}: UnifiedLoadingScreenProps) {
  const [currentFact, setCurrentFact] = useState(0);
  const [showContent, setShowContent] = useState(!preventFlash);

  // Loading facts for entertainment
  const loadingFacts = [
    "Did you know? There are over 25,000 different Pokémon cards!",
    "The first Pokémon cards were released in Japan in 1996.",
    "Charizard is one of the most valuable Pokémon cards ever printed.",
    "The Pokémon TCG has been translated into 14 languages.",
    "Some rare cards can sell for over $100,000!",
    "Pikachu was almost called 'Pika' in the original designs.",
    "The holographic effect on cards is called 'holofoil'.",
    "Energy cards are essential for powering Pokémon attacks."
  ];

  // Prevent flash by showing content after a small delay
  useEffect(() => {
    if (preventFlash && !showContent) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50); // Small delay to prevent flash
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [preventFlash, showContent]);

  // Rotate facts every 3 seconds if enabled
  useEffect(() => {
    if (showFacts) {
      const interval = setInterval(() => {
        setCurrentFact(prev => (prev + 1) % loadingFacts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [showFacts, loadingFacts.length]);

  // Get theme-specific styling
  const getThemeConfig = (): any => {
    switch (type) {
      case 'pokemon':
        return {
          background: 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500',
          accent: 'text-yellow-300',
          pokeball: 'shiny',
          icon: '📚',
          defaultMessage: 'Loading Pokédex...'
        };
      case 'cards':
        return {
          background: 'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500',
          accent: 'text-white',
          pokeball: 'great',
          icon: '🃏',
          defaultMessage: 'Loading cards...'
        };
      case 'trending':
        return {
          background: 'bg-gradient-to-br from-green-500 via-teal-500 to-blue-500',
          accent: 'text-green-100',
          pokeball: 'ultra',
          icon: '📈',
          defaultMessage: 'Loading trending data...'
        };
      case 'sets':
        return {
          background: 'bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600',
          accent: 'text-purple-100',
          pokeball: 'premier',
          icon: '📦',
          defaultMessage: 'Loading sets...'
        };
      case 'pokedex':
        return {
          background: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100',
          accent: 'text-blue-600',
          pokeball: 'default',
          icon: '📖',
          defaultMessage: 'Loading Pokédex data...'
        };
      case 'pocket':
        return {
          background: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
          accent: 'text-yellow-400',
          pokeball: 'ultra',
          icon: '🎴',
          defaultMessage: 'Loading Pocket mode...'
        };
      case 'data':
        return {
          background: 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900',
          accent: 'text-cyan-400',
          pokeball: 'default',
          icon: '📊',
          defaultMessage: 'Loading data...'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-pokemon-red to-pokemon-blue',
          accent: 'text-yellow-300',
          pokeball: 'default',
          icon: '⚡',
          defaultMessage: 'Loading...'
        };
    }
  };

  const theme = getThemeConfig();
  const displayMessage = customMessage || message || theme.defaultMessage;

  if (!showContent) {
    // Return minimal loader to prevent flash
    return (
      <div className={`fixed inset-0 z-50 ${theme.background} ${overlay ? '' : 'relative'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin">
            <PokeballSVG size={60} animate={false} color={theme.pokeball} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${overlay ? 'fixed inset-0 z-50' : 'relative min-h-screen'} ${theme.background} flex items-center justify-center transition-all duration-300`}>
      {/* Background overlay to prevent content showing through */}
      {overlay && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      )}
      
      <div className="relative z-10 text-center text-white px-4 max-w-md mx-auto">
        {/* Main loading animation */}
        <div className="mb-8 relative">
          <div className="relative inline-block">
            <PokeballSVG 
              size={100} 
              animate={true} 
              color={theme.pokeball}
              className="drop-shadow-2xl"
            />
            
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-white/20 animate-pulse"></div>
          </div>
        </div>

        {/* Loading message */}
        <div className="mb-6 space-y-2">
          <h2 className={`text-2xl md:text-3xl font-bold ${theme.accent} animate-pulse flex items-center justify-center gap-3`}>
            <span className="text-3xl">{theme.icon}</span>
            {displayMessage}
          </h2>
          
          {/* Progress bar if provided */}
          {progress !== null && (
            <div className="w-full bg-white/20 rounded-full h-2 mt-4">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
              <p className="text-sm mt-2 text-white/80">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center space-x-2 mb-8">
          {[0, 1, 2].map((i: any) => (
            <div
              key={i}
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Fun facts section */}
        {showFacts && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-start space-x-3">
              <div className="text-2xl flex-shrink-0">💡</div>
              <div className="text-left">
                <h4 className="font-bold text-sm mb-2 text-yellow-300">
                  Did you know?
                </h4>
                <p className="text-sm leading-relaxed text-white/90 animate-fade-in">
                  {loadingFacts[currentFact]}
                </p>
              </div>
            </div>
            
            {/* Fact progress indicators */}
            <div className="flex justify-center space-x-1 mt-4">
              {loadingFacts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFact ? 'bg-yellow-300' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading tips */}
        <div className="mt-6 text-xs text-white/70">
          <p>Tip: Use the search function to quickly find specific cards!</p>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating pokeballs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <PokeballSVG size={20 + Math.random() * 30} color="default" />
          </div>
        ))}
      </div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Specialized loading components for different use cases
 */
export const PokemonLoadingScreen = (props: any) => (
  <UnifiedLoadingScreen {...props} type="pokemon" showFacts={true} />
);

export const CardLoadingScreen = (props: any) => (
  <UnifiedLoadingScreen {...props} type="cards" />
);

export const TrendingLoadingScreen = (props: any) => (
  <UnifiedLoadingScreen {...props} type="trending" />
);

export const SetLoadingScreen = (props: any) => (
  <UnifiedLoadingScreen {...props} type="sets" />
);

export const PokedexLoadingScreen = (props: any) => (
  <UnifiedLoadingScreen {...props} type="pokedex" showFacts={true} />
);

export const PocketLoadingScreen = (props: any) => (
  <UnifiedLoadingScreen {...props} type="pocket" />
);

export const DataLoadingScreen = (props: any) => (
  <UnifiedLoadingScreen {...props} type="data" />
);

/**
 * Hook for managing loading states with unified loading screen
 */
export function useUnifiedLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingType, setLoadingType] = useState<'default' | 'pokemon' | 'cards' | 'trending' | 'sets' | 'pokedex' | 'pocket' | 'data'>('default');
  const [progress, setProgress] = useState<any>(null);

  const startLoading = (message = 'Loading...', type: 'default' | 'pokemon' | 'cards' | 'trending' | 'sets' | 'pokedex' | 'pocket' | 'data' = 'default') => {
    setLoadingMessage(message);
    setLoadingType(type);
    setIsLoading(true);
    setProgress(null);
  };

  const stopLoading = (): any => {
    setIsLoading(false);
    setProgress(null);
  };

  const updateProgress = (value: React.MouseEvent | React.KeyboardEvent) => {
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