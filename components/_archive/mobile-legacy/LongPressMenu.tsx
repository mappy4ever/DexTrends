import React, { useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  action: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface LongPressMenuProps {
  items: MenuItem[];
  children: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  longPressDelay?: number; // ms
  disabled?: boolean;
  className?: string;
}

export const LongPressMenu: React.FC<LongPressMenuProps> = ({
  items,
  children,
  onOpen,
  onClose,
  longPressDelay = 500,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const openMenu = useCallback((x: number, y: number, rect: DOMRect) => {
    setMenuPosition({ x, y });
    setTargetRect(rect);
    setIsOpen(true);
    onOpen?.();
    
    // Subtle haptic feedback (if available)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [onOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      
      longPressTimerRef.current = setTimeout(() => {
        openMenu(touch.clientX, touch.clientY, rect);
      }, longPressDelay);
    }
  }, [disabled, longPressDelay, openMenu]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !longPressTimerRef.current) return;
    
    const touch = e.touches[0];
    const moveThreshold = 10; // pixels
    
    // Cancel if moved too far
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      openMenu(e.clientX, e.clientY, rect);
    }
  }, [disabled, openMenu]);

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target && !target.closest('.long-press-menu')) {
        closeMenu();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, closeMenu]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={`long-press-target ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            className="long-press-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
          >
            <motion.div
              className="long-press-menu"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
              style={{
                left: menuPosition.x,
                top: menuPosition.y
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Highlight effect on target */}
              {targetRect && (
                <motion.div
                  className="target-highlight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'fixed',
                    left: targetRect.left - 4,
                    top: targetRect.top - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Menu items */}
              <div className="menu-items">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className={`menu-item ${item.destructive ? 'destructive' : ''} ${item.disabled ? 'disabled' : ''}`}
                    onClick={() => {
                      if (!item.disabled) {
                        item.action();
                        closeMenu();
                      }
                    }}
                    disabled={item.disabled}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.icon && <span className="menu-icon">{item.icon}</span>}
                    <span className="menu-label">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      <style jsx>{`
        .long-press-target {
          position: relative;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        .long-press-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        .long-press-menu {
          position: fixed;
          z-index: 10000;
          transform: translate(-50%, -100%) translateY(-12px);
          filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.15));
        }

        .target-highlight {
          background: rgba(59, 130, 246, 0.1);
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          z-index: 9998;
        }

        .menu-items {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 4px;
          min-width: 180px;
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .menu-item:not(:last-child) {
          margin-bottom: 2px;
        }

        .menu-item:hover:not(.disabled) {
          background: rgba(59, 130, 246, 0.08);
        }

        .menu-item:active:not(.disabled) {
          background: rgba(59, 130, 246, 0.12);
        }

        .menu-item.destructive {
          color: #ef4444;
        }

        .menu-item.destructive:hover:not(.disabled) {
          background: rgba(239, 68, 68, 0.08);
        }

        .menu-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .menu-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .menu-label {
          flex: 1;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .target-highlight {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.4);
          }

          .menu-items {
            background: rgba(31, 41, 55, 0.98);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 
              0 4px 24px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .menu-item {
            color: #f3f4f6;
          }

          .menu-item:hover:not(.disabled) {
            background: rgba(59, 130, 246, 0.15);
          }

          .menu-item.destructive {
            color: #f87171;
          }

          .menu-item.destructive:hover:not(.disabled) {
            background: rgba(248, 113, 113, 0.15);
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .menu-item:active:not(.disabled) {
            background: rgba(59, 130, 246, 0.15);
            transform: scale(0.98);
          }
        }
      `}</style>
    </>
  );
};