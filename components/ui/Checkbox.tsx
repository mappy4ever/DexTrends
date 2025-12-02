import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import { IoCheckmark, IoRemove } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
const hapticManager = typeof window !== 'undefined' ? require('../../utils/hapticFeedback').default : null;

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  indeterminate?: boolean;
  showIcon?: boolean;
  labelPosition?: 'left' | 'right';
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      variant = 'default',
      color = 'blue',
      indeterminate = false,
      showIcon = true,
      labelPosition = 'right',
      checked,
      disabled,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    // Size configurations
    const sizeConfig = {
      sm: {
        box: 'h-4 w-4',
        icon: 'h-3 w-3',
        label: 'text-sm',
        description: 'text-xs',
        touchTarget: 'min-h-[36px]'
      },
      md: {
        box: 'h-5 w-5',
        icon: 'h-3.5 w-3.5',
        label: 'text-base',
        description: 'text-sm',
        touchTarget: 'min-h-[44px]'
      },
      lg: {
        box: 'h-6 w-6',
        icon: 'h-4 w-4',
        label: 'text-lg',
        description: 'text-base',
        touchTarget: 'min-h-[48px]'
      }
    };

    // Color configurations
    const colorConfig = {
      blue: {
        checked: 'bg-amber-600 border-amber-600 dark:bg-amber-500 dark:border-amber-500',
        hover: 'hover:border-amber-500 dark:hover:border-amber-400',
        focus: 'focus:ring-amber-500'
      },
      green: {
        checked: 'bg-green-600 border-green-600 dark:bg-green-500 dark:border-green-500',
        hover: 'hover:border-green-500 dark:hover:border-green-400',
        focus: 'focus:ring-green-500'
      },
      red: {
        checked: 'bg-red-600 border-red-600 dark:bg-red-500 dark:border-red-500',
        hover: 'hover:border-red-500 dark:hover:border-red-400',
        focus: 'focus:ring-red-500'
      },
      purple: {
        checked: 'bg-amber-600 border-amber-600 dark:bg-amber-500 dark:border-amber-500',
        hover: 'hover:border-amber-500 dark:hover:border-amber-400',
        focus: 'focus:ring-amber-500'
      },
      yellow: {
        checked: 'bg-yellow-500 border-yellow-500 dark:bg-yellow-400 dark:border-yellow-400',
        hover: 'hover:border-yellow-400 dark:hover:border-yellow-300',
        focus: 'focus:ring-yellow-500'
      }
    };

    // Variant styles
    const variantStyles = {
      default: 'border-2',
      filled: 'border-2',
      outline: 'border-2 bg-transparent'
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (hapticManager) {
        hapticManager.button('tap');
      }
      onChange?.(e);
    };

    const checkboxElement = (
      <>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          aria-describedby={description ? `${props.id}-description` : undefined}
          aria-invalid={!!error}
          {...props}
        />
        <div
          className={cn(
            'relative rounded transition-all duration-200',
            sizeConfig[size].box,
            variantStyles[variant],
            'border-stone-300 dark:border-stone-600',
            !disabled && colorConfig[color].hover,
            checked && colorConfig[color].checked,
            disabled && 'opacity-50 cursor-not-allowed',
            'flex items-center justify-center'
          )}
        >
          <AnimatePresence mode="wait">
            {(checked || indeterminate) && showIcon && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="text-white"
              >
                {indeterminate ? (
                  <IoRemove className={sizeConfig[size].icon} />
                ) : (
                  <IoCheckmark className={sizeConfig[size].icon} strokeWidth={3} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );

    const labelElement = label && (
      <div className="flex-1">
        <label
          htmlFor={props.id}
          className={cn(
            'block font-medium text-stone-900 dark:text-white',
            sizeConfig[size].label,
            disabled && 'opacity-50'
          )}
        >
          {label}
        </label>
        {description && (
          <p
            id={`${props.id}-description`}
            className={cn(
              'mt-0.5 text-stone-600 dark:text-stone-300',
              sizeConfig[size].description
            )}
          >
            {description}
          </p>
        )}
      </div>
    );

    return (
      <div className={cn('relative', className)}>
        <label
          className={cn(
            'flex items-start gap-3 cursor-pointer',
            sizeConfig[size].touchTarget,
            'py-2',
            disabled && 'cursor-not-allowed',
            labelPosition === 'left' && 'flex-row-reverse'
          )}
        >
          {checkboxElement}
          {labelElement}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400 ml-7">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * CheckboxGroup - Container for multiple checkboxes
 */
export const CheckboxGroup: React.FC<{
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  id?: string;
}> = ({
  children,
  label,
  description,
  error,
  orientation = 'vertical',
  className,
  id
}) => {
  const generatedId = useId();
  const groupId = id || generatedId;
  const labelId = `${groupId}-label`;
  const descriptionId = `${groupId}-description`;
  const errorId = `${groupId}-error`;

  return (
    <div
      className={cn('space-y-2', className)}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {label && (
        <div className="mb-2">
          <h3
            id={labelId}
            className="text-base font-medium text-stone-900 dark:text-white"
          >
            {label}
          </h3>
          {description && (
            <p
              id={descriptionId}
              className="mt-0.5 text-sm text-stone-600 dark:text-stone-300"
            >
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn(
        orientation === 'horizontal'
          ? 'flex flex-wrap gap-4'
          : 'space-y-2'
      )}>
        {children}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Checkbox;