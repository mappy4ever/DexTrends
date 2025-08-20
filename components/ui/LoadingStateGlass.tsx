import React from 'react';
import { motion } from 'framer-motion';
import { createGlassStyle } from './design-system/glass-constants';

type LoadingType = 'spinner' | 'skeleton' | 'progress' | 'pulse' | 'dots';

interface LoadingStateGlassProps {
  type?: LoadingType;
  message?: string;
  progress?: number;
  rows?: number;
  columns?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const LoadingStateGlass: React.FC<LoadingStateGlassProps> = ({
  type = 'spinner',
  message = 'Loading...',
  progress = 0,
  rows = 3,
  columns = 1,
  className = '',
  size = 'md',
  showPercentage = true,
}) => {
  const sizeConfig = {
    sm: { spinner: 'w-8 h-8', text: 'text-sm', spacing: 'gap-2' },
    md: { spinner: 'w-12 h-12', text: 'text-base', spacing: 'gap-3' },
    lg: { spinner: 'w-16 h-16', text: 'text-lg', spacing: 'gap-4' },
  };

  const config = sizeConfig[size];

  // Spinner Component
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${config.spinner} relative`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-spin">
          <div className="absolute inset-1 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl"></div>
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse"></div>
      </div>
      {message && (
        <p className={`${config.text} text-gray-600 dark:text-gray-400 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="w-full space-y-3">
      {message && (
        <div className="flex justify-between items-center mb-2">
          <p className={`${config.text} text-gray-600 dark:text-gray-400 font-medium`}>
            {message}
          </p>
          {showPercentage && (
            <span className={`${config.text} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className={`space-y-3 w-full`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={`grid grid-cols-${columns} ${config.spacing}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`
                ${createGlassStyle({
                  blur: 'sm',
                  opacity: 'subtle',
                  gradient: true,
                  border: 'subtle',
                  shadow: 'sm',
                  rounded: 'lg',
                })}
                h-20 rounded-xl animate-pulse
                bg-gradient-to-r from-gray-200/50 via-gray-300/50 to-gray-200/50
                dark:from-gray-700/50 dark:via-gray-600/50 dark:to-gray-700/50
              `}
            />
          ))}
        </div>
      ))}
    </div>
  );

  // Pulse Loader Component
  const PulseLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`
              ${createGlassStyle({
                blur: 'md',
                opacity: 'medium',
                gradient: true,
                border: 'subtle',
                shadow: 'md',
                rounded: 'full',
              })}
              w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
            `}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
      {message && (
        <p className={`${config.text} text-gray-600 dark:text-gray-400 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );

  // Dots Loader Component
  const DotsLoader = () => (
    <div className="flex items-center space-x-1">
      <span className={`${config.text} text-gray-600 dark:text-gray-400 font-medium`}>
        {message}
      </span>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="inline-block w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'progress':
        return <ProgressBar />;
      case 'skeleton':
        return <SkeletonLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'dots':
        return <DotsLoader />;
      case 'spinner':
      default:
        return <Spinner />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        ${type === 'skeleton' ? '' : createGlassStyle({
          blur: 'xl',
          opacity: 'medium',
          gradient: true,
          border: 'medium',
          shadow: 'lg',
          rounded: 'xl',
        })}
        ${type === 'skeleton' ? 'p-0' : 'p-8'}
        ${type === 'skeleton' ? '' : 'rounded-2xl'}
        ${className}
      `}
    >
      {renderLoader()}
    </motion.div>
  );
};

// Grid-based skeleton specifically for cards
export const CardGridSkeleton: React.FC<{
  count?: number;
  columns?: string;
  className?: string;
}> = ({ count = 6, columns = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', className = '' }) => (
  <div className={`grid ${columns} gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`
          ${createGlassStyle({
            blur: 'md',
            opacity: 'subtle',
            gradient: true,
            border: 'subtle',
            shadow: 'md',
            rounded: 'xl',
          })}
          h-48 rounded-2xl animate-pulse
          bg-gradient-to-br from-white/20 to-white/10 dark:from-gray-700/20 dark:to-gray-700/10
        `}
      >
        <div className="p-4 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-300/30 dark:bg-gray-600/30 animate-pulse" />
          <div className="h-4 bg-gray-300/30 dark:bg-gray-600/30 rounded animate-pulse" />
          <div className="h-3 bg-gray-300/30 dark:bg-gray-600/30 rounded w-2/3 mx-auto animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingStateGlass;