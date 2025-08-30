import React, { ReactNode, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '@/utils/logger';

// Preserve the working BottomSheet for mobile
const BottomSheet = dynamic(
  () => import('@/components/mobile/BottomSheet'),
  { ssr: false }
);

interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  // Desktop modal specific props
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  // Mobile specific props
  mobileHeight?: string;
  showHandle?: boolean;
}

/**
 * AdaptiveModal - Responsive modal component
 * 
 * PROTECTION: Preserves BottomSheet on mobile for native feel
 * Mobile (<768px): Uses BottomSheet for native mobile UX
 * Tablet/Desktop (768px+): Traditional centered modal
 * 
 * This provides the best UX for each platform while maintaining
 * a single API for developers
 */
export const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  mobileHeight = '80vh',
  showHandle = true
}) => {
  const { isMobile } = useMobileDetection(768);

  // Handle escape key for desktop
  useEffect(() => {
    if (!isMobile && isOpen && closeOnEscape) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isMobile, isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [isOpen]);

  // Log mode for debugging
  useEffect(() => {
    logger.debug('AdaptiveModal mode', {
      isMobile,
      isOpen,
      size
    });
  }, [isMobile, isOpen, size]);

  // Mobile: Use BottomSheet for native feel
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        className={className}
        // Convert height to snap point (e.g., '80vh' -> 0.8)
        snapPoints={[parseFloat(mobileHeight) / 100]}
        initialSnapPoint={parseFloat(mobileHeight) / 100}
        showHandle={showHandle}
      >
        {children}
      </BottomSheet>
    );
  }

  // Desktop: Traditional modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={closeOnBackdrop ? onClose : undefined}
            data-testid="modal-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
              'z-50 w-[calc(100%-2rem)] max-h-[calc(100vh-4rem)]',
              'overflow-hidden',
              sizeClasses[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-content"
          >
            {/* Header */}
            {title && (
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            <div className={cn(
              'overflow-y-auto',
              title ? 'max-h-[calc(100vh-8rem)]' : 'max-h-[calc(100vh-4rem)]'
            )}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Simplified modal for quick actions
export const QuickModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  const typeColors = {
    info: 'from-blue-500 to-purple-600',
    warning: 'from-yellow-500 to-orange-600',
    error: 'from-red-500 to-pink-600',
    success: 'from-green-500 to-emerald-600'
  };

  const typeIcons = {
    info: '💡',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="p-6"
    >
      <div className="text-center">
        <div className="text-5xl mb-4">{typeIcons[type]}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                'flex-1 py-3 bg-gradient-to-r text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200',
                typeColors[type]
              )}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </AdaptiveModal>
  );
};

// Hook to manage modal state
export const useAdaptiveModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

export default AdaptiveModal;