import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import hapticFeedback from '../../utils/hapticFeedback';

export interface ContextMenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
  color?: string;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
  variant?: 'radial' | 'list';
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onClose,
  variant = 'list'
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to ensure menu stays within viewport
  useEffect(() => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 10;
    }
    if (y < 10) {
      y = 10;
    }

    setAdjustedPosition({ x, y });
  }, [position]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      const target = e.target as Element;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    // Delay to prevent immediate close on touch release
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  if (variant === 'radial') {
    return createPortal(
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Center point */}
          <motion.div
            className="absolute w-4 h-4 bg-amber-500 rounded-full"
            style={{ left: position.x - 8, top: position.y - 8 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />

          {/* Radial menu items */}
          {items.map((item, index) => {
            const angle = (index * 360) / items.length - 90; // Start from top
            const radius = 80;
            const x = position.x + Math.cos((angle * Math.PI) / 180) * radius;
            const y = position.y + Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.button
                key={item.id}
                className={`absolute w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
                  item.disabled
                    ? 'bg-stone-200 text-stone-400'
                    : item.color || 'bg-white hover:bg-stone-50'
                } transition-colors`}
                style={{ left: x - 28, top: y - 28 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                onClick={() => {
                  if (!item.disabled) {
                    hapticFeedback.selection();
                    item.action();
                    onClose();
                  }
                }}
                disabled={item.disabled}
                whileHover={!item.disabled ? { scale: 1.1 } : {}}
                whileTap={!item.disabled ? { scale: 0.95 } : {}}
                onHoverStart={() => !item.disabled && hapticFeedback.light()}
                aria-label={item.label}
              >
                <div className="text-xl">{item.icon}</div>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  }

  // List variant (default)
  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="fixed z-50 bg-white dark:bg-stone-800 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden"
        style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="py-1">
          {items.map((item, index) => (
            <motion.button
              key={item.id}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                item.disabled
                  ? 'text-stone-400 bg-stone-50 dark:bg-stone-900'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { delay: index * 0.05 }
              }}
              onClick={() => {
                if (!item.disabled) {
                  hapticFeedback.selection();
                  item.action();
                  onClose();
                }
              }}
              disabled={item.disabled}
              whileHover={!item.disabled ? { x: 5 } : {}}
              whileTap={!item.disabled ? { scale: 0.98 } : {}}
              onHoverStart={() => !item.disabled && hapticFeedback.light()}
              aria-label={item.label}
            >
              <span className={`text-lg ${item.color || ''}`}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// Hook for managing context menu state
export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const openMenu = (event: React.TouchEvent | React.MouseEvent, menuItems: ContextMenuItem[]) => {
    let x, y;
    
    if ('touches' in event) {
      const touch = event.touches[0];
      x = touch.clientX;
      y = touch.clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    setPosition({ x, y });
    setItems(menuItems);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLongPress = (
    event: React.TouchEvent | React.MouseEvent,
    menuItems: ContextMenuItem[],
    delay: number = 500
  ) => {
    const startLongPress = () => {
      longPressTimer.current = setTimeout(() => {
        hapticFeedback.longPress();
        openMenu(event, menuItems);
        // Visual feedback
        if ('touches' in event && event.currentTarget) {
          const element = event.currentTarget as HTMLElement;
          element.style.transform = 'scale(0.95)';
          setTimeout(() => {
            element.style.transform = '';
          }, 200);
        }
      }, delay);
    };

    const cancelLongPress = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    return {
      onTouchStart: startLongPress,
      onTouchEnd: cancelLongPress,
      onTouchMove: cancelLongPress,
      onMouseDown: startLongPress,
      onMouseUp: cancelLongPress,
      onMouseLeave: cancelLongPress
    };
  };

  return {
    isOpen,
    position,
    items,
    openMenu,
    closeMenu,
    handleLongPress
  };
};