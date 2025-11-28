import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import hapticFeedback from '@/utils/hapticFeedback';

interface UnifiedPullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  threshold?: number;
  maxPull?: number;
  className?: string;
}

/**
 * Unified Pull to Refresh Component
 * Works on touch devices without device detection
 * Degrades gracefully on desktop (shows refresh button)
 */
export const UnifiedPullToRefresh: React.FC<UnifiedPullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
  maxPull = 150,
  className
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop !== 0 || isRefreshing) return;
      
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;
      
      currentY.current = e.touches[0].clientY;
      const distance = Math.min(currentY.current - startY.current, maxPull);
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
        
        // Haptic feedback at threshold
        if (distance > threshold && pullDistance <= threshold) {
          hapticFeedback.light();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      
      isPulling.current = false;
      
      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        hapticFeedback.medium();
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    // Desktop: Show refresh button on scroll to top
    const handleScroll = () => {
      if (container.scrollTop === 0 && !('ontouchstart' in window)) {
        setShowRefreshButton(true);
      } else {
        setShowRefreshButton(false);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [disabled, isRefreshing, onRefresh, pullDistance, threshold, maxPull]);

  const handleDesktopRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const scale = 0.5 + progress * 0.5;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative h-full overflow-auto",
        className
      )}
      style={{
        transform: isRefreshing ? 'none' : `translateY(${pullDistance}px)`,
        transition: isPulling.current ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none"
            style={{ 
              height: `${pullDistance}px`,
              marginTop: `-${pullDistance}px`
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: isRefreshing ? 360 : rotation,
                  scale: scale
                }}
                transition={{
                  rotate: {
                    duration: isRefreshing ? 1 : 0,
                    repeat: isRefreshing ? Infinity : 0,
                    ease: "linear"
                  }
                }}
                className={cn(
                  "w-10 h-10 rounded-full",
                  "bg-gradient-to-r from-amber-500 to-pink-500",
                  "flex items-center justify-center",
                  "shadow-lg"
                )}
              >
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Refresh Button */}
      <AnimatePresence>
        {showRefreshButton && !isRefreshing && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={handleDesktopRefresh}
            className={cn(
              "absolute top-4 right-4 z-10",
              "px-4 py-2 rounded-full",
              "bg-gradient-to-r from-amber-500 to-pink-500",
              "text-white font-medium",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-200",
              "hover:scale-105"
            )}
          >
            Refresh
          </motion.button>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"
              />
              <p className="text-sm text-stone-600 dark:text-stone-400">Refreshing...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {children}
    </div>
  );
};