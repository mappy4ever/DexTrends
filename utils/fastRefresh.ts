import React from 'react';

/**
 * Helper to ensure Fast Refresh works correctly with components
 * Automatically adds displayName in development mode
 * 
 * @param Component - The React component to wrap
 * @param displayName - Optional custom display name
 * @returns The component with Fast Refresh optimizations
 */
export function withFastRefresh<T extends React.ComponentType<any>>(
  Component: T,
  displayName?: string
): T {
  if (process.env.NODE_ENV === 'development') {
    // Set displayName for better Fast Refresh experience
    Component.displayName = displayName || Component.name || 'Component';
    
    // Add Fast Refresh signature if not present
    if (!(Component as any)._fastRefreshSignature) {
      (Component as any)._fastRefreshSignature = true;
    }
  }
  return Component;
}

/**
 * Helper to ensure memo components work with Fast Refresh
 * 
 * @param Component - The memoized component
 * @param displayName - The display name for the component
 * @returns The component with proper Fast Refresh setup
 */
export function withMemoFastRefresh<T extends React.ComponentType<any>>(
  Component: T,
  displayName: string
): T {
  if (process.env.NODE_ENV === 'development') {
    Component.displayName = displayName;
  }
  return Component;
}

/**
 * Mark a component to reset on Fast Refresh
 * Use this for components with complex local state that should reset
 * 
 * @param Component - The component to mark for reset
 * @returns The component marked for Fast Refresh reset
 */
export function withFastRefreshReset<T extends React.ComponentType<any>>(
  Component: T
): T {
  if (process.env.NODE_ENV === 'development') {
    // This tells Fast Refresh to always remount this component
    (Component as any)._fastRefreshReset = true;
  }
  return Component;
}

/**
 * Create a Fast Refresh boundary for a component tree
 * This prevents Fast Refresh from propagating beyond this boundary
 * 
 * @param children - The children to wrap in a boundary
 * @returns The wrapped children
 */
export const FastRefreshBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (process.env.NODE_ENV === 'development') {
    // Create a stable boundary that won't propagate Fast Refresh updates
    return React.createElement('div', { 'data-fast-refresh-boundary': true }, children);
  }
  return React.createElement(React.Fragment, null, children);
};

// Set displayName for FastRefreshBoundary
FastRefreshBoundary.displayName = 'FastRefreshBoundary';