/**
 * Modal Wrapper Component
 * Provides compatibility layer between old Modal API and AdvancedModalSystem
 * This allows gradual migration of existing modal usage
 */
import React, { useEffect, useRef } from 'react';
import { useModal } from './AdvancedModalSystem.hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  className?: string;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

// Map old size props to AdvancedModalSystem sizes
const mapSize = (size: ModalProps['size']): 'small' | 'medium' | 'large' | 'xl' | 'full' => {
  switch (size) {
    case 'sm':
      return 'small';
    case 'md':
      return 'medium';
    case 'lg':
    case 'xl':
    case '2xl':
      return 'large';
    case '3xl':
    case '4xl':
    case '5xl':
      return 'xl';
    case 'full':
      return 'full';
    default:
      return 'medium';
  }
};

/**
 * Compatibility wrapper for existing Modal usage
 * This component mimics the old Modal API but uses AdvancedModalSystem internally
 */
const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md",
  className = "",
  closeOnBackdrop = true,
  showCloseButton = true
}) => {
  const modalIdRef = useRef<string | null>(null);
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (isOpen && !modalIdRef.current) {
      // Create a component for the modal content
      const ModalContent: React.FC = () => (
        <div className={`modal-wrapper ${className}`}>
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
              {title && (
                typeof title === 'string' ? (
                  <h2 className="text-xl font-semibold text-foreground">
                    {title}
                  </h2>
                ) : (
                  title
                )
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-foreground-muted hover:text-foreground transition-colors rounded-full p-1 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          )}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
      );

      // Open modal using AdvancedModalSystem
      modalIdRef.current = openModal(ModalContent, {
        size: mapSize(size),
        closable: false, // Disable AdvancedModalSystem's close button to avoid duplicates
        backdrop: closeOnBackdrop,
        animation: 'scale'
      });
    } else if (!isOpen && modalIdRef.current) {
      // Close the modal
      closeModal(modalIdRef.current);
      modalIdRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (modalIdRef.current) {
        closeModal(modalIdRef.current);
        modalIdRef.current = null;
      }
    };
  }, [isOpen, openModal, closeModal, title, children, size, className, closeOnBackdrop, showCloseButton, onClose]);

  // Return null as the actual rendering is handled by AdvancedModalSystem
  return null;
};

// Fallback component for direct rendering (when ModalProvider is not available)
export const StandaloneModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md",
  className = "",
  closeOnBackdrop = true,
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };
  const resolvedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-modal="true"
            role="dialog"
          />
          
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`bg-card text-card-foreground rounded-app-lg shadow-2xl my-4 mx-auto w-[calc(100%-2rem)] sm:w-full ${resolvedSizeClass} overflow-y-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] ${className}`}
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  duration: 0.3
                }
              }}
              exit={{ 
                scale: 0.7, 
                opacity: 0, 
                y: 20,
                transition: {
                  duration: 0.2
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
                  {title && (
                    typeof title === 'string' ? (
                      <motion.h2 
                        className="text-xl font-semibold text-foreground"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {title}
                      </motion.h2>
                    ) : (
                      title
                    )
                  )}
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="text-foreground-muted hover:text-foreground transition-colors rounded-full p-1 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Close modal"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTimes />
                    </motion.button>
                  )}
                </div>
              )}
              <div className="p-4 md:p-6">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;