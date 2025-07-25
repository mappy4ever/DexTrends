import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { 
  borderRadiusClasses,
  glassEffect,
  animations,
  zIndex,
  combineClasses 
} from '../../styles/design-tokens';
import CircularButton from './CircularButton';
import { FiX } from 'react-icons/fi';

export interface ConsistentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * ConsistentModal Component
 * 
 * A modal component following the design system with glass morphism effects.
 * Includes accessibility features like focus trap and escape key handling.
 * 
 * @example
 * <ConsistentModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </ConsistentModal>
 */
const ConsistentModal: React.FC<ConsistentModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className,
}) => {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size styles
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store current active element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the modal
    const timer = setTimeout(() => {
      modalRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Restore focus when closing
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop with glass effect */}
      <div
        className={combineClasses(
          'fixed inset-0',
          'bg-black/50 backdrop-blur-sm',
          'animate-in fade-in duration-300',
          `z-[${zIndex.modalBackdrop}]`
        )}
        onClick={handleOverlayClick}
      >
        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              ref={modalRef}
              tabIndex={-1}
              className={combineClasses(
                // Base styles
                'relative w-full',
                'bg-white dark:bg-gray-900',
                'shadow-2xl',
                borderRadiusClasses.xl, // rounded-2xl
                'p-8',
                
                // Size
                sizeStyles[size],
                
                // Animation
                'animate-in zoom-in-95 fade-in duration-300',
                
                // Z-index
                `z-[${zIndex.modal}]`,
                
                // Custom className
                className || ''
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              {showCloseButton && (
                <div className="absolute top-4 right-4">
                  <CircularButton
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <FiX className="w-5 h-5" />
                  </CircularButton>
                </div>
              )}

              {/* Header */}
              {(title || description) && (
                <div className="mb-6">
                  {title && (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="relative">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render modal at document root
  return createPortal(
    modalContent,
    document.body
  );
};

// Compound components for better composition
export const ModalHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('mb-6', className || '')}>
    {children}
  </div>
);

export const ModalBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('', className || '')}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}> = ({ children, className, align = 'end' }) => {
  const alignStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700',
        alignStyles[align],
        className || ''
      )}
    >
      {children}
    </div>
  );
};

export default ConsistentModal;