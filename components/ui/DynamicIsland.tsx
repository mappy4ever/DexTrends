import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import hapticFeedback from '@/utils/hapticFeedback';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'pokemon';

export interface DynamicIslandNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: {
    pokemon?: {
      id: number;
      name: string;
      sprite?: string;
    };
    progress?: number;
  };
}

interface DynamicIslandProps {
  className?: string;
}

// Singleton for managing notifications
class DynamicIslandManager {
  private listeners: Set<(notification: DynamicIslandNotification) => void> = new Set();
  private currentNotification: DynamicIslandNotification | null = null;

  show(notification: Omit<DynamicIslandNotification, 'id'>) {
    const fullNotification: DynamicIslandNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`
    };
    
    this.currentNotification = fullNotification;
    this.listeners.forEach(listener => listener(fullNotification));
    
    // Trigger haptic feedback based on type
    switch (notification.type) {
      case 'success':
        hapticFeedback.success();
        break;
      case 'error':
        hapticFeedback.error();
        break;
      case 'warning':
        hapticFeedback.warning();
        break;
      default:
        hapticFeedback.light();
    }
  }

  subscribe(listener: (notification: DynamicIslandNotification) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getCurrentNotification() {
    return this.currentNotification;
  }
}

// Export singleton instance
export const dynamicIsland = new DynamicIslandManager();

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ className = '' }) => {
  const [notification, setNotification] = useState<DynamicIslandNotification | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = dynamicIsland.subscribe((newNotification) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setNotification(newNotification);
      setIsExpanded(true);
      setIsInteractive(false);

      // Auto-collapse after duration (default 3s)
      const duration = newNotification.duration || 3000;
      if (duration > 0 && newNotification.type !== 'loading') {
        timeoutRef.current = setTimeout(() => {
          setIsExpanded(false);
          setTimeout(() => setNotification(null), 300);
        }, duration);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInteraction = () => {
    if (!notification) return;
    
    hapticFeedback.light();
    setIsInteractive(!isInteractive);
    
    // Reset auto-hide timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleAction = () => {
    if (notification?.action) {
      hapticFeedback.medium();
      notification.action.onClick();
      setIsExpanded(false);
      setTimeout(() => setNotification(null), 300);
    }
  };

  const getIcon = () => {
    if (notification?.icon) return notification.icon;
    
    switch (notification?.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeStyles = () => {
    switch (notification?.type) {
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400';
      case 'error':
        return 'from-red-500/20 to-rose-500/20 text-red-600 dark:text-red-400';
      case 'warning':
        return 'from-yellow-500/20 to-orange-500/20 text-yellow-600 dark:text-yellow-400';
      case 'pokemon':
        return 'from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400';
      case 'loading':
        return 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400';
      default:
        return 'from-gray-500/20 to-slate-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className={cn(
            "fixed z-[100] pointer-events-none",
            "top-safe left-1/2 -translate-x-1/2",
            className
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            className={cn(
              "pointer-events-auto cursor-pointer",
              "bg-gradient-to-r backdrop-blur-xl",
              "border border-white/10 dark:border-white/5",
              "shadow-premium-lg",
              "overflow-hidden",
              getTypeStyles()
            )}
            layout
            animate={{
              width: isExpanded ? (isInteractive ? 320 : 280) : 120,
              height: isExpanded ? (isInteractive ? 80 : 44) : 32,
              borderRadius: isExpanded ? 24 : 16
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={handleInteraction}
            onHoverStart={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onHoverEnd={() => {
              if (notification.type !== 'loading' && !isInteractive) {
                timeoutRef.current = setTimeout(() => {
                  setIsExpanded(false);
                  setTimeout(() => setNotification(null), 300);
                }, 1000);
              }
            }}
          >
            <motion.div
              className="flex items-center h-full px-3"
              animate={{
                justifyContent: isExpanded ? 'flex-start' : 'center'
              }}
            >
              {/* Collapsed State */}
              <AnimatePresence mode="wait">
                {!isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    {notification.metadata?.pokemon?.sprite ? (
                      <img 
                        src={notification.metadata.pokemon.sprite} 
                        alt=""
                        className="w-5 h-5"
                      />
                    ) : (
                      getIcon()
                    )}
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expanded State */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1"
                  >
                    {!isInteractive ? (
                      // Simple expanded view
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {notification.metadata?.pokemon?.sprite ? (
                            <img 
                              src={notification.metadata.pokemon.sprite} 
                              alt=""
                              className="w-8 h-8"
                            />
                          ) : (
                            getIcon()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs opacity-75 truncate">
                              {notification.message}
                            </p>
                          )}
                        </div>
                        {notification.metadata?.progress !== undefined && (
                          <div className="w-12 h-12">
                            <svg className="transform -rotate-90 w-12 h-12">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                opacity="0.2"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${notification.metadata.progress * 1.26} 126`}
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Interactive expanded view
                      <div className="py-2">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {notification.metadata?.pokemon?.sprite ? (
                              <img 
                                src={notification.metadata.pokemon.sprite} 
                                alt=""
                                className="w-8 h-8"
                              />
                            ) : (
                              getIcon()
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs opacity-75 mt-0.5">
                                {notification.message}
                              </p>
                            )}
                          </div>
                        </div>
                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction();
                            }}
                            className={cn(
                              "w-full px-3 py-1.5 rounded-lg",
                              "bg-white/10 hover:bg-white/20",
                              "text-xs font-medium",
                              "transition-colors duration-200"
                            )}
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};