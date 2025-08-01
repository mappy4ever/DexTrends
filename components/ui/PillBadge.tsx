import React from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export interface PillBadgeProps {
  label: string;
  value?: string | number;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  count?: number;
  className?: string;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  label,
  value,
  variant = 'filled',
  size = 'md',
  color,
  selected = false,
  disabled = false,
  interactive = false,
  onClick,
  onRemove,
  icon,
  count,
  className
}) => {
  const isClickable = interactive && !disabled && onClick;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-1 text-sm gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const variantClasses = {
    filled: cn(
      'text-white border-transparent',
      selected ? 'ring-2 ring-offset-2' : '',
      !color && 'bg-gray-600 dark:bg-gray-700'
    ),
    outlined: cn(
      'bg-transparent border-2',
      selected ? 'ring-2 ring-offset-1' : '',
      !color && 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
    ),
    ghost: cn(
      'bg-transparent border-transparent',
      selected ? 'bg-opacity-20' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
      !color && 'text-gray-700 dark:text-gray-300'
    )
  };

  const pillContent = (
    <>
      {icon && (
        <span className="inline-flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
      
      <span className="font-medium">{label}</span>
      
      {value !== undefined && (
        <span className="opacity-75 text-[0.9em]">{value}</span>
      )}
      
      {count !== undefined && count > 0 && (
        <span className={cn(
          "inline-flex items-center justify-center rounded-full min-w-[1.25rem] h-5 px-1",
          "bg-white/20 text-[0.8em] font-semibold",
          variant === 'outlined' && "bg-gray-100 dark:bg-gray-800"
        )}>
          {count > 99 ? '99+' : count}
        </span>
      )}
      
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "inline-flex items-center justify-center -mr-1 ml-1",
            "w-4 h-4 rounded-full transition-all",
            "hover:bg-white/20 dark:hover:bg-black/20",
            variant === 'outlined' && "hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
          disabled={disabled}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2.5 2.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </>
  );

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-full transition-all duration-200',
    sizeClasses[size],
    variantClasses[variant],
    isClickable && 'cursor-pointer hover:scale-105 active:scale-95',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const customStyles = color ? {
    ...(variant === 'filled' && {
      backgroundColor: color,
      color: 'white'
    }),
    ...(variant === 'outlined' && {
      borderColor: color,
      color: color
    }),
    ...(variant === 'ghost' && {
      color: color,
      ...(selected && { backgroundColor: `${color}20` })
    }),
    ...(selected && color && {
      '--tw-ring-color': color
    } as any)
  } : {};

  if (isClickable) {
    return (
      <motion.button
        className={baseClasses}
        style={customStyles}
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={false}
        animate={selected ? { scale: [1, 1.1, 1] } : {}}
      >
        {pillContent}
      </motion.button>
    );
  }

  return (
    <span className={baseClasses} style={customStyles}>
      {pillContent}
    </span>
  );
};

export default PillBadge;