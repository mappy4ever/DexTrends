import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { IoClose } from 'react-icons/io5';
import logger from '../../utils/logger';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type ModalAnimation = 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade' | 'none';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  animation?: ModalAnimation;
  closeOnOverlayClick?: boolean;
  closeOnBackdrop?: boolean; // Alias for closeOnOverlayClick for backward compatibility
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  mobileAsSheet?: boolean;
  backdrop?: boolean | 'blur';
  zIndex?: number;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
  preventScroll?: boolean;
  focusTrap?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

/**
 * Unified Modal Component
 * Combines features from all modal variants into a single, comprehensive component
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'center',
  animation = 'scale',
  closeOnOverlayClick,
  closeOnBackdrop, // Alias for backward compatibility
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  className,
  contentClassName,
  overlayClassName,
  mobileAsSheet = true,
  backdrop = true,
  zIndex = 50,
  onAfterOpen,
  onAfterClose,
  preventScroll = true,
  focusTrap = true,
  initialFocus
}) => {
  // Handle closeOnBackdrop alias
  const shouldCloseOnOverlay = closeOnOverlayClick ?? closeOnBackdrop ?? true;
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640); // Use Tailwind's sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mounting for portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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
  }, [isOpen, onClose, closeOnEscape]);

  // Handle body scroll lock and focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
      
      // Focus management
      if (focusTrap && modalRef.current) {
        const timer = setTimeout(() => {
          if (initialFocus?.current) {
            initialFocus.current.focus();
          } else {
            const focusableElements = modalRef.current?.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements && focusableElements.length > 0) {
              (focusableElements[0] as HTMLElement).focus();
            }
          }
        }, 100);
        return () => clearTimeout(timer);
      }

      onAfterOpen?.();
    } else {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
      
      // Restore focus
      if (previousActiveElement.current && focusTrap) {
        previousActiveElement.current.focus();
      }

      onAfterClose?.();
    }

    return () => {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, preventScroll, focusTrap, initialFocus, onAfterOpen, onAfterClose]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen || !focusTrap || !modalRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, focusTrap]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (shouldCloseOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  }, [shouldCloseOnOverlay, onClose]);

  // Size styles
  const sizeStyles: Record<ModalSize, string> = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full mx-4'
  };

  // Position styles
  const positionStyles: Record<ModalPosition, string> = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16',
    left: 'items-center justify-start pl-16',
    right: 'items-center justify-end pr-16'
  };

  // Animation variants
  const animationVariants = {
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 }
    },
    'slide-up': {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    },
    'slide-down': {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    'slide-left': {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    },
    'slide-right': {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    none: {
      initial: {},
      animate: {},
      exit: {}
    }
  };

  // Determine if should render as sheet on mobile
  const shouldRenderAsSheet = mobileAsSheet && isMobileView && position === 'center';
  const effectivePosition = shouldRenderAsSheet ? 'bottom' : position;
  const effectiveAnimation = shouldRenderAsSheet ? 'slide-up' : animation;

  if (!isMounted) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          {backdrop && (
            <motion.div
              className={cn(
                'fixed inset-0',
                backdrop === 'blur' ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/50',
                overlayClassName
              )}
              style={{ zIndex }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleOverlayClick}
              aria-hidden="true"
            />
          )}

          {/* Modal */}
          <motion.div
            className={cn(
              'fixed inset-0 flex overflow-y-auto',
              positionStyles[effectivePosition],
              'pointer-events-none'
            )}
            style={{ zIndex: zIndex + 1 }}
            aria-hidden="true"
          >
            <motion.div
              ref={modalRef}
              className={cn(
                'relative bg-white dark:bg-gray-800 rounded-lg shadow-xl',
                'pointer-events-auto',
                'w-full',
                sizeStyles[size],
                shouldRenderAsSheet && 'rounded-b-none rounded-t-2xl max-w-full',
                className
              )}
              variants={animationVariants[effectiveAnimation]}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                  {title && (
                    <div className="flex-1">
                      {typeof title === 'string' ? (
                        <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                          {title}
                        </h2>
                      ) : (
                        <div id="modal-title">{title}</div>
                      )}
                      {description && (
                        <p id="modal-description" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {description}
                        </p>
                      )}
                    </div>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className={cn(
                        'ml-4 p-2 rounded-lg',
                        'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        'transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500'
                      )}
                      aria-label="Close modal"
                    >
                      <IoClose className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className={cn('p-4 md:p-6', contentClassName)}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                  {footer}
                </div>
              )}

              {/* Pull indicator for mobile sheet */}
              {shouldRenderAsSheet && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Re-export for backward compatibility
export default Modal;

// Helper hook for modal state management
export const useModalState = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => {
    logger.debug('Modal opened');
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    logger.debug('Modal closed');
    setIsOpen(false);
  }, []);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
};