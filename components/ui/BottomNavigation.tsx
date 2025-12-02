import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { Book, CardList, Search } from '@/utils/icons';
import { BsGrid } from 'react-icons/bs';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewport, Z_INDEX } from '@/hooks/useViewport';
import { MoreSheet } from './MoreSheet';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

// Height of bottom nav for use by other components
export const BOTTOM_NAV_HEIGHT = 68;

/**
 * BottomNavigation - Mobile-first bottom navigation bar
 *
 * Provides quick access to main app sections on mobile devices.
 * Only renders on mobile viewports (<640px).
 *
 * Layout: Home | Pokedex | [SEARCH] | TCG | More
 *
 * Features:
 * - 4+1 layout with centered, elevated Search button
 * - "More" button opens MoreSheet with secondary navigation
 * - Fixed to bottom of viewport with z-index 45 (above FAB)
 * - Safe area padding for iOS devices with notch/home indicator
 * - Active state indicators with solid pill background
 * - 68px height for comfortable touch targets (48px minimum)
 */
export const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const viewport = useViewport();
  const [activeRoute, setActiveRoute] = useState('');
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  // Navigation items (excluding Search and More which are handled separately)
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
  ];

  const rightNavItems: NavItem[] = [
    {
      href: '/tcgexpansions',
      label: 'TCG',
      icon: <CardList className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400'
    },
  ];

  // Track active route
  useEffect(() => {
    setActiveRoute(router.pathname);
  }, [router.pathname]);

  // Don't render on desktop or during SSR (prevents hydration mismatch)
  if (!viewport.isMounted || !viewport.isMobile) return null;

  // Check if current route matches nav item (handle nested routes)
  const isActive = (href: string) => {
    if (href === '/') {
      return activeRoute === '/';
    }
    return activeRoute.startsWith(href);
  };

  // Check if any "More" sheet item is active
  const isMoreActive = () => {
    return activeRoute.startsWith('/type-effectiveness') ||
           activeRoute.startsWith('/pocketmode') ||
           activeRoute.startsWith('/favorites') ||
           activeRoute.startsWith('/fun') ||
           activeRoute.startsWith('/battle');
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex flex-col items-center justify-center",
          "flex-1 h-full py-2",
          "transition-all duration-200",
          "tap-highlight-transparent touch-manipulation",
          "relative group",
          "min-w-[56px]" // Ensure adequate touch target width
        )}
      >
        {/* Active background pill */}
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="activeTabBg"
              className={cn(
                "absolute inset-x-2 top-1 bottom-1",
                "bg-stone-100 dark:bg-stone-800",
                "rounded-xl"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>

        {/* Icon with animation */}
        <motion.div
          className={cn(
            "mb-0.5 transition-colors duration-200 relative z-10",
            active ? item.color : "text-stone-500 dark:text-stone-300"
          )}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {item.icon}
        </motion.div>

        {/* Label */}
        <span
          className={cn(
            "text-[10px] font-medium transition-colors duration-200 relative z-10",
            active
              ? "text-stone-900 dark:text-white"
              : "text-stone-500 dark:text-stone-300"
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden under nav */}
      <div className="h-[68px] md:hidden" />

      {/* Bottom Navigation Bar - solid bg for iOS performance */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 md:hidden",
          "bg-white dark:bg-stone-900",
          "border-t border-stone-200 dark:border-stone-700",
          "pb-safe px-safe" // Safe area for iOS home indicator + sides
        )}
        style={{ zIndex: Z_INDEX.bottomNav }}
      >
        <div className="flex items-center justify-around h-[68px] px-1">
          {/* Left nav items: Home, Pokedex */}
          {navItems.map(renderNavItem)}

          {/* Center: Search button (elevated, larger) */}
          <div className="flex items-center justify-center flex-1">
            <motion.button
              onClick={() => router.push('/search')}
              className={cn(
                "relative flex items-center justify-center",
                "w-12 h-12 -mt-3", // Slightly elevated
                "bg-amber-500 hover:bg-amber-600",
                "rounded-full shadow-lg shadow-amber-500/30",
                "transition-colors duration-150",
                "tap-highlight-transparent touch-manipulation"
              )}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Search className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Right nav items: TCG */}
          {rightNavItems.map(renderNavItem)}

          {/* More button */}
          <button
            onClick={() => setMoreSheetOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center",
              "flex-1 h-full py-2",
              "transition-all duration-200",
              "tap-highlight-transparent touch-manipulation",
              "relative group",
              "min-w-[56px]"
            )}
          >
            {/* Active background pill for More */}
            <AnimatePresence>
              {isMoreActive() && (
                <motion.div
                  className={cn(
                    "absolute inset-x-2 top-1 bottom-1",
                    "bg-stone-100 dark:bg-stone-800",
                    "rounded-xl"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>

            <motion.div
              className={cn(
                "mb-0.5 transition-colors duration-200 relative z-10",
                isMoreActive()
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-stone-500 dark:text-stone-300"
              )}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <IoEllipsisHorizontal className="w-5 h-5" />
            </motion.div>

            <span
              className={cn(
                "text-[10px] font-medium transition-colors duration-200 relative z-10",
                isMoreActive()
                  ? "text-stone-900 dark:text-white"
                  : "text-stone-500 dark:text-stone-300"
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More Sheet */}
      <MoreSheet isOpen={moreSheetOpen} onClose={() => setMoreSheetOpen(false)} />
    </>
  );
};

/**
 * Hook to detect if bottom navigation is visible and get its height
 * Useful for adjusting page layouts and positioning other fixed elements
 */
export const useBottomNavigation = () => {
  const viewport = useViewport();
  const hasBottomNav = viewport.isMounted && viewport.isMobile;

  return {
    hasBottomNav,
    bottomNavHeight: hasBottomNav ? BOTTOM_NAV_HEIGHT : 0,
    // CSS value for bottom positioning above the nav
    bottomOffset: hasBottomNav ? `${BOTTOM_NAV_HEIGHT + 16}px` : '16px',
  };
};

export default BottomNavigation;