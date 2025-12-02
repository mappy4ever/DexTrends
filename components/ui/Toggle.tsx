import React, { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { TRANSITION, SPRING_PHYSICS } from './design-system/glass-constants';
const hapticManager = typeof window !== 'undefined' ? require('../../utils/hapticFeedback').default : null;

// ===========================================
// TYPES
// ===========================================

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Label text */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color when active */
  color?: 'amber' | 'green' | 'blue' | 'red' | 'purple';
  /** Position of label relative to toggle */
  labelPosition?: 'left' | 'right';
  /** Show icons inside toggle (check/x) */
  showIcons?: boolean;
  /** Custom on icon */
  onIcon?: React.ReactNode;
  /** Custom off icon */
  offIcon?: React.ReactNode;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeConfig = {
  sm: {
    track: 'w-9 h-5',
    thumb: 'w-4 h-4',
    thumbTranslate: 'translate-x-4',
    label: 'text-sm',
    description: 'text-xs',
    touchTarget: 'min-h-[36px]',
    iconSize: 'w-2.5 h-2.5',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    thumbTranslate: 'translate-x-5',
    label: 'text-base',
    description: 'text-sm',
    touchTarget: 'min-h-[44px]',
    iconSize: 'w-3 h-3',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    thumbTranslate: 'translate-x-7',
    label: 'text-lg',
    description: 'text-base',
    touchTarget: 'min-h-[48px]',
    iconSize: 'w-3.5 h-3.5',
  },
};

// ===========================================
// COLOR CONFIGURATIONS
// ===========================================

const colorConfig = {
  amber: {
    track: 'bg-amber-600 dark:bg-amber-500',
    thumb: 'bg-white',
    focus: 'focus-visible:ring-amber-500/50',
  },
  green: {
    track: 'bg-green-600 dark:bg-green-500',
    thumb: 'bg-white',
    focus: 'focus-visible:ring-green-500/50',
  },
  blue: {
    track: 'bg-blue-600 dark:bg-blue-500',
    thumb: 'bg-white',
    focus: 'focus-visible:ring-blue-500/50',
  },
  red: {
    track: 'bg-red-600 dark:bg-red-500',
    thumb: 'bg-white',
    focus: 'focus-visible:ring-red-500/50',
  },
  purple: {
    track: 'bg-purple-600 dark:bg-purple-500',
    thumb: 'bg-white',
    focus: 'focus-visible:ring-purple-500/50',
  },
};

// ===========================================
// COMPONENT
// ===========================================

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      color = 'amber',
      labelPosition = 'right',
      showIcons = false,
      onIcon,
      offIcon,
      checked,
      disabled,
      className,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const sizes = sizeConfig[size];
    const colors = colorConfig[color];
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Haptic feedback
      if (hapticManager) {
        hapticManager.trigger('light');
      }
      onChange?.(e);
    };

    // Default icons
    const defaultOnIcon = (
      <svg className={cn(sizes.iconSize, 'text-green-500')} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );

    const defaultOffIcon = (
      <svg className={cn(sizes.iconSize, 'text-stone-400')} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );

    const toggleElement = (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${toggleId}-label` : undefined}
        aria-describedby={description ? `${toggleId}-description` : undefined}
        disabled={disabled}
        onClick={() => {
          const input = document.getElementById(toggleId) as HTMLInputElement;
          if (input) {
            input.click();
          }
        }}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer items-center rounded-full',
          sizes.track,
          TRANSITION.fast,
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          colors.focus,
          checked ? colors.track : 'bg-stone-300 dark:bg-stone-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Hidden input for form submission */}
        <input
          ref={ref}
          type="checkbox"
          id={toggleId}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />

        {/* Track icons (when showIcons is true) */}
        {showIcons && (
          <>
            <span
              className={cn(
                'absolute left-1 flex items-center justify-center transition-opacity',
                checked ? 'opacity-100' : 'opacity-0'
              )}
            >
              {onIcon || defaultOnIcon}
            </span>
            <span
              className={cn(
                'absolute right-1 flex items-center justify-center transition-opacity',
                checked ? 'opacity-0' : 'opacity-100'
              )}
            >
              {offIcon || defaultOffIcon}
            </span>
          </>
        )}

        {/* Thumb */}
        <motion.span
          layout
          transition={SPRING_PHYSICS.snappy}
          className={cn(
            'pointer-events-none inline-block rounded-full shadow-md ring-0',
            sizes.thumb,
            colors.thumb,
            'transform',
            checked ? sizes.thumbTranslate : 'translate-x-0.5'
          )}
        />
      </button>
    );

    // If no label, just return the toggle
    if (!label && !description) {
      return toggleElement;
    }

    // With label and/or description
    return (
      <div className={cn('flex items-start gap-3', sizes.touchTarget, className)}>
        {labelPosition === 'left' && (
          <div className="flex-1 min-w-0">
            {label && (
              <label
                id={`${toggleId}-label`}
                htmlFor={toggleId}
                className={cn(
                  sizes.label,
                  'font-medium text-stone-900 dark:text-white',
                  disabled && 'opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={`${toggleId}-description`}
                className={cn(sizes.description, 'text-stone-500 dark:text-stone-300 mt-0.5')}
              >
                {description}
              </p>
            )}
            {error && (
              <p className={cn(sizes.description, 'text-red-500 dark:text-red-400 mt-1')}>
                {error}
              </p>
            )}
          </div>
        )}

        {toggleElement}

        {labelPosition === 'right' && (
          <div className="flex-1 min-w-0">
            {label && (
              <label
                id={`${toggleId}-label`}
                htmlFor={toggleId}
                className={cn(
                  sizes.label,
                  'font-medium text-stone-900 dark:text-white cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={`${toggleId}-description`}
                className={cn(sizes.description, 'text-stone-500 dark:text-stone-300 mt-0.5')}
              >
                {description}
              </p>
            )}
            {error && (
              <p className={cn(sizes.description, 'text-red-500 dark:text-red-400 mt-1')}>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

// ===========================================
// TOGGLE GROUP
// ===========================================

export interface ToggleGroupProps {
  /** Label for the group */
  label?: string;
  /** Children toggle items */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
}

export function ToggleGroup({
  label,
  children,
  className,
  direction = 'vertical',
}: ToggleGroupProps) {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-stone-900 dark:text-white mb-3">
          {label}
        </legend>
      )}
      <div
        className={cn(
          direction === 'vertical' ? 'flex flex-col gap-3' : 'flex flex-wrap gap-4'
        )}
      >
        {children}
      </div>
    </fieldset>
  );
}

// ===========================================
// EXPORTS
// ===========================================

export { Toggle };
export default Toggle;
