import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action element (button, link, etc.) */
  action?: ReactNode;
  /** Whether to stick to top on scroll */
  sticky?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional classes */
  className?: string;
}

const sizeClasses = {
  sm: {
    title: 'text-base md:text-lg font-semibold',
    subtitle: 'text-xs md:text-sm',
    padding: 'py-3',
  },
  md: {
    title: 'text-lg md:text-xl font-bold',
    subtitle: 'text-sm',
    padding: 'py-4',
  },
  lg: {
    title: 'text-xl md:text-2xl font-bold',
    subtitle: 'text-sm md:text-base',
    padding: 'py-5',
  },
};

/**
 * SectionHeader - Title component for content sections
 *
 * Features:
 * - Title with optional subtitle
 * - Optional right-aligned action (button, link, badge)
 * - Optional sticky positioning
 * - Multiple size variants
 *
 * Use above grids, lists, or content areas to label sections.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  sticky = false,
  size = 'md',
  className,
}) => {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4',
        sizes.padding,
        'bg-[#FFFDF7] dark:bg-stone-900',
        sticky && 'sticky top-[48px] md:top-[64px] z-10',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h2 className={cn(sizes.title, 'text-stone-800 dark:text-white')}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(sizes.subtitle, 'text-stone-500 dark:text-stone-300 mt-0.5')}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default SectionHeader;
