import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { SkeletonContext, SkeletonContextType } from './SkeletonLoadingSystem';

interface UseSkeletonStateReturn<T = any> {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  withSkeleton: (asyncFunction: T) => T;
}

export const useSkeleton = (): SkeletonContextType => {
  const context = useContext(SkeletonContext);
  if (!context) {
    throw new Error('useSkeleton must be used within SkeletonProvider');
  }
  return context;
};

export const useSkeletonState = <T extends (...args: unknown[]) => Promise<unknown>>(
  initialLoading = false
): UseSkeletonStateReturn<T> => {
  const [loading, setLoading] = useState(initialLoading);
  
  const withSkeleton = useCallback((asyncFunction: T): T => {
    return (async (...args: Parameters<T>) => {
      setLoading(true);
      try {
        return await asyncFunction(...args);
      } finally {
        setLoading(false);
      }
    }) as T;
  }, []);
  
  return {
    loading,
    setLoading,
    withSkeleton
  };
};
