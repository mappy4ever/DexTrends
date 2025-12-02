import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { CrossedSwords, Heart, CardPickup } from '@/utils/icons';
import { IoSettingsOutline, IoGameControllerOutline, IoClose } from 'react-icons/io5';
import { Z_INDEX } from '@/hooks/useViewport';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SheetNavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const navItems: SheetNavItem[] = [
  {
    href: '/type-effectiveness',
    label: 'Battle Tools',
    description: 'Type charts & damage calc',
    icon: <CrossedSwords className="w-5 h-5" />,
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    href: '/pocketmode',
    label: 'Pocket Mode',
    description: 'Pokemon Pocket cards & decks',
    icon: <CardPickup className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    href: '/favorites',
    label: 'Favorites',
    description: 'Your saved Pokemon & cards',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-red-600 dark:text-red-400',
  },
  {
    href: '/fun',
    label: 'Fun & Games',
    description: 'Quizzes and mini games',
    icon: <IoGameControllerOutline className="w-5 h-5" />,
    color: 'text-green-600 dark:text-green-400',
  },
];

/**
 * MoreSheet - Bottom sheet with secondary navigation items
 *
 * Triggered from the "More" button in BottomNavigation.
 * Contains: Battle Tools, Pocket Mode, Favorites, Fun & Games
 */
export const MoreSheet: React.FC<MoreSheetProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - no blur on mobile for better rendering */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            style={{ zIndex: Z_INDEX.modal - 1 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0',
              'bg-white dark:bg-stone-900',
              'rounded-t-2xl',
              'pb-safe px-safe',
              'shadow-2xl',
              'transform-gpu'
            )}
            style={{
              zIndex: Z_INDEX.modal,
              // Hardware acceleration for mobile rendering
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100 dark:border-stone-800">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                More
              </h2>
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-full',
                  'hover:bg-stone-100 dark:hover:bg-stone-800',
                  'transition-colors duration-150',
                  'touch-manipulation tap-highlight-transparent'
                )}
              >
                <IoClose className="w-5 h-5 text-stone-500 dark:text-stone-300" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="px-2 py-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3',
                    'rounded-xl',
                    'hover:bg-stone-50 dark:hover:bg-stone-800/50',
                    'active:bg-stone-100 dark:active:bg-stone-800',
                    'transition-colors duration-150',
                    'touch-manipulation tap-highlight-transparent',
                    'min-h-[56px]' // 56px for comfortable touch
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center',
                    'w-10 h-10 rounded-xl',
                    'bg-stone-100 dark:bg-stone-800',
                    item.color
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-300 truncate">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-stone-400 dark:text-stone-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Bottom padding for safe area */}
            <div className="h-4" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MoreSheet;
