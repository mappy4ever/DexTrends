import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFavorites } from '../../../context/UnifiedAppContext';
import { KeyboardNavigation, useFocusTrap } from '../KeyboardNavigation';
import { useAnnouncer } from '../AriaLiveAnnouncer';
import ComparisonFAB from '../ComparisonFAB';

const EnhancedNavigation = (): any => {
  const router = useRouter();
  const { favorites } = useFavorites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { announce, AnnouncerComponent } = useAnnouncer();
  const focusTrapRef = useFocusTrap(isMenuOpen);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: '🏠',
      description: 'Explore Pokemon cards and collections'
    },
    {
      name: 'Cards',
      href: '/cards',
      icon: '🃏',
      description: 'Browse and search Pokemon cards'
    },
    {
      name: 'Pocket Mode',
      href: '/pocketmode',
      icon: '📱',
      description: 'Pokemon Pocket card collection'
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: '⭐',
      badge: (favorites?.cards?.length || 0) + (favorites?.pokemon?.length || 0),
      description: 'Your saved cards and Pokemon'
    },
    {
      name: 'Trending',
      href: '/trending',
      icon: '📈',
      description: 'Popular and trending cards'
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: '🏆',
      description: 'Top collectors and rankings'
    }
  ];

  const quickActions = [
    {
      name: 'Compare Cards',
      icon: '⚖️',
      action: () => {
        // This would open the comparison tool
        const event = new CustomEvent('openComparison');
        window.dispatchEvent(event);
      },
      description: 'Side-by-side card analysis'
    },
    {
      name: 'Price Alerts',
      icon: '🔔',
      action: () => {
        // This would open price alerts
        router.push('/alerts');
      },
      description: 'Set up price notifications'
    },
    {
      name: 'Random Card',
      icon: '🎲',
      action: () => {
        // Random card discovery
        router.push('/cards?random=true');
      },
      description: 'Discover a random card'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  // Enhanced accessibility handlers
  const toggleMenu = (): any => {
    setIsMenuOpen(!isMenuOpen);
    announce(isMenuOpen ? 'Menu closed' : 'Menu opened', 'polite');
    
    if (!isMenuOpen) {
      // Focus will be trapped by useFocusTrap
      setFocusedIndex(0);
    } else {
      // Return focus to menu button
      menuButtonRef.current?.focus();
      setFocusedIndex(-1);
    }
  };

  const handleKeyNavigation = {
    onArrowDown: () => {
      if (isMenuOpen) {
        setFocusedIndex(prev => 
          prev < navigationItems.length - 1 ? prev + 1 : 0
        );
      }
    },
    onArrowUp: () => {
      if (isMenuOpen) {
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : navigationItems.length - 1
        );
      }
    },
    onEscape: () => {
      if (isMenuOpen) {
        toggleMenu();
      }
    },
    onEnter: () => {
      if (isMenuOpen && focusedIndex >= 0) {
        const item = navigationItems[focusedIndex];
        router.push(item.href);
        toggleMenu();
      }
    }
  };

  return (
    <>
      <AnnouncerComponent />
      
      {/* Enhanced Desktop Navigation */}
      <nav 
        role="navigation" 
        aria-label="Main navigation"
        className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4"
      >
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 group" aria-label="DexTrends home">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg" aria-hidden="true">DT</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              DexTrends
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1" role="menubar">
          {navigationItems.map((item, index) => (
            <Link key={item.name} href={item.href}>
              <a 
                role="menuitem"
                aria-current={isActive(item.href) ? 'page' : undefined}
                aria-describedby={`nav-desc-${index}`}
                className={`
                  relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span>{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
                    aria-label={`${item.badge} items`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                <span id={`nav-desc-${index}`} className="sr-only">{item.description}</span>
              </a>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2" role="toolbar" aria-label="Quick actions">
          {quickActions.map((action, index) => (
            <button
              key={action.name}
              onClick={action.action}
              aria-describedby={`action-desc-${index}`}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="text-lg" aria-hidden="true">{action.icon}</span>
              <span className="hidden xl:block text-sm">{action.name}</span>
              <span id={`action-desc-${index}`} className="sr-only">{action.description}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Enhanced Mobile Navigation */}
      <nav className="lg:hidden bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">DT</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                DexTrends
              </span>
            </a>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item: any) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`
                      flex items-center justify-between p-3 rounded-lg font-medium transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                      </div>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              ))}
              
              {/* Mobile Quick Actions */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-3">Quick Actions</div>
                {quickActions.map((action: any) => (
                  <button
                    key={action.name}
                    onClick={() => {
                      action.action();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{action.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Floating Action Button for Card Comparison */}
      <ComparisonFAB />

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.slice(0, 4).map((item: any) => (
            <Link key={item.name} href={item.href}>
              <a className={`
                relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors
                ${isActive(item.href)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300'
                }
              `}>
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer for mobile bottom navigation */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default EnhancedNavigation;