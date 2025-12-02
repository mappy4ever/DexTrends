import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'gray' | 'purple';
}

const spinnerSizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

const spinnerColors = {
  primary: 'border-amber-500 border-r-transparent dark:border-amber-400',
  white: 'border-white border-r-transparent',
  gray: 'border-stone-400 border-r-transparent dark:border-stone-500',
  purple: 'border-amber-600 border-r-transparent dark:border-amber-500',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full',
        'border-solid',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Full page loading spinner
export const PageLoadingSpinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoadingSpinner size="xl" />
      {message && (
        <p className="text-sm text-stone-600 dark:text-stone-300">{message}</p>
      )}
    </div>
  );
};

// Loading overlay
export const LoadingOverlay: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
};