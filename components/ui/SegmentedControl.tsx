/**
 * SegmentedControl - Tab-like toggle control
 *
 * An accessible segmented control for switching between views or options.
 * Similar to iOS segmented control or tab bar.
 *
 * Usage:
 * <SegmentedControl
 *   value={view}
 *   onChange={setView}
 *   options={[
 *     { value: 'grid', label: 'Grid', icon: <HiViewGrid /> },
 *     { value: 'list', label: 'List', icon: <HiViewList /> },
 *   ]}
 * />
 */

import React, { useId, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface SegmentedOption<T extends string = string> {
  /** Option value */
  value: T;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  /** Currently selected value */
  value: T;
  /** Called when selection changes */
  onChange: (value: T) => void;
  /** Available options */
  options: SegmentedOption<T>[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
  /** Show labels (default: true) */
  showLabels?: boolean;
  /** Name for form accessibility */
  name?: string;
}

export function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  showLabels = true,
  name,
}: SegmentedControlProps<T>) {
  const id = useId();
  const controlName = name || `segmented-control-${id}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when value changes
  useEffect(() => {
    if (!containerRef.current) return;

    const selectedIndex = options.findIndex((opt) => opt.value === value);
    if (selectedIndex === -1) return;

    const buttons = containerRef.current.querySelectorAll('button');
    const selectedButton = buttons[selectedIndex] as HTMLButtonElement;

    if (selectedButton) {
      setIndicatorStyle({
        left: selectedButton.offsetLeft,
        width: selectedButton.offsetWidth,
      });
    }
  }, [value, options]);

  // Size styles
  const sizeStyles = {
    sm: {
      container: 'p-1 rounded-lg',
      button: 'px-3 py-1.5 text-sm rounded-md',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    md: {
      container: 'p-1 rounded-xl',
      button: 'px-4 py-2 text-base rounded-lg',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
    lg: {
      container: 'p-1.5 rounded-xl',
      button: 'px-5 py-2.5 text-lg rounded-lg',
      icon: 'w-6 h-6',
      gap: 'gap-2',
    },
  };

  const styles = sizeStyles[size];

  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = options.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= options.length) newIndex = 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = options.length - 1;
        break;
      default:
        return;
    }

    // Skip disabled options
    while (options[newIndex]?.disabled && newIndex !== currentIndex) {
      if (event.key === 'ArrowLeft' || event.key === 'Home') {
        newIndex = newIndex - 1;
        if (newIndex < 0) newIndex = options.length - 1;
      } else {
        newIndex = newIndex + 1;
        if (newIndex >= options.length) newIndex = 0;
      }
    }

    if (!options[newIndex]?.disabled) {
      onChange(options[newIndex].value);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-flex',
        'bg-stone-100 dark:bg-stone-800',
        styles.container,
        fullWidth && 'w-full',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      role="radiogroup"
      aria-label={controlName}
    >
      {/* Selection indicator */}
      <motion.div
        className={cn(
          'absolute bg-white dark:bg-stone-700',
          'shadow-sm border border-stone-200 dark:border-stone-600',
          styles.button.split(' ').find((c) => c.startsWith('rounded'))
        )}
        style={{
          height: `calc(100% - ${size === 'lg' ? '12px' : '8px'})`,
          top: size === 'lg' ? '6px' : '4px',
        }}
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
      />

      {/* Options */}
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isDisabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => !isDisabled && onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={isDisabled}
            className={cn(
              'relative z-10 flex items-center justify-center',
              'font-medium transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-1',
              styles.button,
              styles.gap,
              fullWidth && 'flex-1',
              isSelected
                ? 'text-stone-900 dark:text-white'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300',
              isDisabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {option.icon && (
              <span className={cn(styles.icon, 'flex-shrink-0')}>
                {option.icon}
              </span>
            )}
            {showLabels && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * IconSegmentedControl - Icon-only variant
 */
export function IconSegmentedControl<T extends string = string>(
  props: Omit<SegmentedControlProps<T>, 'showLabels'>
) {
  return <SegmentedControl {...props} showLabels={false} />;
}

export default SegmentedControl;
