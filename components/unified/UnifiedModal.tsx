import React, { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';
// @ts-ignore - TypeScript issue with haptic exports
import hapticFeedback from '@/utils/hapticFeedback';
import logger from '@/utils/logger';

/**
 * UnifiedModal - Intelligent modal component that adapts to context
 * 
 * Automatically chooses the best presentation:
 * - Mobile (<768px): Bottom sheet with drag gestures
 * - Tablet (768-1024px): Side panel or bottom sheet (context-aware)
 * - Desktop (1024px+): Centered modal or side panel
 * 
 * Features:
 * - Smart detection based on trigger type
 * - Smooth animations and transitions
 * - Gesture support on touch devices
 * - Accessibility compliant
 * - Zero configuration needed
 */

export type ModalTrigger = 'default' | 'filter' | 'detail' | 'form' | 'menu' | 'search';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'adaptive';

export interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  
  // Content
  title?: string;
  description?: string;
  footer?: ReactNode;
  
  // Behavior hints
  trigger?: ModalTrigger;
  size?: ModalSize;
  
  // Customization
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  
  // Mobile specific
  snapPoints?: number[]; // Percentage of screen height
  initialSnapPoint?: number;
  showHandle?: boolean;
  
  // Desktop specific
  position?: 'center' | 'left' | 'right';
  maxWidth?: string;
  maxHeight?: string;
}

// Smart detection: Choose presentation based on trigger and viewport
function getModalPresentation(
  trigger: ModalTrigger,
  viewportWidth: number
): 'bottom-sheet' | 'side-panel' | 'modal' {
  // Mobile always uses bottom sheet
  if (viewportWidth < 768) {
    return 'bottom-sheet';
  }
  
  // Tablet: Context-aware
  if (viewportWidth < 1024) {
    switch (trigger) {
      case 'filter':
      case 'menu':
        return 'side-panel';
      default:
        return 'bottom-sheet';
    }
  }
  
  // Desktop: Context-aware
  switch (trigger) {
    case 'filter':
    case 'menu':
    case 'search':
      return 'side-panel';
    default:
      return 'modal';
  }
}

// Size configurations
const SIZE_CONFIG = {
  sm: { maxWidth: '400px', maxHeight: '500px' },
  md: { maxWidth: '600px', maxHeight: '700px' },
  lg: { maxWidth: '800px', maxHeight: '90vh' },
  xl: { maxWidth: '1200px', maxHeight: '90vh' },
  full: { maxWidth: '95vw', maxHeight: '95vh' },
  adaptive: { maxWidth: 'auto', maxHeight: 'auto' }
};

export function UnifiedModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  footer,
  trigger = 'default',
  size = 'adaptive',
  className,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnapPoint = 0.6,
  showHandle = true,
  position = 'center',
  maxWidth,
  maxHeight
}: UnifiedModalProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 375
  );
  const [presentation, setPresentation] = useState<'bottom-sheet' | 'side-panel' | 'modal'>('modal');
  const modalRef = useRef<HTMLDivElement>(null);
  const { impact } = hapticFeedback;
  
  // Motion values for gestures
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);
  
  // Update viewport width and presentation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setPresentation(getModalPresentation(trigger, width));
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [trigger]);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);
  
  // Handle drag end for bottom sheet
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const shouldClose = info.velocity.y > 500 || (info.velocity.y > 0 && y.get() > 100);
    
    if (shouldClose) {
      onClose();
    } else {
      // Snap back
      y.set(0);
    }
  }, [y, onClose]);
  
  // Get size configuration
  const sizeConfig = size === 'adaptive' 
    ? presentation === 'bottom-sheet' 
      ? { maxWidth: '100%', maxHeight: '90vh' }
      : presentation === 'side-panel'
      ? { maxWidth: '400px', maxHeight: '100vh' }
      : SIZE_CONFIG.md
    : SIZE_CONFIG[size];
  
  const finalMaxWidth = maxWidth || sizeConfig.maxWidth;
  const finalMaxHeight = maxHeight || sizeConfig.maxHeight;
  
  // Log presentation mode
  useEffect(() => {
    logger.debug('UnifiedModal presentation', {
      trigger,
      presentation,
      viewportWidth,
      isOpen
    });
  }, [trigger, presentation, viewportWidth, isOpen]);
  
  // Render based on presentation mode
  const renderContent = () => {
    const contentElement = (
      <>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-4"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </>
    );
    
    // Bottom Sheet
    if (presentation === 'bottom-sheet') {
      return (
        <motion.div
          ref={modalRef}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl',
            'flex flex-col',
            className
          )}
          style={{ 
            y,
            maxHeight: finalMaxHeight,
            touchAction: 'none'
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          data-testid="unified-modal-bottom-sheet"
        >
          {/* Drag handle */}
          {showHandle && (
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
          )}
          
          {contentElement}
        </motion.div>
      );
    }
    
    // Side Panel
    if (presentation === 'side-panel') {
      return (
        <motion.div
          ref={modalRef}
          className={cn(
            'fixed top-0 bottom-0 z-50',
            'bg-white dark:bg-gray-900 shadow-2xl',
            'flex flex-col',
            position === 'left' ? 'left-0' : 'right-0',
            className
          )}
          style={{ 
            width: finalMaxWidth,
            maxWidth: '90vw'
          }}
          initial={{ x: position === 'left' ? '-100%' : '100%' }}
          animate={{ x: 0 }}
          exit={{ x: position === 'left' ? '-100%' : '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          data-testid="unified-modal-side-panel"
        >
          {contentElement}
        </motion.div>
      );
    }
    
    // Centered Modal
    return (
      <motion.div
        ref={modalRef}
        className={cn(
          'fixed left-1/2 top-1/2 z-50',
          'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
          'flex flex-col',
          className
        )}
        style={{ 
          x: '-50%',
          y: '-50%',
          maxWidth: finalMaxWidth,
          maxHeight: finalMaxHeight,
          width: size === 'full' ? finalMaxWidth : 'auto'
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        data-testid="unified-modal-centered"
      >
        {contentElement}
      </motion.div>
    );
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            style={{ opacity: presentation === 'bottom-sheet' ? opacity : 1 }}
            data-testid="unified-modal-backdrop"
          />
          
          {/* Modal content */}
          {renderContent()}
        </>
      )}
    </AnimatePresence>
  );
}

// Preset modal components for common use cases
export const FilterModal: React.FC<Omit<UnifiedModalProps, 'trigger'>> = (props) => (
  <UnifiedModal {...props} trigger="filter" />
);

export const DetailModal: React.FC<Omit<UnifiedModalProps, 'trigger'>> = (props) => (
  <UnifiedModal {...props} trigger="detail" />
);

export const FormModal: React.FC<Omit<UnifiedModalProps, 'trigger'>> = (props) => (
  <UnifiedModal {...props} trigger="form" />
);

// Hook for managing modal state
export function useUnifiedModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  
  const open = useCallback((content?: ReactNode) => {
    if (content) setContent(content);
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
    // Clear content after animation
    setTimeout(() => setContent(null), 300);
  }, []);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  return {
    isOpen,
    content,
    open,
    close,
    toggle,
    setContent
  };
}

export default UnifiedModal;