import { useState, useRef, useCallback, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface CardTransform {
  rotateX: number;
  rotateY: number;
  scale: number;
}

interface UseCardInteractionOptions {
  maxRotation?: number;
  scaleOnHover?: number;
  resetDelay?: number;
  disabled?: boolean;
}

export const useCardInteraction = (options: UseCardInteractionOptions = {}) => {
  const {
    maxRotation = 20,
    scaleOnHover = 1.05,
    resetDelay = 100,
    disabled = false
  } = options;

  const cardRef = useRef<HTMLDivElement>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();

  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState<CardTransform>({
    rotateX: 0,
    rotateY: 0,
    scale: 1
  });

  // Calculate normalized mouse position (0-1)
  const calculateMousePosition = useCallback((e: MouseEvent | TouchEvent, rect: DOMRect): MousePosition => {
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    };
  }, []);

  // Update transform based on mouse position
  const updateTransform = useCallback((position: MousePosition, hovered: boolean) => {
    if (disabled) return;

    const rotateX = hovered ? (position.y - 0.5) * -maxRotation : 0;
    const rotateY = hovered ? (position.x - 0.5) * maxRotation : 0;
    const scale = hovered ? scaleOnHover : 1;

    setTransform({ rotateX, rotateY, scale });
  }, [disabled, maxRotation, scaleOnHover]);

  // Handle mouse/touch move
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (disabled || !cardRef.current) return;

    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const position = calculateMousePosition(e, rect);
      
      setMousePosition(position);
      updateTransform(position, true);
    });
  }, [disabled, calculateMousePosition, updateTransform]);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    
    setIsHovered(true);
    
    // Clear any pending reset
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
  }, [disabled]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    
    // Delayed reset for smoother transition
    resetTimeoutRef.current = setTimeout(() => {
      setMousePosition({ x: 0.5, y: 0.5 });
      updateTransform({ x: 0.5, y: 0.5 }, false);
    }, resetDelay);
  }, [resetDelay, updateTransform]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    handleMouseEnter();
    handleMove(e);
  }, [disabled, handleMouseEnter, handleMove]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    handleMouseLeave();
  }, [handleMouseLeave]);

  // Attach event listeners
  useEffect(() => {
    const element = cardRef.current;
    if (!element || disabled) return;

    // Mouse events
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMove as EventListener);
    
    // Touch events
    element.addEventListener('touchstart', handleTouchStart as EventListener);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchmove', handleMove as EventListener);

    return () => {
      // Cleanup event listeners
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMove as EventListener);
      element.removeEventListener('touchstart', handleTouchStart as EventListener);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleMove as EventListener);

      // Cleanup timeouts and RAF
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [disabled, handleMouseEnter, handleMouseLeave, handleMove, handleTouchStart, handleTouchEnd]);

  return {
    cardRef,
    mousePosition,
    isHovered,
    transform,
    dynamicStyles: {
      '--mouse-x': `${mousePosition.x * 100}%`,
      '--mouse-y': `${mousePosition.y * 100}%`,
      '--rotate-x': `${transform.rotateX}deg`,
      '--rotate-y': `${transform.rotateY}deg`,
      '--pointer-from-center': isHovered ? 1 : 0,
      '--card-scale': transform.scale,
    } as React.CSSProperties
  };
};