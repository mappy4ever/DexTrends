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
  hasBottomNav = true,
  hasHeader = true,
  headerTitle,
  backgroundColor = 'white',
  fullHeight = true,
  safeAreaInsets = true,
}) => {
  const router = useRouter();
  const [isIOS, setIsIOS] = useState(false);
  const [hasNotch, setHasNotch] = useState(false);

  useEffect(() => {
    // Detect iOS and notch
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const iOS = /iPhone|iPad|iPod/.test(userAgent);
      setIsIOS(iOS);

      // Check for notch (iPhone X and later)
      const screenHeight = window.screen.height;
      const screenWidth = window.screen.width;
      const hasNotchDevice = iOS && (
        (screenWidth === 375 && screenHeight === 812) || // iPhone X, XS, 11 Pro
        (screenWidth === 414 && screenHeight === 896) || // iPhone XR, XS Max, 11, 11 Pro Max
        (screenWidth === 390 && screenHeight === 844) || // iPhone 12, 12 Pro, 13, 13 Pro, 14, 14 Pro
        (screenWidth === 428 && screenHeight === 926) || // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
        (screenWidth === 393 && screenHeight === 852) || // iPhone 14 Pro
        (screenWidth === 430 && screenHeight === 932)    // iPhone 14 Pro Max
      );
      setHasNotch(hasNotchDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const backgroundClasses = {
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-950',
    gradient: 'bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950'
  };

  return (
    <div
      className={cn(
        'mobile-layout relative min-h-screen',
        fullHeight && 'h-screen',
        backgroundClasses[backgroundColor],
        className
      )}
    >
      {/* Safe area top for notch */}
      {safeAreaInsets && hasNotch && (
        <div className="safe-area-top h-11 bg-inherit" />
      )}

      {/* Optional Header */}
      {hasHeader && (
        <motion.header
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          className={cn(
            'mobile-header sticky top-0 z-40',
            'h-14 px-4 flex items-center justify-between',
            'bg-white/95 dark:bg-gray-900/95',
            'backdrop-blur-md border-b border-gray-200 dark:border-gray-800',
            hasNotch && 'top-11'
          )}
        >
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {headerTitle && (
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              {headerTitle}
            </h1>
          )}
          
          <div className="w-9" /> {/* Spacer for centering */}
        </motion.header>
      )}

      {/* Main Content Area */}
      <main
        className={cn(
          'mobile-content flex-1 overflow-y-auto overflow-x-hidden',
          hasBottomNav && 'pb-16',
          hasHeader && 'pt-0'
        )}
        style={{
          maxHeight: hasBottomNav ? 'calc(100vh - 64px)' : '100vh',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>

      {/* Safe area bottom for home indicator */}
      {safeAreaInsets && hasBottomNav && (
        <div className="safe-area-bottom h-8 bg-inherit" />
      )}
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