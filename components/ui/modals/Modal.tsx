// components/ui/Modal.js
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  // Define size classes based on props
  // These should align with Tailwind's max-width scale or your custom extensions
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl", // Example: Added more sizes
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };
  const resolvedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
          />
          
          {/* Modal Content */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`bg-card text-card-foreground rounded-app-lg shadow-2xl my-4 mx-auto w-[calc(100%-2rem)] sm:w-full ${resolvedSizeClass} overflow-y-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh]`}
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: {
                  type: "spring" as const,
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
              onClick={(e: any) => e.stopPropagation()}
              style={{
                maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 2rem)'
              }}
            >
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
                    title // Allow JSX title
                  )
                )}
                <motion.button
                  onClick={onClose}
                  className="text-foreground-muted hover:text-foreground transition-colors rounded-full p-1 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close modal"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>
              <motion.div 
                className="p-4 md:p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}