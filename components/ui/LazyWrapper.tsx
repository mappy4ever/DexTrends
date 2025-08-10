import React, { Suspense } from 'react';
import { Skeleton } from './SkeletonLoadingSystem';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  height?: number;
  width?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'dashboard';
}

const getDefaultFallback = (variant: string, height: number, width: string) => {
  switch (variant) {
    case 'dashboard':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton variant="rectangular" width="100%" height={120} animation="wave" />
            <Skeleton variant="rectangular" width="100%" height={120} animation="wave" />
            <Skeleton variant="rectangular" width="100%" height={120} animation="wave" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton variant="rectangular" width="100%" height={height} animation="wave" />
            <Skeleton variant="rectangular" width="100%" height={height} animation="wave" />
          </div>
        </div>
      );
    case 'circular':
      return <Skeleton variant="circular" width={height} height={height} animation="wave" />;
    case 'text':
      return <Skeleton variant="text" width={width} height={height} animation="wave" />;
    default:
      return <Skeleton variant="rectangular" width={width} height={height} animation="wave" />;
  }
};

/**
 * LazyWrapper provides a simple way to wrap any component with Suspense and a loading state
 * 
 * @example
 * <LazyWrapper variant="dashboard" height={300}>
 *   <HeavyComponent />
 * </LazyWrapper>
 */
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  height = 200,
  width = "100%",
  variant = 'rectangular'
}) => {
  const defaultFallback = fallback || getDefaultFallback(variant, height, width);

  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
};

/**
 * Higher-order component to add lazy loading to any component
 */
export const withSuspense = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
  variant: LazyWrapperProps['variant'] = 'rectangular',
  height = 200
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <LazyWrapper fallback={fallback} variant={variant} height={height}>
      <Component {...props} ref={ref} />
    </LazyWrapper>
  ));
};

export default LazyWrapper;