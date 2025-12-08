/**
 * UpdateNotification - PWA Update Banner
 *
 * Shows when a new version of the app is available.
 * Allows user to update immediately or dismiss.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiX, FiDownload } from 'react-icons/fi';
import { cn } from '@/utils/cn';

interface UpdateNotificationProps {
  isVisible: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateNotification({
  isVisible,
  onUpdate,
  onDismiss,
}: UpdateNotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={cn(
            'fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50',
            'bg-gradient-to-r from-amber-500 to-orange-500',
            'rounded-xl shadow-lg shadow-amber-500/20',
            'p-4'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FiDownload className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold">Update Available</h4>
              <p className="text-white/80 text-sm mt-0.5">
                A new version of DexTrends is ready. Update now for the latest features!
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={onUpdate}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5',
                    'bg-white text-amber-600 font-medium text-sm',
                    'rounded-lg hover:bg-amber-50',
                    'transition-colors duration-150',
                    'min-h-[36px]'
                  )}
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Update Now
                </button>
                <button
                  onClick={onDismiss}
                  className={cn(
                    'px-3 py-1.5',
                    'text-white/80 hover:text-white font-medium text-sm',
                    'rounded-lg hover:bg-white/10',
                    'transition-colors duration-150',
                    'min-h-[36px]'
                  )}
                >
                  Later
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onDismiss}
              className={cn(
                'flex-shrink-0 p-1.5 rounded-lg',
                'text-white/60 hover:text-white hover:bg-white/10',
                'transition-colors duration-150'
              )}
              aria-label="Dismiss update notification"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Offline Indicator - Shows when user is offline
 */
export function OfflineIndicator({ isOffline }: { isOffline: boolean }) {
  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'fixed top-0 left-0 right-0 z-[60]',
            'bg-stone-800 text-white',
            'py-2 px-4 text-center text-sm',
            'safe-area-padding-top'
          )}
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            You're offline. Some features may be limited.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UpdateNotification;
