import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to track scroll visibility based on threshold
 * @param threshold - Scroll distance in pixels to trigger visibility
 * @returns boolean indicating if scrolled past threshold
 */
export function useScrollVisibility(threshold = 300) {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  
  const updateVisibility = useCallback(() => {
    const scrollY = window.scrollY;
    const shouldShow = scrollY > threshold;
    
    // Only update state if visibility actually changes
    setIsVisible(prevVisible => {
      if (prevVisible !== shouldShow) {
        return shouldShow;
      }
      return prevVisible;
    });
    
    lastScrollY.current = scrollY;
    ticking.current = false;
  }, [threshold]);
  
  useEffect(() => {
    const handleScroll = () => {
      lastScrollY.current = window.scrollY;
      
      // Use requestAnimationFrame for throttling
      if (!ticking.current) {
        window.requestAnimationFrame(updateVisibility);
        ticking.current = true;
      }
    };
    
    // Check initial scroll position
    updateVisibility();
    
    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateVisibility]);
  
  return isVisible;
}