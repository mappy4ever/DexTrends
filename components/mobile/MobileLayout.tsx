import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
  headerTitle?: string;
  backgroundColor?: 'white' | 'gray' | 'gradient';
  fullHeight?: boolean;
  safeAreaInsets?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className,
  hasBottomNav = false, // Default to no bottom nav for more space
  hasHeader = true,
  headerTitle,
  backgroundColor = 'white',
  fullHeight = true,
  safeAreaInsets = true,
}) => {
  const router = useRouter();
  const [hasNotch, setHasNotch] = useState(false);

  useEffect(() => {
    // Simple notch detection based on CSS env() support
    const checkNotch = () => {
      const hasNotchSupport = CSS.supports('padding-top', 'env(safe-area-inset-top)');
      if (hasNotchSupport) {
        const safeTop = getComputedStyle(document.documentElement).getPropertyValue('--m-safe-top');
        setHasNotch(safeTop !== '0px' && safeTop !== '');
      }
    };
    
    checkNotch();
  }, []);

  const backgroundClasses = {
    white: 'bg-white dark:bg-black',
    gray: 'bg-gray-50 dark:bg-gray-950',
    gradient: 'bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black'
  };

  return (
    <div
      className={cn(
        'mobile-layout',
        fullHeight && 'full-screen',
        backgroundClasses[backgroundColor],
        className
      )}
    >
      {/* Compact Header - 44px only */}
      {hasHeader && (
        <header
          className={cn(
            'mobile-header',
            hasNotch && 'with-safe-area'
          )}
        >
          <button
            onClick={() => router.back()}
            className="touch-target active-scale"
            style={{ width: '44px', padding: '0' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {headerTitle && (
            <h1 className="flex-1 text-center truncate" style={{ fontSize: 'var(--m-text-md)', fontWeight: '600' }}>
              {headerTitle}
            </h1>
          )}
          
          <div style={{ width: '44px' }} /> {/* Spacer for centering */}
        </header>
      )}

      {/* Main Content Area */}
      <main
        className={cn(
          'mobile-content',
          hasHeader && hasNotch && 'with-safe-header',
          hasBottomNav && 'pb-14'
        )}
      >
        {children}
      </main>
    </div>
  );
};

// Mobile Container Component for consistent padding
export const MobileContainer: React.FC<{
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}> = ({ children, className, noPadding = false }) => {
  return (
    <div
      className={cn(
        'mobile-container',
        !noPadding && 'px-4 py-4',
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile Section Component
export const MobileSection: React.FC<{
  children: ReactNode;
  title?: string;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}> = ({ children, title, className, collapsible = false, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={cn('mobile-section mb-6', className)}>
      {title && (
        <div
          className={cn(
            'mobile-section-header flex items-center justify-between mb-3',
            collapsible && 'cursor-pointer'
          )}
          onClick={() => collapsible && setIsOpen(!isOpen)}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {collapsible && (
            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          )}
        </div>
      )}
      
      <AnimatePresence>
        {(!collapsible || isOpen) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : undefined}
            animate={{ height: 'auto', opacity: 1 }}
            exit={collapsible ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};