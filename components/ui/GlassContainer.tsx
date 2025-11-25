import React from 'react';
import { motion } from 'framer-motion';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'dark' | 'colored';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

const variantClasses = {
  light: 'bg-white/70 dark:bg-gray-800/70 border-white/30 dark:border-gray-700/30',
  medium: 'bg-white/80 dark:bg-gray-800/80 border-white/40 dark:border-gray-700/40',
  dark: 'bg-white/90 dark:bg-gray-800/90 border-white/50 dark:border-gray-700/50',
  colored: 'bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80 border-white/40'
};

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl'
};

const roundedClasses = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full'
};

const paddingClasses = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-10'
};

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className = '',
  variant = 'medium',
  blur = 'md',
  rounded = '2xl',
  padding = 'md',
  hover = false,
  gradient = false,
  onClick,
  animate = true
}) => {
  const baseClasses = `
    relative overflow-hidden border
    ${variantClasses[variant]}
    ${blurClasses[blur]}
    ${roundedClasses[rounded]}
    ${paddingClasses[padding]}
    ${hover ? 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02]' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const content = (
    <div className={baseClasses} onClick={onClick}>
      {/* Gradient overlay for depth */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 pointer-events-none" />
      )}
      
      {/* Animated shimmer effect */}
      {hover && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default GlassContainer;