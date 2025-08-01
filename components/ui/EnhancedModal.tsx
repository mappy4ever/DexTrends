// Enhanced Modal with Framer Motion animations
import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useEnhancedAnimation, easings } from './EnhancedAnimationSystem';

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
type ModalVariant = "scale" | "slide" | "flip" | "fade";
type ModalPosition = "center" | "top" | "bottom";

interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  position?: ModalPosition;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
  backdropClassName?: string;
  contentClassName?: string;
}

export default function EnhancedModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md",
  variant = "scale",
  position = "center",
  closeOnBackdrop = true,
  showCloseButton = true,
  className = "",
  backdropClassName = "",
  contentClassName = ""
}: EnhancedModalProps) {
  const { prefersReducedMotion, animationSpeed } = useEnhancedAnimation();

  // Size classes
  const sizeClasses: Record<ModalSize, string> = {
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

  // Position classes
  const positionClasses: Record<ModalPosition, string> = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-20",
    bottom: "items-end justify-center pb-20",
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.2 / animationSpeed,
        ease: "easeOut" as const
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.15 / animationSpeed,
        ease: "easeIn" as const
      }
    }
  };

  const modalVariants = {
    scale: {
      hidden: {
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.8,
        y: prefersReducedMotion ? 0 : 20,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: "spring" as const,
          stiffness: 300,
          damping: 30,
          duration: prefersReducedMotion ? 0.01 : undefined,
        }
      },
      exit: {
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.8,
        y: prefersReducedMotion ? 0 : 20,
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.2 / animationSpeed,
        }
      }
    },
    slide: {
      hidden: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : 100,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          ease: easings.easeOutExpo,
          duration: prefersReducedMotion ? 0.01 : 0.4 / animationSpeed,
        }
      },
      exit: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : 100,
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.3 / animationSpeed,
        }
      }
    },
    flip: {
      hidden: {
        opacity: 0,
        rotateX: prefersReducedMotion ? 0 : 90,
        scale: prefersReducedMotion ? 1 : 0.8,
      },
      visible: {
        opacity: 1,
        rotateX: 0,
        scale: 1,
        transition: {
          ...easings.springBouncy,
          duration: prefersReducedMotion ? 0.01 : 0.5 / animationSpeed,
        }
      },
      exit: {
        opacity: 0,
        rotateX: prefersReducedMotion ? 0 : -90,
        scale: prefersReducedMotion ? 1 : 0.8,
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.3 / animationSpeed,
        }
      }
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.3 / animationSpeed,
        }
      },
      exit: { 
        opacity: 0,
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.2 / animationSpeed,
        }
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm ${backdropClassName}`}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            className={`fixed inset-0 z-50 flex ${positionClasses[position]} p-4 ${className}`}
            onClick={handleBackdropClick}
            aria-modal="true"
            role="dialog"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* Modal Content */}
            <motion.div
              className={`
                bg-white dark:bg-gray-800 
                rounded-lg shadow-2xl 
                w-full ${sizeClasses[size] || sizeClasses.md}
                max-h-[90vh] overflow-hidden
                ${contentClassName}
              `}
              variants={modalVariants[variant] || modalVariants.scale}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{
                transformStyle: variant === 'flip' ? 'preserve-3d' : undefined,
                perspective: variant === 'flip' ? '1000px' : undefined,
              }}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                  {title && (
                    <h2 
                      id="modal-title"
                      className="text-xl font-semibold text-gray-900 dark:text-white pr-4"
                    >
                      {typeof title === 'string' ? title : title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="
                        text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                        transition-colors rounded-full p-2 -mr-2 
                        focus-visible:outline-none focus-visible:ring-2 
                        focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                      "
                      aria-label="Close modal"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTimes size={20} />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Export variants for external use
export const modalVariants = {
  scale: "scale",
  slide: "slide", 
  flip: "flip",
  fade: "fade"
} as const;

export const modalPositions = {
  center: "center",
  top: "top",
  bottom: "bottom"
} as const;