import React, { useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useNotifications } from '../../hooks/useNotifications';
import logger from '../../utils/logger';
import { Container } from '../ui/Container';
import { useBottomNavigation } from '../ui/BottomNavigation';

// Type definitions
interface SmartTooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  showOnce?: boolean;
  helpKey?: string | null;
  disabled?: boolean;
}

interface HelpSection {
  title: string;
  content: string;
}

interface HelpContent {
  title: string;
  sections: HelpSection[];
}

interface ContextualHelpProviderProps {
  children: ReactNode;
}

// SmartErrorBoundary types moved to SmartErrorBoundary.tsx

// Smart tooltip component
export const SmartTooltip: React.FC<SmartTooltipProps> = ({ 
  children, 
  content, 
  position = 'top',
  delay = 500,
  showOnce = false,
  helpKey = null,
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showOnce && helpKey && typeof window !== 'undefined') {
      const shown = localStorage.getItem(`tooltip-shown-${helpKey}`);
      setHasShown(shown === 'true');
    }
  }, [showOnce, helpKey]);

  const showTooltip = () => {
    if (disabled || (showOnce && hasShown)) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      if (showOnce && helpKey && typeof window !== 'undefined') {
        localStorage.setItem(`tooltip-shown-${helpKey}`, 'true');
        setHasShown(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-stone-900 dark:bg-stone-700 rounded-lg shadow-lg whitespace-nowrap max-w-xs ${getPositionClasses()}`}
          style={{ pointerEvents: 'none' }}
        >
          {content}
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-stone-900 dark:bg-stone-700 transform rotate-45 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
            'right-full top-1/2 -translate-y-1/2 -mr-1'
          }`} />
        </div>
      )}
    </div>
  );
};

// Contextual help system
export const ContextualHelpProvider: React.FC<ContextualHelpProviderProps> = ({ children }) => {
  const [helpMode, setHelpMode] = useState(false);
  const [currentHelp, setCurrentHelp] = useState<HelpContent | null>(null);
  const router = useRouter();
  const { notify } = useNotifications();
  const { bottomOffset } = useBottomNavigation();

  // Page-specific help content
  const helpContent: Record<string, HelpContent> = useMemo(() => ({
    '/': {
      title: 'DexTrends Home',
      sections: [
        {
          title: 'Quick Start',
          content: 'Browse trending Pokemon cards, explore the Pokedex, or search for specific cards.'
        },
        {
          title: 'Navigation',
          content: 'Use Ctrl+K to quick search, or Ctrl+Shift+P for Pokedex, Ctrl+Shift+C for cards.'
        }
      ]
    },
    '/pokedex': {
      title: 'Pokedex',
      sections: [
        {
          title: 'Search Pokemon',
          content: 'Type Pokemon names, numbers, or types to find specific Pokemon.'
        },
        {
          title: 'Favorites',
          content: 'Click the heart icon to add Pokemon to your favorites for quick access.'
        },
        {
          title: 'Filters',
          content: 'Use type filters and generation filters to narrow down your search.'
        }
      ]
    },
    '/cards': {
      title: 'Card Browser',
      sections: [
        {
          title: 'Price Tracking',
          content: 'View real-time prices from TCGPlayer and track price history.'
        },
        {
          title: 'Card Details',
          content: 'Click any card to see detailed stats, attacks, and market data.'
        },
        {
          title: 'Zoom Feature',
          content: 'Click the zoom icon or press the card image to view high-resolution images.'
        }
      ]
    },
    '/favorites': {
      title: 'Your Favorites',
      sections: [
        {
          title: 'Manage Favorites',
          content: 'View and organize your favorite Pokemon and cards in one place.'
        },
        {
          title: 'Sync Across Devices',
          content: 'Your favorites are automatically saved and synced across devices.'
        }
      ]
    }
  }), []);

  const toggleHelpMode = useCallback(() => {
    setHelpMode(!helpMode);
    if (!helpMode) {
      notify.info('Help mode activated! Click on elements to learn more.', {
        duration: 3000
      });
    }
  }, [helpMode, notify]);

  // Keyboard shortcut to toggle help mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1' || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        toggleHelpMode();
      }
      
      if (e.key === 'Escape' && helpMode) {
        setHelpMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [helpMode, toggleHelpMode]);

  // Update help content when route changes
  useEffect(() => {
    const content = helpContent[router.pathname] || helpContent['/'];
    setCurrentHelp(content);
  }, [router.pathname, helpContent]);

  const showQuickTips = useCallback(() => {
    const tips = [
      'Press Ctrl+K to quickly search anywhere on the site',
      'Double-click any card image for detailed zoom view',
      'Use Ctrl+Shift+F to quickly access your favorites',
      'Press F1 or Shift+? for help on any page',
      'Your favorites automatically sync across devices'
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    notify.info(`💡 Tip: ${randomTip}`, { duration: 5000 });
  }, [notify]);

  return (
    <>
      {children}
      
      {/* Help mode indicator */}
      {helpMode && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Help Mode Active - Click elements to learn more</span>
            <button
              onClick={() => setHelpMode(false)}
              className="ml-2 text-white hover:text-stone-200">

              ×
            </button>
          </div>
        </div>
      )}

      {/* Help modal */}
      {helpMode && currentHelp && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Container variant="elevated" className="max-w-lg w-full max-h-80 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {currentHelp.title}
                </h2>
                <button
                  onClick={() => setHelpMode(false)}
                  className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200">

                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {currentHelp.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      {section.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300 text-sm">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  Keyboard Shortcuts
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <div>Ctrl+K: Search</div>
                  <div>F1: Help</div>
                  <div>Ctrl+Shift+P: Pokedex</div>
                  <div>Ctrl+Shift+C: Cards</div>
                  <div>Ctrl+Shift+F: Favorites</div>
                  <div>Esc: Close modals</div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Floating help button - positioned above bottom nav on mobile */}
      <div className="fixed right-4 z-40" style={{ bottom: bottomOffset }}>
        <div className="flex flex-col space-y-2">
          <SmartTooltip content="Show helpful tips" position="left">
            <button
              onClick={showQuickTips}
              className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-colors flex items-center justify-center">

              💡
            </button>
          </SmartTooltip>
          
          <SmartTooltip content="Toggle help mode (F1)" position="left">
            <button
              onClick={toggleHelpMode}
              className={`w-12 h-12 rounded-full shadow-lg transition-colors flex items-center justify-center ${
                helpMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-stone-600 hover:bg-stone-700 text-white dark:bg-stone-700 dark:hover:bg-stone-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </SmartTooltip>
        </div>
      </div>
    </>
  );
};

// Enhanced error boundary with helpful error messages
// SmartErrorBoundary moved to SmartErrorBoundary.tsx for better Fast Refresh support
export { SmartErrorBoundary } from './SmartErrorBoundary';

export default ContextualHelpProvider;