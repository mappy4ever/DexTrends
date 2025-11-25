import React from 'react';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Gradient color scheme for title */
  gradient?: 'red' | 'blue' | 'purple' | 'green' | 'yellow' | 'orange' | 'none';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional left-side content (icon, breadcrumb, etc) */
  leading?: React.ReactNode;
  /** Optional right-side content (actions, filters, etc) */
  trailing?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Additional title className */
  titleClassName?: string;
  /** Center align content */
  centered?: boolean;
}

/**
 * PageHeader - Consistent page headers with fluid typography
 *
 * Uses design tokens for responsive text scaling and spacing.
 * Supports gradient titles for visual impact.
 *
 * @example
 * <PageHeader
 *   title="Pokédex"
 *   subtitle="Explore 1,025 Pokémon"
 *   gradient="red"
 * />
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  gradient = 'none',
  size = 'md',
  leading,
  trailing,
  className,
  titleClassName,
  centered = false,
}) => {
  // Gradient styles for title text
  const gradientStyles = {
    none: '',
    red: 'bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent',
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent',
    purple: 'bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent',
    green: 'bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent',
    yellow: 'bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent',
    orange: 'bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent',
  };

  // Size-based fluid typography styles
  const titleSizeStyles = {
    sm: 'text-[var(--text-xl)]',     // clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)
    md: 'text-[var(--text-2xl)]',    // clamp(1.5rem, 1.25rem + 1vw, 2rem)
    lg: 'text-[var(--text-3xl)]',    // clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)
  };

  const subtitleSizeStyles = {
    sm: 'text-[var(--text-sm)]',
    md: 'text-[var(--text-base)]',
    lg: 'text-[var(--text-lg)]',
  };

  const spacingStyles = {
    sm: 'mb-3 sm:mb-4',
    md: 'mb-4 sm:mb-6',
    lg: 'mb-6 sm:mb-8',
  };

  return (
    <header
      className={cn(
        spacingStyles[size],
        centered ? 'text-center' : 'flex items-start justify-between',
        className
      )}
    >
      <div className={cn(centered && 'w-full')}>
        {/* Leading content + Title row */}
        <div className={cn(
          'flex items-center',
          centered ? 'justify-center' : 'gap-3'
        )}>
          {leading && (
            <div className="flex-shrink-0">
              {leading}
            </div>
          )}
          <h1
            className={cn(
              titleSizeStyles[size],
              'font-bold tracking-tight',
              gradient !== 'none'
                ? gradientStyles[gradient]
                : 'text-gray-900 dark:text-white',
              titleClassName
            )}
          >
            {title}
          </h1>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p
            className={cn(
              subtitleSizeStyles[size],
              'text-gray-600 dark:text-gray-400 mt-1',
              centered && 'mx-auto max-w-2xl'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Trailing content (only when not centered) */}
      {!centered && trailing && (
        <div className="flex-shrink-0 flex items-center gap-2">
          {trailing}
        </div>
      )}

      {/* Trailing content when centered (below title) */}
      {centered && trailing && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {trailing}
        </div>
      )}
    </header>
  );
};

/**
 * PageSection - Section header within a page (smaller than PageHeader)
 */
export interface PageSectionProps {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  className?: string;
  withDivider?: boolean;
}

export const PageSection: React.FC<PageSectionProps> = ({
  title,
  subtitle,
  trailing,
  className,
  withDivider = false,
}) => {
  return (
    <div
      className={cn(
        'mb-4',
        withDivider && 'pb-3 border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[var(--text-lg)] font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[var(--text-sm)] text-gray-600 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {trailing && (
          <div className="flex-shrink-0">
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
