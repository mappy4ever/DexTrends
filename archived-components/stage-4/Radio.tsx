import React, { forwardRef, InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
const hapticManager = typeof window !== 'undefined' ? require('../../utils/hapticFeedback').default : null;

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  labelPosition?: 'left' | 'right';
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      color = 'blue',
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
        outer: 'h-4 w-4',
        inner: 'h-1.5 w-1.5',
        label: 'text-sm',
        description: 'text-xs',
        touchTarget: 'min-h-[36px]'
      },
      md: {
        outer: 'h-5 w-5',
        inner: 'h-2 w-2',
        label: 'text-base',
        description: 'text-sm',
        touchTarget: 'min-h-[44px]'
      },
      lg: {
        outer: 'h-6 w-6',
        inner: 'h-2.5 w-2.5',
        label: 'text-lg',
        description: 'text-base',
        touchTarget: 'min-h-[48px]'
      }
    };

    // Color configurations
    const colorConfig = {
      blue: {
        checked: 'border-blue-600 dark:border-blue-500',
        inner: 'bg-blue-600 dark:bg-blue-500',
        hover: 'hover:border-blue-500 dark:hover:border-blue-400',
        focus: 'focus:ring-blue-500'
      },
      green: {
        checked: 'border-green-600 dark:border-green-500',
        inner: 'bg-green-600 dark:bg-green-500',
        hover: 'hover:border-green-500 dark:hover:border-green-400',
        focus: 'focus:ring-green-500'
      },
      red: {
        checked: 'border-red-600 dark:border-red-500',
        inner: 'bg-red-600 dark:bg-red-500',
        hover: 'hover:border-red-500 dark:hover:border-red-400',
        focus: 'focus:ring-red-500'
      },
      purple: {
        checked: 'border-purple-600 dark:border-purple-500',
        inner: 'bg-purple-600 dark:bg-purple-500',
        hover: 'hover:border-purple-500 dark:hover:border-purple-400',
        focus: 'focus:ring-purple-500'
      },
      yellow: {
        checked: 'border-yellow-500 dark:border-yellow-400',
        inner: 'bg-yellow-500 dark:bg-yellow-400',
        hover: 'hover:border-yellow-400 dark:hover:border-yellow-300',
        focus: 'focus:ring-yellow-500'
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (hapticManager) {
        hapticManager.selection('light');
      }
      onChange?.(e);
    };

    const radioElement = (
      <>
        <input
          ref={ref}
          type="radio"
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
            'relative rounded-full border-2 transition-all duration-200',
            sizeConfig[size].outer,
            'border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            !disabled && colorConfig[color].hover,
            checked && colorConfig[color].checked,
            disabled && 'opacity-50 cursor-not-allowed',
            'flex items-center justify-center'
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(
                  'rounded-full',
                  sizeConfig[size].inner,
                  colorConfig[color].inner
                )}
              />
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
            'block font-medium text-gray-900 dark:text-white',
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
              'mt-0.5 text-gray-600 dark:text-gray-400',
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
          {radioElement}
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

Radio.displayName = 'Radio';

/**
 * RadioGroup - Container for radio button options
 */
export interface RadioGroupProps {
  children: React.ReactNode;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  disabled?: boolean;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  name,
  value,
  onChange,
  label,
  description,
  error,
  orientation = 'vertical',
  size = 'md',
  color = 'blue',
  disabled = false,
  className
}) => {
  return (
    <div
      className={cn('space-y-2', className)}
      role="radiogroup"
      aria-labelledby={label ? 'group-label' : undefined}
      aria-invalid={!!error}
    >
      {label && (
        <div id="group-label" className="mb-2">
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            {label}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
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
        {React.Children.map(children, (child) => {
          if (React.isValidElement<RadioProps>(child) && child.type === Radio) {
            return React.cloneElement(child, {
              name,
              checked: child.props.value === value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange?.(e.target.value);
                child.props.onChange?.(e);
              },
              size,
              color,
              disabled: disabled || child.props.disabled
            });
          }
          return child;
        })}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * RadioOption - Simplified radio option for use with RadioGroup
 */
export interface RadioOptionProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
  value,
  label,
  description,
  disabled,
  className
}) => {
  return (
    <Radio
      value={value}
      label={label}
      description={description}
      disabled={disabled}
      className={className}
    />
  );
};

export default Radio;