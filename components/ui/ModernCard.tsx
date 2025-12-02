/**
 * ModernCard - A sleek, modern card component with hover effects and animations
 * Use this for consistent card styling across the app
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'outlined' | 'elevated';
  hover?: 'lift' | 'glow' | 'scale' | 'border' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  onClick?: () => void;
  as?: 'div' | 'article' | 'section' | 'button';
  gradient?: string; // Custom gradient
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = 'lift',
  padding = 'md',
  rounded = 'xl',
  onClick,
  as = 'div',
  gradient
}) => {
  const baseStyles = 'relative overflow-hidden transition-all duration-300';

  const variantStyles = {
    default: 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
    glass: 'bg-white/80 dark:bg-stone-800/80 backdrop-blur-xl border border-white/20 dark:border-stone-700/30',
    gradient: gradient || 'bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900',
    outlined: 'bg-transparent border-2 border-stone-300 dark:border-stone-600',
    elevated: 'bg-white dark:bg-stone-800 shadow-lg dark:shadow-stone-900/30',
  };

  const hoverStyles = {
    lift: 'hover:-translate-y-1 hover:shadow-xl',
    glow: 'hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20',
    scale: 'hover:scale-[1.02]',
    border: 'hover:border-blue-500 dark:hover:border-blue-400',
    none: '',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 md:p-5',
    lg: 'p-5 md:p-6',
    xl: 'p-6 md:p-8',
  };

  const roundedStyles = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
    full: 'rounded-full',
  };

  const Component = motion[as] as any;

  return (
    <Component
      onClick={onClick}
      className={cn(
        baseStyles,
        variantStyles[variant],
        hoverStyles[hover],
        paddingStyles[padding],
        roundedStyles[rounded],
        onClick && 'cursor-pointer',
        className
      )}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  );
};

// Stat card for displaying single stat values
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  size = 'md'
}) => {
  const colorStyles = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    gray: 'from-stone-500 to-stone-600',
  };

  const sizeStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <ModernCard variant="glass" padding="none" className={sizeStyles[size]}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-300 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className={`${valueSizes[size]} font-bold text-stone-900 dark:text-white`}>
              {value}
            </span>
            {trend && (
              <span className={cn(
                'text-sm font-medium',
                trend === 'up' && 'text-green-500',
                trend === 'down' && 'text-red-500',
                trend === 'neutral' && 'text-stone-500'
              )}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'neutral' && '→'}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={`p-2 rounded-xl bg-gradient-to-br ${colorStyles[color]} text-white`}>
            {icon}
          </div>
        )}
      </div>
    </ModernCard>
  );
};

// Feature card for showcasing features/pages
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
  onClick?: () => void;
  badge?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  gradient = 'from-blue-500 to-purple-600',
  onClick,
  badge
}) => {
  return (
    <ModernCard
      variant="glass"
      hover="lift"
      onClick={onClick}
      className="group"
    >
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
          {badge}
        </span>
      )}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-stone-600 dark:text-stone-300">{description}</p>
    </ModernCard>
  );
};

// Empty state card
interface EmptyStateCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  icon,
  action
}) => {
  return (
    <ModernCard variant="glass" padding="xl" className="text-center">
      {icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">{title}</h3>
      <p className="text-stone-600 dark:text-stone-300 mb-4">{description}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          {action.label}
        </motion.button>
      )}
    </ModernCard>
  );
};

// Gradient border card
interface GradientBorderCardProps {
  children: React.ReactNode;
  gradient?: string;
  borderWidth?: number;
  className?: string;
}

export const GradientBorderCard: React.FC<GradientBorderCardProps> = ({
  children,
  gradient = 'from-blue-500 via-purple-500 to-pink-500',
  borderWidth = 2,
  className
}) => {
  return (
    <div className={cn(`p-[${borderWidth}px] rounded-2xl bg-gradient-to-r ${gradient}`, className)}>
      <div className="bg-white dark:bg-stone-800 rounded-[14px] h-full">
        {children}
      </div>
    </div>
  );
};

export default ModernCard;
