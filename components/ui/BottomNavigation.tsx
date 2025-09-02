import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { Book, CardList, CrossedSwords, Search } from '@/utils/icons';
import { BsGrid } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewport } from '@/hooks/useViewport';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * BottomNavigation - Mobile-first bottom navigation bar
 * 
 * Provides quick access to main app sections on mobile devices.
 * Only renders on mobile viewports (<460px).
 * Features:
 * - Fixed to bottom of viewport
 * - Safe area padding for iOS devices
 * - Active state indicators
 * - Smooth transitions
 * - 60px height for comfortable touch targets
 */
export const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const viewport = useViewport();
  const [activeRoute, setActiveRoute] = useState('');

  // Navigation items
  const navItems: NavItem[] = [
    { 
      href: '/', 
      label: 'Home', 
      icon: <BsGrid className="w-5 h-5" />,
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      href: '/pokedex', 
      label: 'Pokédex', 
      icon: <Book className="w-5 h-5" />,
      color: 'text-red-600 dark:text-red-400'
    },
    { 
      href: '/tcgexpansions', 
      label: 'TCG', 
      icon: <CardList className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      href: '/type-effectiveness', 
      label: 'Battle', 
      icon: <CrossedSwords className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      href: '/search', 
      label: 'Search', 
      icon: <Search className="w-5 h-5" />,
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  // Track active route
  useEffect(() => {
    setActiveRoute(router.pathname);
  }, [router.pathname]);

  // Don't render on desktop
  if (!viewport.isMobile) return null;

  // Check if current route matches nav item (handle nested routes)
  const isActive = (href: string) => {
    if (href === '/') {
      return activeRoute === '/';
    }
    return activeRoute.startsWith(href);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden under nav */}
      <div className="h-[60px] md:hidden" />
      
      {/* Bottom Navigation Bar */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 md:hidden",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg",
          "border-t border-gray-200 dark:border-gray-700",
          "safe-area-bottom" // For iOS safe area
        )}
      >
        <div className="flex items-center justify-around h-[60px] px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "w-full h-full py-2",
                  "transition-all duration-200",
                  "tap-highlight-transparent touch-manipulation",
                  "relative group"
                )}
              >
                {/* Active indicator */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className={cn(
                        "absolute top-0 left-1/2 -translate-x-1/2",
                        "w-8 h-0.5 rounded-full",
                        "bg-gradient-to-r from-purple-500 to-purple-600"
                      )}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Icon with animation */}
                <motion.div
                  className={cn(
                    "mb-1 transition-colors duration-200",
                    active ? item.color : "text-gray-500 dark:text-gray-400"
                  )}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {item.icon}
                </motion.div>
                
                {/* Label */}
                <span 
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    active 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {item.label}
                </span>
                
                {/* Touch feedback ripple */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-800 opacity-0"
                  whileTap={{ opacity: 0.1 }}
                  transition={{ duration: 0.15 }}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

/**
 * Hook to detect if bottom navigation is visible
 * Useful for adjusting page layouts
 */
export const useBottomNavigation = () => {
  const viewport = useViewport();
  
  return { hasBottomNav: viewport.isMobile };
};

export default BottomNavigation;