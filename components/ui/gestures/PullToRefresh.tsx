import React, { useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/utils/cn';
const hapticManager = typeof window !== 'undefined' ? require('@/utils/hapticFeedback').default : null;

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  className?: string;
  refreshText?: string;
  pullingText?: string;
  releaseText?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  disabled = false,
  className,
  refreshText = "Refreshing...",
  pullingText = "Pull to refresh",
  releaseText = "Release to refresh"
}) => {
  const handleRefresh = useCallback(async () => {
    if (hapticManager) {
      hapticManager.pullToRefresh('trigger');
    }
    await onRefresh();
    if (hapticManager) {
      hapticManager.notification('success');
    }
  }, [onRefresh]);

  const { pullState, setContainer, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled,
    threshold: 80,
    maxPull: 150
  });

  // Pokeball rotation based on pull distance
  const rotation = pullState.pullDistance * 3;
  
  // Scale animation for pokeball
  const scale = 0.5 + (progress * 0.5);
  
  // Determine status text
  const statusText = pullState.isRefreshing 
    ? refreshText 
    : pullState.shouldTrigger 
      ? releaseText 
      : pullingText;

  return (
    <div 
      ref={setContainer}
      className={cn("relative", className)}
    >
      {/* Pull Indicator */}
      <AnimatePresence>
        {(pullState.isPulling || pullState.isRefreshing) && (
          <motion.div
            className="absolute top-0 left-0 right-0 flex flex-col items-center justify-end overflow-hidden pointer-events-none z-50"
            initial={{ height: 0 }}
            animate={{ height: pullState.pullDistance }}
            exit={{ height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ 
              marginTop: -pullState.pullDistance,
              height: pullState.pullDistance 
            }}
          >
            {/* Background gradient */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent dark:from-stone-800"
              style={{ opacity: progress * 0.3 }}
            />
            
            {/* Pokeball Container */}
            <div className="relative flex flex-col items-center justify-center pb-4">
              {/* Pokeball SVG */}
              <motion.svg
                width="48"
                height="48"
                viewBox="0 0 100 100"
                animate={{
                  rotate: pullState.isRefreshing ? 360 : rotation,
                  scale
                }}
                transition={
                  pullState.isRefreshing 
                    ? { rotate: { repeat: Infinity, duration: 1, ease: "linear" } }
                    : { type: "spring", stiffness: 300 }
                }
                className={cn(
                  "drop-shadow-lg",
                  pullState.shouldTrigger && !pullState.isRefreshing && "drop-shadow-xl"
                )}
              >
                {/* Top half (red) */}
                <path
                  d="M 50 10 A 40 40 0 0 1 90 50 L 10 50 A 40 40 0 0 1 50 10"
                  fill="#ef4444"
                  className={cn(
                    "transition-all duration-200",
                    pullState.shouldTrigger && "fill-red-600"
                  )}
                />
                
                {/* Bottom half (white) */}
                <path
                  d="M 50 90 A 40 40 0 0 1 10 50 L 90 50 A 40 40 0 0 1 50 90"
                  fill="#ffffff"
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
                
                {/* Center line */}
                <rect x="10" y="48" width="80" height="4" fill="#1f2937" />
                
                {/* Center button outer */}
                <circle cx="50" cy="50" r="12" fill="#1f2937" />
                
                {/* Center button inner */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="8" 
                  fill="#ffffff"
                  className={cn(
                    "transition-all duration-200",
                    pullState.isRefreshing && "animate-pulse",
                    pullState.shouldTrigger && !pullState.isRefreshing && "fill-blue-400"
                  )}
                />
                
                {/* Highlight effect */}
                <ellipse
                  cx="35"
                  cy="25"
                  rx="8"
                  ry="12"
                  fill="rgba(255,255,255,0.4)"
                  transform="rotate(-20 35 25)"
                />
              </motion.svg>
              
              {/* Status Text */}
              <motion.p
                className={cn(
                  "mt-2 text-xs font-medium",
                  pullState.shouldTrigger 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-stone-500 dark:text-stone-400"
                )}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {statusText}
              </motion.p>
              
              {/* Progress indicator dots */}
              {pullState.isRefreshing && (
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content with transform */}
      <motion.div
        animate={{
          y: pullState.pullDistance
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};