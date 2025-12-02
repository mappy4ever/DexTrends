import React from 'react';
import { cn } from '@/utils/cn';

interface SectionDividerProps {
  /** Visual style of the divider */
  variant?: 'line' | 'fade' | 'space' | 'dashed';
  /** Spacing around the divider */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional classes */
  className?: string;
}

const spacingClasses = {
  sm: 'my-4',
  md: 'my-6 md:my-8',
  lg: 'my-8 md:my-12',
  xl: 'my-12 md:my-16',
};

/**
 * SectionDivider - Visual separator between content sections
 *
 * Variants:
 * - line: Subtle horizontal line
 * - fade: Gradient fade effect
 * - space: Pure whitespace
 * - dashed: Dashed line
 *
 * Used to create visual hierarchy and separate content areas on pages.
 */
export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'line',
  spacing = 'md',
  className,
}) => {
  switch (variant) {
    case 'line':
      return (
        <div className={cn(spacingClasses[spacing], 'flex items-center', className)}>
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
        </div>
      );

    case 'fade':
      return (
        <div className={cn(spacingClasses[spacing], 'relative h-8', className)}>
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-stone-100/60 to-transparent dark:from-stone-800/60" />
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-stone-50/60 to-transparent dark:from-stone-900/60" />
        </div>
      );

    case 'dashed':
      return (
        <div className={cn(spacingClasses[spacing], 'flex items-center', className)}>
          <div className="flex-1 border-t border-dashed border-stone-300 dark:border-stone-600" />
        </div>
      );

    case 'space':
    default:
      return <div className={cn(spacingClasses[spacing], className)} />;
  }
};

export default SectionDivider;
