import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
// Import mobile utils with error handling
let useMobileUtils;
try {
  useMobileUtils = require('../../utils/mobileUtils').useMobileUtils;
} catch (error) {
  useMobileUtils = () => ({ isMobile: true, isTouch: true, utils: { hapticFeedback: () => {} } });
}
import logger from '../../utils/logger';

const MobileNavigation = () => {
  const router = useRouter();
  const { isMobile, isTouch, utils } = useMobileUtils();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    setActiveTab(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    // Close menu on route change
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const navigationItems = [
    { href: '/', label: 'Home', icon: '🏠', shortLabel: 'Home' },
    { href: '/cards', label: 'Cards', icon: '🃏', shortLabel: 'Cards' },
    { href: '/pokedex', label: 'Pokédex', icon: '📱', shortLabel: 'Dex' },
    { href: '/trending', label: 'Trending', icon: '📈', shortLabel: 'Trend' },
    { href: '/pocketmode', label: 'Pocket', icon: '📦', shortLabel: 'Pocket' },
    { href: '/tcgsets', label: 'Sets', icon: '📚', shortLabel: 'Sets' }
  ];

  const handleNavClick = (href) => {
    if (isTouch) {
      utils.hapticFeedback('light');
    }
    
    logger.debug('Mobile navigation click', { href, isMobile });
    
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isTouch) {
      utils.hapticFeedback('medium');
    }
  };

  if (!isMobile) {
    return null; // Don't render on desktop
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {navigationItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 rounded-lg transition-all duration-200 ${
                activeTab === item.href
                  ? 'text-pokemon-blue bg-blue-50'
                  : 'text-gray-600 hover:text-pokemon-blue hover:bg-gray-50'
              }`}
              onClick={() => handleNavClick(item.href)}
            >
              <span className="text-xl mb-1" role="img" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-xs font-medium truncate">{item.shortLabel}</span>
            </Link>
          ))}
          
          {/* More Button */}
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 rounded-lg transition-all duration-200 ${
              isMenuOpen
                ? 'text-pokemon-blue bg-blue-50'
                : 'text-gray-600 hover:text-pokemon-blue hover:bg-gray-50'
            }`}
            aria-label="More options"
          >
            <span className="text-xl mb-1" role="img" aria-hidden="true">
              ⋯
            </span>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
      {/* More Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="absolute bottom-16 left-4 right-4 bg-white rounded-xl shadow-xl p-4 safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-3">
              {navigationItems.slice(5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.href
                      ? 'text-pokemon-blue bg-blue-50'
                      : 'text-gray-700 hover:text-pokemon-blue hover:bg-gray-50'
                  }`}
                  onClick={() => handleNavClick(item.href)}
                >
                  <span className="text-2xl mr-3" role="img" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* Quick Actions */}
              <div className="col-span-2 border-t pt-3 mt-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      // Implement search functionality
                      setIsMenuOpen(false);
                      logger.debug('Quick search triggered');
                    }}
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-pokemon-blue hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-lg mr-2">🔍</span>
                    <span className="text-sm">Search</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Implement favorites
                      setIsMenuOpen(false);
                      logger.debug('Favorites triggered');
                    }}
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-pokemon-blue hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-lg mr-2">❤️</span>
                    <span className="text-sm">Favorites</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Safe area spacer for bottom navigation */}
      <div className="h-16 safe-area-bottom" />
    </>
  );
};

export default MobileNavigation;