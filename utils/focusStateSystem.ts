/**
 * Standardized Focus State System
 * Ensures consistent and accessible focus indicators across all interactive elements
 */

import { cn } from '@/utils/cn';

/**
 * Focus ring styles for different contexts
 */
export const focusRings = {
  // Default focus ring (purple)
  default: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-purple-400 dark:focus:ring-offset-gray-900',
  
  // Subtle focus ring
  subtle: 'focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:ring-offset-1 dark:focus:ring-purple-400/50',
  
  // Strong focus ring
  strong: 'focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-purple-400',
  
  // Inset focus ring (for inputs)
  inset: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset dark:focus:ring-purple-400',
  
  // Focus visible only (keyboard navigation)
  visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-purple-400',
  
  // Custom colors
  error: 'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-red-400',
  success: 'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-green-400',
  warning: 'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-yellow-400',
  info: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400',
} as const;

/**
 * Component-specific focus styles
 */
export const componentFocus = {
  // Buttons
  button: cn(
    focusRings.visible,
    'transition-all duration-200'
  ),
  
  buttonPrimary: cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-purple-500',
    'focus-visible:ring-offset-2',
    'dark:focus-visible:ring-purple-400',
    'dark:focus-visible:ring-offset-gray-900'
  ),
  
  buttonSecondary: cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-gray-500',
    'focus-visible:ring-offset-2',
    'dark:focus-visible:ring-gray-400',
    'dark:focus-visible:ring-offset-gray-900'
  ),
  
  buttonGhost: cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-purple-500/50',
    'dark:focus-visible:ring-purple-400/50'
  ),
  
  // Inputs
  input: cn(
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-purple-500',
    'focus:border-purple-500',
    'dark:focus:ring-purple-400',
    'dark:focus:border-purple-400',
    'transition-all duration-200'
  ),
  
  // Links
  link: cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-purple-500',
    'focus-visible:rounded',
    'dark:focus-visible:ring-purple-400'
  ),
  
  // Cards
  card: cn(
    'focus-within:outline-none',
    'focus-within:ring-2',
    'focus-within:ring-purple-500',
    'focus-within:ring-offset-2',
    'dark:focus-within:ring-purple-400',
    'dark:focus-within:ring-offset-gray-900'
  ),
  
  // Navigation items
  navItem: cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-inset',
    'focus-visible:ring-purple-500',
    'dark:focus-visible:ring-purple-400'
  ),
  
  // Tabs
  tab: cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-purple-500',
    'focus-visible:ring-inset',
    'dark:focus-visible:ring-purple-400'
  ),
  
  // Modals
  modal: cn(
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-purple-500',
    'focus:ring-inset',
    'dark:focus:ring-purple-400'
  ),
  
  // Select/Dropdown
  select: cn(
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-purple-500',
    'focus:border-purple-500',
    'dark:focus:ring-purple-400',
    'dark:focus:border-purple-400'
  ),
  
  // Checkbox/Radio
  checkbox: cn(
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-purple-500',
    'focus:ring-offset-2',
    'dark:focus:ring-purple-400',
    'dark:focus:ring-offset-gray-900'
  ),
  
  // Toggle/Switch
  toggle: cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-purple-500',
    'focus-visible:ring-offset-2',
    'dark:focus-visible:ring-purple-400',
    'dark:focus-visible:ring-offset-gray-900'
  ),
} as const;

/**
 * Keyboard navigation utilities
 */
export const keyboardNav = {
  // Skip link for screen readers
  skipLink: cn(
    'sr-only',
    'focus:not-sr-only',
    'focus:absolute',
    'focus:top-4',
    'focus:left-4',
    'focus:z-50',
    'focus:px-4',
    'focus:py-2',
    'focus:bg-purple-600',
    'focus:text-white',
    'focus:rounded-lg',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-purple-500',
    'focus:ring-offset-2'
  ),
  
  // Tab trap for modals
  tabTrap: 'focus-trap',
  
  // Focus lock
  focusLock: 'focus-lock',
} as const;

/**
 * Get focus classes for a component
 */
export function getFocusClasses(
  component: keyof typeof componentFocus,
  className?: string
): string {
  return cn(componentFocus[component], className);
}

/**
 * ARIA attributes for better accessibility
 */
export const ariaAttributes = {
  button: {
    'aria-pressed': 'false',
    role: 'button',
    tabIndex: 0,
  },
  link: {
    role: 'link',
    tabIndex: 0,
  },
  navigation: {
    role: 'navigation',
    'aria-label': 'Main navigation',
  },
  menu: {
    role: 'menu',
    'aria-orientation': 'vertical',
  },
  menuItem: {
    role: 'menuitem',
    tabIndex: -1,
  },
  tab: {
    role: 'tab',
    'aria-selected': 'false',
    tabIndex: -1,
  },
  tabPanel: {
    role: 'tabpanel',
    tabIndex: 0,
  },
  dialog: {
    role: 'dialog',
    'aria-modal': 'true',
  },
} as const;

/**
 * Focus management utilities
 */
export const focusUtils = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    });
  },
  
  // Return focus to previous element
  returnFocus: (previousElement: HTMLElement | null) => {
    if (previousElement) {
      previousElement.focus();
    }
  },
  
  // Focus first element in container
  focusFirst: (container: HTMLElement) => {
    const firstFocusable = container.querySelector(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (firstFocusable) {
      firstFocusable.focus();
    }
  },
} as const;

/**
 * Accessibility color contrast ratios
 * WCAG AA: 4.5:1 for normal text, 3:1 for large text
 * WCAG AAA: 7:1 for normal text, 4.5:1 for large text
 */
export const contrastRequirements = {
  normalText: {
    AA: 4.5,
    AAA: 7,
  },
  largeText: {
    AA: 3,
    AAA: 4.5,
  },
} as const;

/**
 * High contrast mode support
 */
export const highContrastMode = {
  text: 'contrast-more:font-bold contrast-more:text-black dark:contrast-more:text-white',
  border: 'contrast-more:border-2 contrast-more:border-black dark:contrast-more:border-white',
  focus: 'contrast-more:ring-4 contrast-more:ring-black dark:contrast-more:ring-white',
} as const;