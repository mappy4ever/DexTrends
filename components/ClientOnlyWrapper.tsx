import React, { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that ensures children are only rendered on the client side
 * This prevents hydration mismatches for components that use browser-only APIs
 */
export default function ClientOnlyWrapper({ children, fallback = null }: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Return fallback during SSR and initial client render
  if (!hasMounted) {
    return <>{fallback}</>;
  }

  // Return children only after hydration is complete
  return <>{children}</>;
}