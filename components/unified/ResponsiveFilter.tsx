import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { cn } from '@/utils/cn';
import logger from '@/utils/logger';

// Preserve the working BottomSheet component for mobile
const BottomSheet = dynamic(
  () => import('@/components/mobile/BottomSheet'),
  { ssr: false }
);

interface ResponsiveFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  // Desktop-specific props
  position?: 'left' | 'right';
  width?: string;
  overlay?: boolean;
}

/**
 * ResponsiveFilter - Adaptive filter component
 * 
 * PROTECTION: Preserves BottomSheet behavior on mobile
 * Mobile (<768px): Uses original BottomSheet component
 * Tablet (768-1024px): Uses BottomSheet with more height
 * Desktop (1024px+): Transforms to sidebar panel
 * 
 * This ensures the successful mobile pattern extends to tablet
 * while providing a more traditional sidebar on desktop
 */
export const ResponsiveFilter: React.FC<ResponsiveFilterProps> = ({
  isOpen,
  onClose,
  onApply,
  title = 'Filters',
  children,
  className = '',
  position = 'right',
  width = '320px',
  overlay = true
}) => {
  const { isMobile } = useMobileDetection(768); // Use BottomSheet up to tablet
  const { isMobile: isSmallMobile } = useMobileDetection(430); // True mobile

  React.useEffect(() => {
    logger.debug('ResponsiveFilter mode', {
      isMobile,
      isSmallMobile,
      isOpen
    });
  }, [isMobile, isSmallMobile, isOpen]);

  // Mobile and Tablet: Use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        className={className}
        // Use snap points instead of height
        snapPoints={isSmallMobile ? [0.8] : [0.7]}
        initialSnapPoint={isSmallMobile ? 0.8 : 0.7}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          {onApply && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </BottomSheet>
    );
  }

  // Desktop: Sidebar Panel
  return (
    <>
      {/* Overlay backdrop for desktop */}
      {overlay && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
          data-testid="filter-backdrop"
        />
      )}

      {/* Sidebar panel */}
      <div
        className={cn(
          'fixed top-0 h-full bg-white dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 ease-out',
          position === 'left' ? 'left-0' : 'right-0',
          isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full',
          className
        )}
        style={{ width }}
        data-testid="filter-sidebar"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-73px)]">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {/* Footer with Apply button */}
          {onApply && (
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onApply();
                    onClose();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Alternative inline filter panel for desktop (non-overlay)
export const InlineFilterPanel: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { isMobile } = useMobileDetection(1024);

  if (isMobile) {
    // On smaller screens, hide inline panel
    return null;
  }

  return (
    <div className={cn(
      'hidden lg:block w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
      className
    )}>
      <div className="sticky top-20 p-6 space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// Hook to manage filter state across responsive modes
export const useResponsiveFilter = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isMobile } = useMobileDetection(768);

  const open = React.useCallback(() => {
    setIsOpen(true);
    // Lock body scroll on mobile
    if (isMobile && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }, [isMobile]);

  const close = React.useCallback(() => {
    setIsOpen(false);
    // Restore body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle: () => isOpen ? close() : open()
  };
};

export default ResponsiveFilter;