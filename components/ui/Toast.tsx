import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
  position?: ToastPosition;
  showProgress?: boolean;
}

const toastIcons = {
  success: <FaCheckCircle className="w-5 h-5" />,
  error: <FaExclamationCircle className="w-5 h-5" />,
  info: <FaInfoCircle className="w-5 h-5" />,
  warning: <FaExclamationTriangle className="w-5 h-5" />
};

const toastColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-amber-500',
  warning: 'bg-yellow-500'
};

const toastTextColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-amber-500',
  warning: 'text-yellow-500'
};

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 4000,
  onClose,
  position = 'top-right',
  showProgress = true
}) => {
  const [progress, setProgress] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    if (duration <= 0 || isDragging) return;

    const interval = 50; // Update every 50ms
    const decrement = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(timer);
          onClose(id);
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, id, onClose, isDragging]);

  const handleDragEnd = (event: MouseEvent | TouchEvent, info: { offset: { x: number; y: number }; velocity?: { x: number; y: number } }) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold || (info.velocity && Math.abs(info.velocity.x) > 500)) {
      onClose(id);
    } else {
      setDragX(0);
    }
    setIsDragging(false);
  };

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
  };

  const getAnimationVariants = () => {
    const isRight = position.includes('right');
    const isBottom = position.includes('bottom');
    const isCenter = position.includes('center');

    return {
      initial: {
        opacity: 0,
        x: isCenter ? 0 : isRight ? 400 : -400,
        y: isCenter ? (isBottom ? 50 : -50) : 0,
        scale: 0.8
      },
      animate: {
        opacity: 1,
        x: dragX,
        y: 0,
        scale: 1,
        transition: {
          type: "spring" as const,
          stiffness: 300,
          damping: 25
        }
      },
      exit: {
        opacity: 0,
        x: isCenter ? 0 : isRight ? 400 : -400,
        y: isCenter ? (isBottom ? 50 : -50) : 0,
        scale: 0.8,
        transition: {
          duration: 0.2
        }
      }
    };
  };

  return (
    <motion.div
      className={`fixed ${getPositionClasses()} z-50 pointer-events-auto`}
      variants={getAnimationVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      dragElastic={0.2}
      onDrag={(event, info) => {
        setDragX(info.offset.x);
        setIsDragging(true);
      }}
      onDragEnd={handleDragEnd}
      style={{ x: dragX }}
    >
      <div className="bg-white dark:bg-stone-800 rounded-lg shadow-xl overflow-hidden min-w-[300px] max-w-md">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${toastTextColors[type]}`}>
              {toastIcons[type]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {message}
              </p>
            </div>
            <button
              onClick={() => onClose(id)}
              className="flex-shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showProgress && duration > 0 && (
          <div className="h-1 bg-stone-200 dark:bg-stone-700">
            <motion.div
              className={`h-full ${toastColors[type]}`}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
    position?: ToastPosition;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, typeof toasts>);

  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed ${position} z-50 pointer-events-none`}
          style={{
            display: 'flex',
            flexDirection: position.includes('bottom') ? 'column-reverse' : 'column',
            gap: '0.75rem'
          }}
        >
          <AnimatePresence mode="sync">
            {positionToasts.map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                position={position as ToastPosition}
                onClose={onClose}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
};