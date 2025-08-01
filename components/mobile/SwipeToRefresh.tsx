import React, { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

interface SwipeToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  threshold?: number; // Pull distance threshold in pixels
  maxPull?: number; // Maximum pull distance
  className?: string;
}

export const SwipeToRefresh: React.FC<SwipeToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
  maxPull = 150,
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth animations
  const pullDistance = useMotionValue(0);
  const pullProgress = useTransform(pullDistance, [0, threshold], [0, 1]);
  const pullSpring = useSpring(pullDistance, {
    stiffness: 400,
    damping: 30
  });

  // Transform values for visual feedback
  const indicatorScale = useTransform(pullProgress, [0, 0.5, 1], [0.5, 0.8, 1]);
  const indicatorOpacity = useTransform(pullProgress, [0, 0.3, 1], [0, 0.5, 1]);
  const indicatorRotation = useTransform(pullProgress, [0, 1], [0, 180]);
  const contentTranslateY = useTransform(pullSpring, [0, maxPull], [0, maxPull * 0.5]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      pullDistance.set(0);
    }
  }, [onRefresh, pullDistance]);

  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) return false;
    
    // Check if we're at the top of the scrollable area
    const scrollTop = containerRef.current.scrollTop || window.scrollY;
    return scrollTop <= 0;
  }, []);

  return (
    <div ref={containerRef} className={`swipe-to-refresh-container ${className}`}>
      <motion.div
        className="swipe-to-refresh-content"
        style={{ y: contentTranslateY }}
        drag={disabled || isRefreshing ? false : "y"}
        dragConstraints={{ top: 0, bottom: maxPull }}
        dragElastic={0.5}
        onDragStart={(event, info) => {
          if (checkScrollPosition()) {
            setIsPulling(true);
          }
          // Note: Cannot cancel drag from onDragStart
        }}
        onDrag={(event, info) => {
          if (!isPulling) return;
          
          const distance = Math.max(0, Math.min(info.offset.y, maxPull));
          pullDistance.set(distance);
        }}
        onDragEnd={(event, info) => {
          setIsPulling(false);
          
          if (pullDistance.get() >= threshold && !isRefreshing) {
            handleRefresh();
          } else {
            pullDistance.set(0);
          }
        }}
      >
        {/* Pull indicator */}
        <AnimatePresence>
          {(isPulling || isRefreshing) && (
            <motion.div
              className="pull-indicator"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="pull-indicator-content"
                style={{
                  scale: indicatorScale,
                  opacity: indicatorOpacity
                }}
              >
                {isRefreshing ? (
                  <motion.div
                    className="refresh-spinner"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5A7.5 7.5 0 1 1 4 12z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    className="pull-arrow"
                    style={{ rotate: indicatorRotation }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 19V5M12 5l-7 7M12 5l7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}
                
                <motion.div
                  className="pull-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {isRefreshing ? 'Refreshing...' : 
                   pullDistance.get() >= threshold ? 'Release to refresh' : 'Pull to refresh'}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        {children}
      </motion.div>

      <style jsx>{`
        .swipe-to-refresh-container {
          position: relative;
          height: 100%;
          overflow-y: auto;
          overscroll-behavior-y: contain;
          -webkit-overflow-scrolling: touch;
        }

        .swipe-to-refresh-content {
          position: relative;
          min-height: 100%;
        }

        .pull-indicator {
          position: absolute;
          top: -80px;
          left: 0;
          right: 0;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 10;
        }

        .pull-indicator-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .pull-arrow,
        .refresh-spinner {
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pull-text {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .pull-indicator-content {
            background: rgba(31, 41, 55, 0.95);
            box-shadow: 
              0 4px 16px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .pull-text {
            color: #9ca3af;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .swipe-to-refresh-content {
            transition: none !important;
          }

          .pull-arrow,
          .refresh-spinner {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};