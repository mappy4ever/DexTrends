import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for smooth parallax scrolling effect using RAF
 * @param speed - Parallax speed multiplier (default: 0.5)
 * @returns Current parallax offset value
 */
export function useSmoothParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0);
  const rafId = useRef<number | null>(null);
  const targetOffset = useRef(0);
  const currentOffset = useRef(0);

  const updateOffset = useCallback(() => {
    // Lerp (linear interpolation) for smooth animation
    const lerp = 0.1; // Smoothing factor
    currentOffset.current += (targetOffset.current - currentOffset.current) * lerp;
    
    // Only update state if there's a significant change
    if (Math.abs(currentOffset.current - offset) > 0.1) {
      setOffset(currentOffset.current);
    }

    // Continue animation if not at target
    if (Math.abs(targetOffset.current - currentOffset.current) > 0.1) {
      rafId.current = requestAnimationFrame(updateOffset);
    }
  }, [offset]);

  useEffect(() => {
    const handleScroll = () => {
      targetOffset.current = window.scrollY * speed;
      
      // Start animation if not already running
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(updateOffset);
      }
    };

    // Set initial offset
    targetOffset.current = window.scrollY * speed;
    currentOffset.current = targetOffset.current;
    setOffset(targetOffset.current);

    // Add scroll listener with passive flag
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [speed, updateOffset]);

  return offset;
}