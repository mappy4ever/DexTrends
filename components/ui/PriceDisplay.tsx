import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface PriceDisplayProps {
  price: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'premium' | 'sale' | 'minimal';
  animated?: boolean;
  showCurrency?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  size = 'md',
  variant = 'default',
  animated = true,
  showCurrency = true,
  className
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-1.5 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      gradient: 'from-purple-100/90 to-pink-100/90 dark:from-purple-900/40 dark:to-pink-900/40',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-white/50 dark:border-purple-400/30',
      shadow: 'shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10',
      hoverShadow: 'hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/20'
    },
    premium: {
      gradient: 'from-yellow-200/90 via-amber-200/90 to-yellow-300/90 dark:from-yellow-900/40 dark:to-amber-900/40',
      textColor: 'text-yellow-800 dark:text-yellow-300',
      borderColor: 'border-yellow-300/50 dark:border-yellow-600/30',
      shadow: 'shadow-lg shadow-yellow-500/30 dark:shadow-yellow-500/15',
      hoverShadow: 'hover:shadow-xl hover:shadow-yellow-500/40 dark:hover:shadow-yellow-500/25'
    },
    sale: {
      gradient: 'from-green-100/90 to-emerald-100/90 dark:from-green-900/40 dark:to-emerald-900/40',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-300/50 dark:border-green-600/30',
      shadow: 'shadow-lg shadow-green-500/20 dark:shadow-green-500/10',
      hoverShadow: 'hover:shadow-xl hover:shadow-green-500/30 dark:hover:shadow-green-500/20'
    },
    minimal: {
      gradient: 'from-gray-100/80 to-gray-200/80 dark:from-gray-800/40 dark:to-gray-700/40',
      textColor: 'text-gray-700 dark:text-gray-300',
      borderColor: 'border-gray-300/50 dark:border-gray-600/30',
      shadow: 'shadow-sm',
      hoverShadow: 'hover:shadow-md'
    }
  };

  const config = variantConfig[variant];
  const sizes = sizeConfig[size];

  // Format price with appropriate decimal places
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(2);
  };

  // Determine if this is a high-value card
  const isHighValue = price >= 100;
  const isPremium = price >= 50;

  const priceElement = (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full',
        'bg-gradient-to-r backdrop-blur-md',
        'border transition-all duration-200',
        'font-bold',
        sizes.container,
        config.gradient,
        config.textColor,
        config.borderColor,
        config.shadow,
        config.hoverShadow,
        className
      )}
    >
      {/* Currency Symbol */}
      {showCurrency && (
        <span className={cn('font-medium opacity-90', sizes.text)}>$</span>
      )}
      
      {/* Price Value */}
      <span className={cn('font-bold', sizes.text)}>
        {formatPrice(price)}
      </span>

      {/* Premium Indicator for High Value Cards */}
      {isHighValue && animated && (
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <svg className={cn('text-yellow-500', sizes.icon)} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </motion.div>
      )}

      {/* Sparkle Effect for Premium Cards */}
      {isPremium && animated && (
        <>
          <motion.span
            className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
          <motion.span
            className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-white rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 1
            }}
          />
        </>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="inline-block"
      >
        {priceElement}
      </motion.div>
    );
  }

  return priceElement;
};

export default PriceDisplay;