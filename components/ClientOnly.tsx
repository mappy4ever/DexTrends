import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Simple client-only wrapper component that prevents SSR rendering
 * Used to avoid hydration mismatches for client-only content
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps): ReactNode {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}