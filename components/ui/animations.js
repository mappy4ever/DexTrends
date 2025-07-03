import React, { useEffect, useState } from 'react';

// Hook to detect reduced motion preference
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Set up listener for changes
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    
    // Use addEventListener for better compatibility
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
};

// GPU-optimized fade-in animation
export const FadeIn = ({ children, delay = 0, duration = 300, className = '', disabled = false }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  const animationDuration = prefersReducedMotion || disabled ? '0ms' : `${duration}ms`;
  const animationDelay = prefersReducedMotion || disabled ? '0ms' : `${delay}ms`;

  return (
    <div 
      className={`${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: 'translateZ(0)', // Force GPU acceleration
        transition: `opacity ${animationDuration} ease-out ${animationDelay}`,
        willChange: isVisible ? 'auto' : 'opacity',
        WebkitBackfaceVisibility: 'hidden', // iOS optimization
        backfaceVisibility: 'hidden',
        perspective: 1000, // iOS optimization
      }}
    >
      {children}
    </div>
  );
};

// GPU-optimized slide-up animation
export const SlideUp = ({ children, delay = 0, duration = 400, distance = 20, className = '', disabled = false }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  const animationDuration = prefersReducedMotion || disabled ? '0ms' : `${duration}ms`;
  const animationDelay = prefersReducedMotion || disabled ? '0ms' : `${delay}ms`;
  const translateDistance = prefersReducedMotion || disabled ? 0 : distance;

  return (
    <div 
      className={`${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translate3d(0, ${isVisible ? 0 : translateDistance}px, 0)`,
        transition: `opacity ${animationDuration} ease-out ${animationDelay}, transform ${animationDuration} ease-out ${animationDelay}`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {children}
    </div>
  );
};

// GPU-optimized scale animation
export const Scale = ({ children, delay = 0, duration = 300, fromScale = 0.95, className = '', disabled = false }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  const animationDuration = prefersReducedMotion || disabled ? '0ms' : `${duration}ms`;
  const animationDelay = prefersReducedMotion || disabled ? '0ms' : `${delay}ms`;
  const scaleValue = prefersReducedMotion || disabled ? 1 : fromScale;

  return (
    <div 
      className={`${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `scale3d(${isVisible ? 1 : scaleValue}, ${isVisible ? 1 : scaleValue}, 1)`,
        transition: `opacity ${animationDuration} ease-out ${animationDelay}, transform ${animationDuration} ease-out ${animationDelay}`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {children}
    </div>
  );
};

// Optimized card hover effect for iOS
export const CardHover = ({ children, className = '', onClick = () => {}, disabled = false }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleTouchStart = () => {
    setIsTouched(true);
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsTouched(false);
      setIsHovered(false);
    }, 150);
  };

  const scale = isHovered && !disabled && !prefersReducedMotion ? 1.02 : 1;
  const shadow = isHovered && !disabled ? '0 10px 30px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)';

  return (
    <div 
      className={`${className}`}
      style={{
        transform: `scale3d(${scale}, ${scale}, 1)`,
        boxShadow: shadow,
        transition: prefersReducedMotion || disabled ? 'none' : 'transform 200ms ease-out, box-shadow 200ms ease-out',
        willChange: isHovered ? 'transform, box-shadow' : 'auto',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
      onMouseEnter={() => !isTouched && setIsHovered(true)}
      onMouseLeave={() => !isTouched && setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        // Prevent double-tap zoom on iOS
        e.preventDefault();
        onClick(e);
      }}
      data-card-hover="true"
    >
      {children}
    </div>
  );
};

// Optimized pulse animation
export const Pulse = ({ children, delay = 0, duration = 1500, className = '', disabled = false }) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion && !disabled;

  return (
    <div 
      className={`${shouldAnimate ? 'ios-pulse' : ''} ${className}`}
      style={{
        animationDuration: shouldAnimate ? `${duration}ms` : '0ms',
        animationDelay: shouldAnimate ? `${delay}ms` : '0ms',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {children}
    </div>
  );
};

// Optimized bounce animation
export const Bounce = ({ children, delay = 0, duration = 1000, className = '', disabled = false }) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion && !disabled;

  return (
    <div 
      className={`${shouldAnimate ? 'ios-bounce' : ''} ${className}`}
      style={{
        animationDuration: shouldAnimate ? `${duration}ms` : '0ms',
        animationDelay: shouldAnimate ? `${delay}ms` : '0ms',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {children}
    </div>
  );
};

// Optimized staggered children animation
export const StaggeredChildren = ({ children, baseDelay = 50, className = '', disabled = false }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        
        const delay = prefersReducedMotion || disabled ? 0 : baseDelay * index;
        
        return React.cloneElement(child, {
          style: {
            ...child.props.style,
            opacity: 0,
            transform: 'translate3d(0, 10px, 0)',
            animation: prefersReducedMotion || disabled 
              ? 'none' 
              : `ios-stagger-fade 300ms ease-out ${delay}ms forwards`,
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            perspective: 1000,
          }
        });
      })}
    </div>
  );
};

// Page transition wrapper
export const PageTransition = ({ children, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame for smoother transitions
    const raf = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div 
      className={`${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translate3d(0, ${isVisible ? 0 : 10}px, 0)`,
        transition: prefersReducedMotion ? 'none' : 'opacity 300ms ease-out, transform 300ms ease-out',
        willChange: isVisible ? 'auto' : 'opacity, transform',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {children}
    </div>
  );
};

// Loading spinner optimized for iOS
export const LoadingSpinner = ({ size = 40, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div 
      className={`${className}`}
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(59, 130, 246, 0.1)`,
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: prefersReducedMotion ? 'none' : 'ios-spin 1s linear infinite',
        willChange: 'transform',
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    />
  );
};

// Skeleton loader optimized for iOS
export const SkeletonLoader = ({ width = '100%', height = 20, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div 
      className={`${className}`}
      style={{
        width,
        height,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!prefersReducedMotion && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            animation: 'ios-shimmer 1.5s infinite',
            willChange: 'transform',
            transform: 'translateZ(0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        />
      )}
    </div>
  );
};