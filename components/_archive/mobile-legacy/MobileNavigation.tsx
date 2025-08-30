import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
// Icon imports
import { 
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineHeart
} from 'react-icons/ai';
import { 
  BsGrid, 
  BsCardList, 
  BsBook,
  BsThreeDots
} from 'react-icons/bs';
import { GiCardPickup } from 'react-icons/gi';
import { FiTrendingUp } from 'react-icons/fi';
// Import mobile utils with error handling
let useMobileUtils: () => { isMobile: boolean; isTouch: boolean; utils: { hapticFeedback: (type: string) => void } };
try {
  useMobileUtils = require('../../utils/mobileUtils').useMobileUtils;
} catch (error) {
  useMobileUtils = () => ({ isMobile: true, isTouch: true, utils: { hapticFeedback: () => {} } });
}
import logger from '../../utils/logger';
import { borderRadiusClasses } from '../../styles/design-tokens';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  shortLabel: string;
}

const MobileNavigation: React.FC = () => {
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

  const navigationItems: NavigationItem[] = [
    { href: '/', label: 'Home', icon: <AiOutlineHome className="w-6 h-6" />, shortLabel: 'Home' },
    { href: '/cards', label: 'Cards', icon: <BsCardList className="w-6 h-6" />, shortLabel: 'Cards' },
    { href: '/pokedex', label: 'Pokédex', icon: <BsGrid className="w-6 h-6" />, shortLabel: 'Dex' },
    { href: '/trending', label: 'Trending', icon: <FiTrendingUp className="w-6 h-6" />, shortLabel: 'Trend' },
    { href: '/pocketmode', label: 'Pocket', icon: <GiCardPickup className="w-6 h-6" />, shortLabel: 'Pocket' },
    { href: '/tcg-sets', label: 'Sets', icon: <BsBook className="w-6 h-6" />, shortLabel: 'Sets' }
  ];

  const handleNavClick = (href: string): void => {
    if (isTouch) {
      utils.hapticFeedback('light');
    }
    
    logger.debug('Mobile navigation click', { href, isMobile });
    
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = (): void => {
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom backdrop-blur-xl">
        <div className="flex justify-around items-center h-16 px-2">
          {/* More Button - Moved to left side */}
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 py-1 px-1 ${borderRadiusClasses.lg} transition-all duration-300 ${
              isMenuOpen
                ? 'text-white bg-gradient-to-r from-pokemon-red to-pink-500 shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-pokemon-red dark:hover:text-pink-400 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20'
            }`}
            aria-label="More options"
          >
            <span className="mb-1 transition-transform duration-300 hover:scale-110">
              <BsThreeDots className="w-6 h-6" />
            </span>
            <span className="text-xs font-medium">More</span>
          </button>
          
          {/* Main navigation items */}
          {navigationItems.slice(0, 5).map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 py-1 px-1 ${borderRadiusClasses.lg} transition-all duration-300 ${
                activeTab === item.href
                  ? 'text-white bg-gradient-to-r from-pokemon-red to-pink-500 shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-pokemon-red dark:hover:text-pink-400 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20'
              }`}
              onClick={() => handleNavClick(item.href)}
            >
              <span className="mb-1 transition-transform duration-300 hover:scale-110">
                {item.icon}
              </span>
              <span className="text-xs font-medium truncate">{item.shortLabel}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* More Menu Overlay - Positioned on left side */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)}>
          <div 
            className={`fixed bottom-16 left-0 bg-white dark:bg-gray-900 ${borderRadiusClasses.xl} shadow-xl p-6 safe-area-bottom border border-gray-200 dark:border-gray-700`}
            style={{ 
              width: '280px',
              borderTopLeftRadius: '0',
              borderBottomLeftRadius: '0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-3">
              {navigationItems.slice(5).map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`flex items-center p-3 ${borderRadiusClasses.lg} transition-all duration-300 min-h-[44px] ${
                    activeTab === item.href
                      ? 'text-white bg-gradient-to-r from-pokemon-red to-pink-500 shadow-lg transform scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:text-pokemon-red dark:hover:text-pink-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20'
                  }`}
                  onClick={() => handleNavClick(item.href)}
                >
                  <span className="mr-3 transition-transform duration-300 hover:scale-110">
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
                    className={`flex items-center justify-center p-3 min-h-[44px] text-gray-600 dark:text-gray-400 hover:text-pokemon-red dark:hover:text-pink-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 ${borderRadiusClasses.lg} transition-all duration-300`}
                  >
                    <AiOutlineSearch className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Search</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Implement favorites
                      setIsMenuOpen(false);
                      logger.debug('Favorites triggered');
                    }}
                    className={`flex items-center justify-center p-3 min-h-[44px] text-gray-600 dark:text-gray-400 hover:text-pokemon-red dark:hover:text-pink-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 ${borderRadiusClasses.lg} transition-all duration-300`}
                  >
                    <AiOutlineHeart className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Favorites</span>
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