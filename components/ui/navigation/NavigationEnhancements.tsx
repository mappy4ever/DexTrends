import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PokeballSVG } from '../PokeballSVG';

// Page transition loader with route-specific themes
export const RouteTransitionLoader = (): any => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');

  useEffect(() => {
    const handleStart = (url: any) => {
      setCurrentRoute(url);
      setLoading(true);
    };
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  const getRouteTheme = (route: string) => {
    if (route.includes('/pokedex')) return { 
      color: 'from-red-500 to-red-700', 
      ball: 'default' as const,
      message: 'Opening Pokédex...',
      icon: '📚'
    };
    if (route.includes('/tcgsets')) return { 
      color: 'from-blue-500 to-blue-700', 
      ball: 'great' as const,
      message: 'Loading TCG Sets...',
      icon: '🃏'
    };
    if (route.includes('/pocketmode')) return { 
      color: 'from-purple-500 to-purple-700', 
      ball: 'ultra' as const,
      message: 'Entering Pocket Mode...',
      icon: '📱'
    };
    if (route.includes('/collections')) return { 
      color: 'from-yellow-500 to-yellow-700', 
      ball: 'premier' as const,
      message: 'Opening Collection...',
      icon: '💎'
    };
    
    return { 
      color: 'from-pokemon-red to-pokemon-blue', 
      ball: 'default' as const,
      message: 'Loading...',
      icon: '⚡'
    };
  };

  if (!loading) return null;

  const theme = getRouteTheme(currentRoute);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${theme.color} flex items-center justify-center z-50`}>
      <div className="text-center text-white">
        <div className="mb-6">
          <PokeballSVG size={80} animate={true} color={theme.ball} />
        </div>
        <h2 className="text-2xl font-bold mb-2 animate-pulse">
          {theme.icon} {theme.message}
        </h2>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i: any) => (
            <div 
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Breadcrumb navigation with Pokémon theming
interface PokemonBreadcrumbsProps {
  items?: any;
}

export const PokemonBreadcrumbs = ({ items = [] }: PokemonBreadcrumbsProps) => {
  const router = useRouter();

  const formatBreadcrumb = (path: string, label?: string) => {
    const icons: { [key: string]: string } = {
      '/': '🏠',
      '/pokedex': '📚',
      '/tcgsets': '🃏',
      '/pocketmode': '📱',
      '/collections': '💎',
      '/leaderboard': '🏆'
    };

    return {
      icon: icons[path] || '📄',
      label: label || path.split('/').pop() || 'Home',
      path
    };
  };

  const breadcrumbs = items.length > 0 ? items : [
    formatBreadcrumb('/', 'Home'),
    formatBreadcrumb(router.pathname, router.pathname)
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg">
      {breadcrumbs.map((crumb: any, index: number) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400 mx-2">
              <PokeballSVG size={12} className="opacity-50" />
            </span>
          )}
          <button
            onClick={() => router.push(crumb.path)}
            className="flex items-center space-x-1 hover:text-pokemon-red transition-colors"
            disabled={index === breadcrumbs.length - 1}
          >
            <span>{crumb.icon}</span>
            <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-pokemon-red'}>
              {crumb.label}
            </span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

// Quick action floating button
export const QuickActionFAB = (): any => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const quickActions = [
    { 
      label: 'Search', 
      icon: '🔍', 
      action: () => (document.querySelector('[aria-label="Open global search"]') as HTMLElement)?.click(),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      label: 'Favorites', 
      icon: '❤️', 
      action: () => router.push('/favorites'),
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    { 
      label: 'Random', 
      icon: '🎲', 
      action: () => router.push(`/pokedex/${Math.floor(Math.random() * 1010) + 1}`),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      label: 'Home', 
      icon: '🏠', 
      action: () => router.push('/'),
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Action buttons */}
      <div className={`flex flex-col-reverse space-y-reverse space-y-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`${action.color} text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center space-x-2 min-w-max`}
            title={action.label}
          >
            <span className="text-lg">{action.icon}</span>
            <span className="font-medium text-sm pr-1">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-pokemon-red hover:bg-red-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 ${isOpen ? 'rotate-45' : ''}`}
      >
        <PokeballSVG size={24} className="text-white" animate={isOpen} />
      </button>
    </div>
  );
};

// Page progress indicator
export const PageProgressIndicator = (): any => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = (): any => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <div 
        className="h-full bg-gradient-to-r from-pokemon-red to-pokemon-yellow transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Back to top button with Pokémon style
export const BackToTopButton = (): any => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = (): any => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = (): any => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 left-6 bg-pokemon-blue hover:bg-blue-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 z-40 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      title="Back to top"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

// Keyboard shortcuts helper
export const KeyboardShortcuts = (): any => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case '/':
          e.preventDefault();
          (document.querySelector('[aria-label="Open global search"]') as HTMLElement)?.click();
          break;
        case 'h':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            router.push('/');
          }
          break;
        case 'p':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            router.push('/pokedex');
          }
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(true);
          break;
        case 'Escape':
          setShowShortcuts(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  if (!showShortcuts) {
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full">
        Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">?</kbd> for shortcuts
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          ⌨️ Keyboard Shortcuts
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Search</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">/</kbd>
          </div>
          <div className="flex justify-between">
            <span>Home</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl + H</kbd>
          </div>
          <div className="flex justify-between">
            <span>Pokédex</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl + P</kbd>
          </div>
          <div className="flex justify-between">
            <span>Close</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
          </div>
        </div>
        <button
          onClick={() => setShowShortcuts(false)}
          className="mt-4 w-full bg-pokemon-red hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default {
  RouteTransitionLoader,
  PokemonBreadcrumbs, 
  QuickActionFAB,
  PageProgressIndicator,
  BackToTopButton,
  KeyboardShortcuts
};