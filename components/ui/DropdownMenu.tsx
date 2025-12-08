/**
 * DropdownMenu - Accessible dropdown menu component
 *
 * A keyboard-accessible dropdown menu for actions and navigation.
 * Uses Headless UI patterns with DexTrends styling.
 *
 * Usage:
 * <DropdownMenu
 *   trigger={<Button>Options</Button>}
 *   items={[
 *     { label: 'Edit', onClick: () => {} },
 *     { label: 'Delete', onClick: () => {}, variant: 'danger' },
 *   ]}
 * />
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

export interface DropdownMenuItem {
  /** Menu item label */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Menu item icon */
  icon?: React.ReactNode;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Variant for styling */
  variant?: 'default' | 'danger';
  /** Whether this item is selected (for selection menus) */
  selected?: boolean;
  /** Divider before this item */
  divider?: boolean;
  /** Optional href for link items */
  href?: string;
}

export interface DropdownMenuProps {
  /** Trigger element (button) */
  trigger: React.ReactNode;
  /** Menu items */
  items: DropdownMenuItem[];
  /** Menu alignment */
  align?: 'left' | 'right';
  /** Custom trigger className */
  triggerClassName?: string;
  /** Custom menu className */
  menuClassName?: string;
  /** Show chevron on trigger */
  showChevron?: boolean;
  /** Close on item click (default: true) */
  closeOnClick?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'left',
  triggerClassName,
  menuClassName,
  showChevron = true,
  closeOnClick = true,
  disabled = false,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            return next >= items.length ? 0 : next;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? items.length - 1 : next;
          });
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && !items[focusedIndex]?.disabled) {
            items[focusedIndex]?.onClick?.();
            if (closeOnClick) {
              setIsOpen(false);
              triggerRef.current?.focus();
            }
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    },
    [isOpen, items, focusedIndex, closeOnClick]
  );

  // Focus the focused item
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleItemClick = (item: DropdownMenuItem, index: number) => {
    if (item.disabled) return;
    item.onClick?.();
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center',
          'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          triggerClassName
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && (
          <FiChevronDown
            className={cn(
              'ml-1 h-4 w-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-2 min-w-[180px] py-1',
              'bg-white dark:bg-stone-800',
              'rounded-xl border border-stone-200 dark:border-stone-700',
              'shadow-lg shadow-stone-900/10 dark:shadow-stone-900/30',
              align === 'left' ? 'left-0' : 'right-0',
              menuClassName
            )}
            role="menu"
            aria-orientation="vertical"
            onKeyDown={handleKeyDown}
          >
            {items.map((item, index) => {
              const ItemComponent = item.href ? 'a' : 'button';
              const itemProps = item.href ? { href: item.href } : { type: 'button' as const };

              return (
                <React.Fragment key={index}>
                  {item.divider && index > 0 && (
                    <div className="my-1 h-px bg-stone-200 dark:bg-stone-700" />
                  )}
                  <ItemComponent
                    {...itemProps}
                    ref={(el: any) => (itemRefs.current[index] = el)}
                    onClick={() => handleItemClick(item, index)}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-left text-sm',
                      'transition-colors duration-100',
                      'focus:outline-none focus-visible:bg-stone-100 dark:focus-visible:bg-stone-700',
                      item.disabled
                        ? 'opacity-50 cursor-not-allowed text-stone-400 dark:text-stone-500'
                        : item.variant === 'danger'
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700',
                      focusedIndex === index && 'bg-stone-100 dark:bg-stone-700'
                    )}
                    role="menuitem"
                    tabIndex={isOpen ? 0 : -1}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                    )}
                    <span className="flex-1">{item.label}</span>
                    {item.selected && (
                      <FiCheck className="flex-shrink-0 w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </ItemComponent>
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DropdownMenu;
