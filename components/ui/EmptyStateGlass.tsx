import React from 'react';
import { motion } from 'framer-motion';
// Glass styles replaced with Tailwind classes - createGlassStyle removed
import Button from './Button';
import { FiSearch, FiAlertCircle, FiPackage, FiRefreshCw } from 'react-icons/fi';

type EmptyStateType = 'search' | 'no-data' | 'error' | 'loading' | 'custom';

interface EmptyStateGlassProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  iconText?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

const EmptyStateGlass: React.FC<EmptyStateGlassProps> = ({
  type = 'no-data',
  title,
  message,
  icon,
  iconText,
  actionButton,
  secondaryButton,
  children,
  className = '',
  animate = true,
}) => {
  // Default configurations based on type
  const defaultConfigs = {
    search: {
      icon: <FiSearch className="w-16 h-16 text-purple-400" />,
      iconText: '🔍',
      title: 'No results found',
      message: 'Try adjusting your search or filters to find what you\'re looking for.',
    },
    'no-data': {
      icon: <FiPackage className="w-16 h-16 text-blue-400" />,
      iconText: '📦',
      title: 'No data yet',
      message: 'Start by adding your first item to see it here.',
    },
    error: {
      icon: <FiAlertCircle className="w-16 h-16 text-red-400" />,
      iconText: '⚠️',
      title: 'Something went wrong',
      message: 'We encountered an error loading this content. Please try again.',
    },
    loading: {
      icon: <FiRefreshCw className="w-16 h-16 text-gray-400 animate-spin" />,
      iconText: '⏳',
      title: 'Loading...',
      message: 'Please wait while we fetch your data.',
    },
    custom: {
      icon: null,
      iconText: '✨',
      title: '',
      message: '',
    },
  };

  const config = defaultConfigs[type];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayIcon = icon || config.icon;
  const displayIconText = iconText || (displayIcon ? null : config.iconText);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={animate ? containerVariants : undefined}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      className={`
        backdrop-blur-xl bg-gradient-to-br from-white/80 via-purple-50/80 to-pink-50/80 
        dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80
        border border-white/40 dark:border-gray-700/40
        shadow-xl
        p-8 md:p-12 text-center rounded-3xl
        ${className}
      `}
    >
      <motion.div 
        variants={animate ? itemVariants : undefined}
        className="flex flex-col items-center space-y-4"
      >
        {/* Icon or Emoji */}
        {(displayIcon || displayIconText) && (
          <div className="mb-4">
            {displayIcon ? (
              <div className="backdrop-blur-md bg-gradient-to-br from-white/30 via-white/20 to-white/30 dark:from-gray-800/30 dark:via-gray-800/20 dark:to-gray-800/30 border border-white/20 dark:border-gray-700/20 shadow-md rounded-full w-24 h-24 flex items-center justify-center">
                {displayIcon}
              </div>
            ) : (
              <div className="text-6xl mb-2">{displayIconText}</div>
            )}
          </div>
        )}

        {/* Title */}
        {displayTitle && (
          <motion.h3
            variants={animate ? itemVariants : undefined}
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            {displayTitle}
          </motion.h3>
        )}

        {/* Message */}
        {displayMessage && (
          <motion.p
            variants={animate ? itemVariants : undefined}
            className="text-gray-600 dark:text-gray-400 max-w-md mx-auto"
          >
            {displayMessage}
          </motion.p>
        )}

        {/* Custom Content */}
        {children && (
          <motion.div variants={animate ? itemVariants : undefined}>
            {children}
          </motion.div>
        )}

        {/* Action Buttons */}
        {(actionButton || secondaryButton) && (
          <motion.div
            variants={animate ? itemVariants : undefined}
            className="flex flex-col sm:flex-row gap-3 mt-6"
          >
            {actionButton && (
              <Button
                onClick={actionButton.onClick}
                variant={actionButton.variant || 'primary'}
                gradient={true}
                className="min-w-[120px]"
              >
                {actionButton.text}
              </Button>
            )}
            {secondaryButton && (
              <button
                onClick={secondaryButton.onClick}
                className={`
                  px-6 py-3 rounded-full font-medium
                  backdrop-blur-md bg-white/70 dark:bg-gray-800/70
                  border border-white/30 dark:border-gray-700/30
                  hover:bg-white/90 dark:hover:bg-gray-800/90
                  transition-all duration-300
                `}
              >
                {secondaryButton.text}
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EmptyStateGlass;