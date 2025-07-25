import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface CircularCardProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  image?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-36 h-36 sm:w-40 sm:h-40',
  xl: 'w-40 h-40 sm:w-48 sm:h-48'
};

export const CircularCard: React.FC<CircularCardProps> = ({
  size = 'md',
  image,
  alt,
  title,
  subtitle,
  badge,
  gradientFrom = 'blue-400',
  gradientTo = 'purple-400',
  onClick,
  className = '',
  children,
  hover = true,
  glow = false
}) => {
  const containerVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -4 }
  };

  return (
    <motion.div
      className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
      variants={hover ? containerVariants : undefined}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={onClick}
    >
      {/* Main circular container */}
      <div className={`relative ${sizeClasses[size]} group`}>
        {/* Outer gradient ring */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-${gradientFrom} to-${gradientTo} p-[3px] shadow-lg ${glow ? 'animate-pulse' : ''}`}>
          {/* White spacing ring */}
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[3px]">
            {/* Inner content circle */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 shadow-inner overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>
              
              {/* Image or custom content */}
              {image ? (
                <Image
                  src={image}
                  alt={alt || ''}
                  layout="fill"
                  objectFit="contain"
                  className="p-2"
                />
              ) : (
                children
              )}
            </div>
          </div>
        </div>
        
        {/* Floating badge */}
        {badge && (
          <motion.div
            className="absolute -top-2 -right-2 z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {badge}
          </motion.div>
        )}
      </div>
      
      {/* Title and subtitle */}
      {(title || subtitle) && (
        <div className="text-center mt-3">
          {title && (
            <h3 className="font-bold text-sm sm:text-base capitalize text-gray-800 dark:text-gray-200">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CircularCard;