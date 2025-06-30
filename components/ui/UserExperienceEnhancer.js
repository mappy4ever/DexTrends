import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Connection status indicator
export const ConnectionStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage && isOnline) return null;

  return (
    <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white animate-pulse'
    }`}>
      {isOnline ? (
        <div className="flex items-center space-x-2">
          <span className="text-green-200">🟢</span>
          <span>Connection restored!</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-red-200">🔴</span>
          <span>You're offline - Some features may not work</span>
        </div>
      )}
    </div>
  );
};

// Reading progress indicator for long pages
export const ReadingProgressIndicator = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight * 100;
      
      setProgress(Math.min(scrollPercent, 100));
      setIsVisible(scrollTop > 200);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-40">
      <div 
        className="h-full bg-gradient-to-r from-pokemon-red via-pokemon-yellow to-pokemon-blue transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Smart search suggestions - safe version
export const SmartSearchSuggestions = ({ searchTerm = '', onSelect = () => {} }) => {
  // Return null to prevent any potential loops
  return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 mt-1">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
        >
          <span>{suggestion.icon}</span>
          <span>{suggestion.text}</span>
        </button>
      ))}
    </div>
  );
};

// Page visit tracker and recommendations
export const PageRecommendations = () => {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    // Track page visits
    const visited = JSON.parse(localStorage.getItem('visited-pages') || '[]');
    const currentPage = router.pathname;
    
    if (!visited.includes(currentPage)) {
      const updatedVisited = [...visited, currentPage].slice(-10); // Keep last 10
      localStorage.setItem('visited-pages', JSON.stringify(updatedVisited));
    }

    // Generate recommendations based on current page
    const pageRecommendations = {
      '/pokedex': [
        { title: 'Explore TCG Sets', path: '/tcgsets', icon: '🃏', description: 'Check out Pokémon cards' },
        { title: 'Try Pocket Mode', path: '/pocketmode', icon: '📱', description: 'Mobile-optimized experience' }
      ],
      '/tcgsets': [
        { title: 'Browse Pokédex', path: '/pokedex', icon: '📚', description: 'Learn about Pokémon species' },
        { title: 'View Collections', path: '/collections', icon: '💎', description: 'Manage your card collection' }
      ],
      '/pocketmode': [
        { title: 'Full TCG Experience', path: '/tcgsets', icon: '🃏', description: 'Complete card database' },
        { title: 'Pokédex Reference', path: '/pokedex', icon: '📚', description: 'Detailed Pokémon info' }
      ],
      '/': [
        { title: 'Start with Pokédex', path: '/pokedex', icon: '📚', description: 'Explore all Pokémon' },
        { title: 'Browse TCG Cards', path: '/tcgsets', icon: '🃏', description: 'Trading card collection' }
      ]
    };

    setRecommendations(pageRecommendations[currentPage] || []);
  }, [router.pathname]);

  // Show recommendations after user has been on page for 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (recommendations.length > 0) {
        setShowRecommendations(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [recommendations]);

  if (!showRecommendations || recommendations.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 max-w-sm z-30 animate-slideIn">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-sm">💡 You might like</h4>
        <button
          onClick={() => setShowRecommendations(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <button
            key={index}
            onClick={() => {
              router.push(rec.path);
              setShowRecommendations(false);
            }}
            className="w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{rec.icon}</span>
              <div>
                <div className="font-medium text-sm">{rec.title}</div>
                <div className="text-xs text-gray-500">{rec.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Accessibility enhancements
export const AccessibilityEnhancer = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Load accessibility preferences
    const preferences = JSON.parse(localStorage.getItem('accessibility-preferences') || '{}');
    setHighContrast(preferences.highContrast || false);
    setFontSize(preferences.fontSize || 'normal');
    setReducedMotion(preferences.reducedMotion || false);

    // Apply preferences
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (preferences.fontSize !== 'normal') {
      document.documentElement.classList.add(`font-size-${preferences.fontSize}`);
    }
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
  }, []);

  const updatePreference = (key, value) => {
    const preferences = JSON.parse(localStorage.getItem('accessibility-preferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));

    // Apply changes
    if (key === 'highContrast') {
      setHighContrast(value);
      document.documentElement.classList.toggle('high-contrast', value);
    }
    if (key === 'fontSize') {
      setFontSize(value);
      document.documentElement.classList.remove('font-size-small', 'font-size-large');
      if (value !== 'normal') {
        document.documentElement.classList.add(`font-size-${value}`);
      }
    }
    if (key === 'reducedMotion') {
      setReducedMotion(value);
      document.documentElement.classList.toggle('reduced-motion', value);
    }
  };

  return null; // This component works behind the scenes
};

export default {
  ConnectionStatusIndicator,
  ReadingProgressIndicator,
  SmartSearchSuggestions,
  PageRecommendations,
  AccessibilityEnhancer
};