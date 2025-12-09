import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiHeart, FiShare2, FiInfo } from 'react-icons/fi';
import { useContextMenu, ContextMenuItem } from '../ContextMenu';
import { useNotifications } from '../../../hooks/useNotifications';

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
  enableGestures?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  onInfo?: () => void;
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
  gradientFrom = 'amber-400',
  gradientTo = 'amber-400',
  onClick,
  className = '',
  children,
  hover = true,
  glow = false,
  enableGestures = false,
  onFavorite,
  onShare,
  onInfo
}) => {
  const { success, info } = useNotifications();
  const { handleLongPress, openMenu } = useContextMenu();
  const [swipeX, setSwipeX] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -4 }
  };

  // Context menu items - memoized to avoid unnecessary re-renders
  const contextMenuItems = React.useMemo((): ContextMenuItem[] => [
    {
      id: 'favorite',
      icon: <FiHeart />,
      label: 'Add to Favorites',
      action: () => {
        if (onFavorite) {
          onFavorite();
        } else {
          success('Added to favorites!');
        }
      },
      color: 'text-red-500'
    },
    {
      id: 'share',
      icon: <FiShare2 />,
      label: 'Share',
      action: () => {
        if (onShare) {
          onShare();
        } else {
          info('Share feature coming soon!');
        }
      },
      color: 'text-amber-500'
    },
    {
      id: 'info',
      icon: <FiInfo />,
      label: 'More Info',
      action: () => {
        if (onInfo) {
          onInfo();
        } else {
          info('More information coming soon!');
        }
      },
      color: 'text-stone-500'
    }
  ], [onFavorite, onShare, onInfo, success, info]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isDragging && onClick) {
      onClick();
    }
  }, [isDragging, onClick]);

  const longPressHandlers = React.useMemo(() => {
    if (!enableGestures) return {};
    
    // Create a wrapper that properly calls handleLongPress with the event
    const createHandler = (handler: (event: React.TouchEvent | React.MouseEvent) => void) => {
      return (event: React.TouchEvent | React.MouseEvent) => {
        const handlers = handleLongPress(event, contextMenuItems);
        handler(event);
      };
    };
    
    // For now, we'll manually handle the long press
    return {
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
        openMenu(e, contextMenuItems);
      }
    };
  }, [enableGestures, handleLongPress, openMenu, contextMenuItems]);

  return (
    <motion.div
      className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
      variants={hover ? containerVariants : undefined}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={handleClick}
      drag={enableGestures ? "x" : false}
      dragConstraints={{ left: -100, right: 0 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDrag={(event, info) => {
        if (enableGestures) {
          setSwipeX(info.offset.x);
          setIsDragging(true);
        }
      }}
      onDragEnd={(event, info) => {
        if (enableGestures) {
          if (info.offset.x < -60 || info.velocity.x < -300) {
            setShowActions(true);
            setSwipeX(-100);
          } else {
            setShowActions(false);
            setSwipeX(0);
          }
          setTimeout(() => setIsDragging(false), 100);
        }
      }}
      style={{
        x: swipeX,
        filter: swipeX < -50 ? 'brightness(0.95)' : 'brightness(1)'
      }}
      {...longPressHandlers}
    >
      {/* Main circular container */}
      <div className={`relative ${sizeClasses[size]} group`}>
        {/* Outer gradient ring */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-${gradientFrom} to-${gradientTo} p-[5px] shadow-lg ${glow ? 'animate-pulse' : ''}`}>
          {/* White spacing ring */}
          <div className="w-full h-full rounded-full bg-white/80 dark:bg-stone-800/80 p-[5px]">
            {/* Inner content circle */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-700 dark:to-stone-600 shadow-inner overflow-hidden">
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
            <h3 className="font-bold text-sm sm:text-base capitalize text-stone-800 dark:text-stone-200">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Swipe Actions */}
      <AnimatePresence>
        {enableGestures && showActions && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2 px-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <motion.button
              className="p-2 bg-red-500 text-white rounded-full shadow-lg"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                if (onFavorite) {
                  onFavorite();
                } else {
                  success('Added to favorites!');
                }
                setShowActions(false);
                setSwipeX(0);
              }}
              title="Add to favorites"
            >
              <FiHeart className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              className="p-2 bg-amber-500 text-white rounded-full shadow-lg"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                if (onShare) {
                  onShare();
                } else {
                  info('Share feature coming soon!');
                }
                setShowActions(false);
                setSwipeX(0);
              }}
              title="Share"
            >
              <FiShare2 className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Indicator */}
      {enableGestures && isDragging && swipeX < -20 && !showActions && (
        <motion.div
          className="absolute right-1 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: swipeX < -50 ? 1 : 0.5,
            scale: swipeX < -50 ? 1 : 0.9
          }}
          transition={{ duration: 0.2 }}
        >
          <div className={`px-2 py-1 rounded-full text-xs ${
            swipeX < -50 ? 'bg-amber-500 text-white' : 'bg-stone-300 text-stone-600'
          }`}>
            <motion.span
              animate={{ x: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              ←
            </motion.span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CircularCard;