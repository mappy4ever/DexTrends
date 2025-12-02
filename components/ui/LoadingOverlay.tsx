/**
 * LoadingOverlay - Full-screen or container loading state
 *
 * Displays a loading spinner with optional message over content.
 * Can be used as a full-screen overlay or within a container.
 *
 * Usage:
 * <LoadingOverlay isLoading={loading} message="Saving changes..." />
 *
 * Or as wrapper:
 * <LoadingOverlay isLoading={loading}>
 *   <YourContent />
 * </LoadingOverlay>
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { PokeballLoader } from './PokeballLoader';

export interface LoadingOverlayProps {
  /** Whether loading is active */
  isLoading: boolean;
  /** Loading message to display */
  message?: string;
  /** Use full-screen fixed overlay (default: false = relative to parent) */
  fullScreen?: boolean;
  /** Show a spinner (default: true) */
  showSpinner?: boolean;
  /** Spinner size */
  spinnerSize?: 'sm' | 'md' | 'lg';
  /** Background opacity (0-100) */
  opacity?: number;
  /** Children to render behind the overlay */
  children?: React.ReactNode;
  /** Additional className for the overlay */
  className?: string;
  /** Use blur effect on background */
  blur?: boolean;
}

const spinnerSizes = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export function LoadingOverlay({
  isLoading,
  message,
  fullScreen = false,
  showSpinner = true,
  spinnerSize = 'md',
  opacity = 80,
  children,
  className,
  blur = false,
}: LoadingOverlayProps) {
  const overlayContent = (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
            'flex flex-col items-center justify-center',
            blur && 'backdrop-blur-sm',
            className
          )}
          style={{
            backgroundColor: `rgba(255, 255, 255, ${opacity / 100})`,
          }}
          aria-busy="true"
          aria-live="polite"
        >
          {/* Dark mode background */}
          <div
            className="absolute inset-0 dark:block hidden"
            style={{
              backgroundColor: `rgba(28, 25, 23, ${opacity / 100})`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {showSpinner && (
              <div className={cn(spinnerSizes[spinnerSize], 'mb-3')}>
                <PokeballLoader size={spinnerSize === 'sm' ? 'small' : spinnerSize === 'md' ? 'medium' : 'large'} />
              </div>
            )}

            {message && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-medium text-stone-600 dark:text-stone-300"
              >
                {message}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // If no children, just return the overlay
  if (!children) {
    return overlayContent;
  }

  // Wrap children with relative container for overlay positioning
  return (
    <div className="relative">
      {children}
      {overlayContent}
    </div>
  );
}

/**
 * Simple inline loading spinner
 */
export function LoadingSpinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={cn(spinnerSizes[size], className)}>
      <PokeballLoader size={size === 'sm' ? 'small' : size === 'md' ? 'medium' : 'large'} />
    </div>
  );
}

/**
 * Skeleton loading placeholder
 */
export function LoadingSkeleton({
  className,
  width,
  height,
  rounded = 'md',
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}) {
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-stone-200 dark:bg-stone-700',
        roundedClasses[rounded],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

export default LoadingOverlay;
