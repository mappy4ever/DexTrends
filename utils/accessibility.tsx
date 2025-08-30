import React, { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from './cn';

/**
 * Accessibility Utilities
 * 
 * WCAG 2.1 AA compliant helpers
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - ARIA attributes
 */

/**
 * Skip to main content link
 */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'focus:px-4 focus:py-2 focus:rounded-lg',
        'focus:bg-purple-600 focus:text-white',
        'focus:shadow-lg focus:outline-none',
        'transition-all'
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * Screen reader only text
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * Visually hidden but accessible
 */
export function VisuallyHidden({ 
  children,
  as: Component = 'span' 
}: { 
  children: React.ReactNode;
  as?: any;
}) {
  return (
    <Component
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)'
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Focus trap hook
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Keyboard navigation hook
 */
export function useKeyboardNavigation(
  items: any[],
  options: {
    onSelect?: (item: any, index: number) => void;
    onEscape?: () => void;
    orientation?: 'horizontal' | 'vertical' | 'grid';
    loop?: boolean;
    cols?: number;
  } = {}
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const {
    onSelect,
    onEscape,
    orientation = 'vertical',
    loop = true,
    cols = 1
  } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const itemCount = items.length;
    if (itemCount === 0) return;

    let nextIndex = focusedIndex;

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          e.preventDefault();
          nextIndex = orientation === 'grid' 
            ? Math.min(focusedIndex + cols, itemCount - 1)
            : focusedIndex + 1;
        }
        break;
        
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          e.preventDefault();
          nextIndex = orientation === 'grid'
            ? Math.max(focusedIndex - cols, 0)
            : focusedIndex - 1;
        }
        break;
        
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          e.preventDefault();
          nextIndex = focusedIndex + 1;
        }
        break;
        
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          e.preventDefault();
          nextIndex = focusedIndex - 1;
        }
        break;
        
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
        
      case 'End':
        e.preventDefault();
        nextIndex = itemCount - 1;
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && onSelect) {
          onSelect(items[focusedIndex], focusedIndex);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        if (onEscape) {
          onEscape();
        }
        break;
    }

    // Handle wrapping
    if (loop) {
      if (nextIndex < 0) nextIndex = itemCount - 1;
      if (nextIndex >= itemCount) nextIndex = 0;
    } else {
      nextIndex = Math.max(0, Math.min(nextIndex, itemCount - 1));
    }

    setFocusedIndex(nextIndex);
  }, [focusedIndex, items, onSelect, onEscape, orientation, loop, cols]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedIndex,
    setFocusedIndex,
    resetFocus: () => setFocusedIndex(-1)
  };
}

/**
 * Live region for announcements
 */
export function LiveRegion({ 
  message,
  politeness = 'polite',
  atomic = true
}: {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Accessible button
 */
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-disabled={disabled}
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Accessible dialog
 */
export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const trapRef = useFocusTrap(isOpen);
  const titleId = `dialog-title-${Math.random()}`;
  const descId = `dialog-desc-${Math.random()}`;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      ref={trapRef as any}
      className={className}
    >
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      {description && (
        <p id={descId} className="sr-only">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

/**
 * Accessible form field
 */
export function AccessibleField({
  label,
  error,
  required = false,
  children,
  className
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}) {
  const id = `field-${Math.random()}`;
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {React.cloneElement(children, {
        id,
        'aria-invalid': !!error,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required
      } as any)}
      
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Accessible tabs
 */
export function AccessibleTabs({
  tabs,
  activeTab,
  onChange,
  className
}: {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}) {
  const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(tabs, {
    onSelect: (tab) => onChange(tab.id),
    orientation: 'horizontal'
  });

  return (
    <div className={className}>
      <div role="tablist" aria-orientation="horizontal">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onFocus={() => setFocusedIndex(index)}
            className={cn(
              'px-4 py-2 font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-purple-500',
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className="py-4 focus:outline-none"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

/**
 * Accessible loading indicator
 */
export function AccessibleLoading({ 
  message = 'Loading...' 
}: { 
  message?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <ScreenReaderOnly>{message}</ScreenReaderOnly>
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
    </div>
  );
}

/**
 * Focus visible utilities
 */
export const focusRing = cn(
  'focus:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-purple-500',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-white',
  'dark:focus-visible:ring-offset-gray-900'
);

/**
 * High contrast mode detection
 */
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
}

/**
 * Announce to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}