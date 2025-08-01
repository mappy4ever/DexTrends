import React, { useState, useRef, useEffect, useCallback, memo, CSSProperties, KeyboardEvent, MouseEvent, TouchEvent, FocusEvent, ReactNode, MutableRefObject } from 'react';
import { useFavorites } from '../../context/UnifiedAppContext';
import logger from '../../utils/logger';
import type { TCGCard } from '../../types/api/cards';

interface InteractionState {
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isDragging: boolean;
  touchStarted: boolean;
  lastInteraction: 'hover' | 'press' | 'touch' | 'focus' | null;
}

interface AnimationState {
  scale: number;
  rotate: number;
  translateX: number;
  translateY: number;
  brightness: number;
}

interface UseCardInteractionsProps {
  card: TCGCard | null;
  onCardClick?: (card: TCGCard) => void;
  enableAdvancedInteractions?: boolean;
}

interface EventHandlers {
  ref: MutableRefObject<HTMLDivElement | null>;
  onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  tabIndex: number;
  'aria-pressed': boolean;
  'aria-expanded': boolean;
}

/**
 * Enhanced Card Interactions Component
 * Provides advanced interaction patterns for card components
 */
export const useCardInteractions = ({ 
  card, 
  onCardClick, 
  enableAdvancedInteractions = true 
}: UseCardInteractionsProps) => {
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isHovered: false,
    isPressed: false,
    isFocused: false,
    isDragging: false,
    touchStarted: false,
    lastInteraction: null
  });
  
  const [animation, setAnimation] = useState<AnimationState>({
    scale: 1,
    rotate: 0,
    translateX: 0,
    translateY: 0,
    brightness: 1
  });

  const cardRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  // Enhanced hover effect with 3D tilt
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!enableAdvancedInteractions || !cardRef.current || !interactionState.isHovered) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation based on mouse position
    const rotateX = (mouseY / rect.height) * -10; // Max 10 degrees
    const rotateY = (mouseX / rect.width) * 10;   // Max 10 degrees
    
    // Smooth animation with easing
    setAnimation(prev => ({
      ...prev,
      rotate: rotateY,
      translateY: rotateX * -2,
      scale: 1.05,
      brightness: 1.1
    }));
  }, [enableAdvancedInteractions, interactionState.isHovered]);

  // Enhanced mouse enter
  const handleMouseEnter = useCallback(() => {
    setInteractionState(prev => ({ 
      ...prev, 
      isHovered: true, 
      lastInteraction: 'hover' 
    }));
    
    if (enableAdvancedInteractions) {
      setAnimation(prev => ({
        ...prev,
        scale: 1.03,
        brightness: 1.05
      }));
    }
    
    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, [enableAdvancedInteractions]);

  // Enhanced mouse leave
  const handleMouseLeave = useCallback(() => {
    setInteractionState(prev => ({ 
      ...prev, 
      isHovered: false,
      isPressed: false
    }));
    
    // Reset animations
    setAnimation({
      scale: 1,
      rotate: 0,
      translateX: 0,
      translateY: 0,
      brightness: 1
    });
  }, []);

  // Enhanced mouse down/up for press effects
  const handleMouseDown = useCallback(() => {
    setInteractionState(prev => ({ 
      ...prev, 
      isPressed: true,
      lastInteraction: 'press'
    }));
    
    if (enableAdvancedInteractions) {
      setAnimation(prev => ({
        ...prev,
        scale: 0.98,
        brightness: 0.95
      }));
    }
  }, [enableAdvancedInteractions]);

  const handleMouseUp = useCallback(() => {
    setInteractionState(prev => ({ 
      ...prev, 
      isPressed: false 
    }));
    
    if (enableAdvancedInteractions && interactionState.isHovered) {
      setAnimation(prev => ({
        ...prev,
        scale: 1.05,
        brightness: 1.1
      }));
    }
  }, [enableAdvancedInteractions, interactionState.isHovered]);

  // Enhanced touch interactions
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    setInteractionState(prev => ({ 
      ...prev, 
      touchStarted: true,
      isPressed: true,
      lastInteraction: 'touch'
    }));
    
    // Stronger haptic feedback for touch
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
    
    if (enableAdvancedInteractions) {
      setAnimation(prev => ({
        ...prev,
        scale: 0.95
      }));
    }
  }, [enableAdvancedInteractions]);

  const handleTouchEnd = useCallback(() => {
    setInteractionState(prev => ({ 
      ...prev, 
      touchStarted: false,
      isPressed: false
    }));
    
    // Spring back animation
    if (enableAdvancedInteractions) {
      setAnimation(prev => ({
        ...prev,
        scale: 1.02
      }));
      
      // Reset after short delay
      timeoutRef.current = setTimeout(() => {
        setAnimation(prev => ({
          ...prev,
          scale: 1
        }));
      }, 150);
    }
  }, [enableAdvancedInteractions]);

  // Enhanced focus management
  const handleFocus = useCallback(() => {
    setInteractionState(prev => ({ 
      ...prev, 
      isFocused: true,
      lastInteraction: 'focus'
    }));
    
    if (enableAdvancedInteractions) {
      setAnimation(prev => ({
        ...prev,
        scale: 1.02,
        brightness: 1.05
      }));
    }
  }, [enableAdvancedInteractions]);

  const handleBlur = useCallback(() => {
    setInteractionState(prev => ({ 
      ...prev, 
      isFocused: false 
    }));
    
    // Only reset if not hovered
    if (!interactionState.isHovered) {
      setAnimation({
        scale: 1,
        rotate: 0,
        translateX: 0,
        translateY: 0,
        brightness: 1
      });
    }
  }, [interactionState.isHovered]);

  // Double-tap/click detection
  const lastTapRef = useRef<number>(0);
  const handleDoubleInteraction = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap detected - toggle favorite
      if (card) {
        const isCurrentlyFavorite = favorites.cards.some(c => c.id === card.id);
        if (isCurrentlyFavorite) {
          removeFromFavorites('cards', card.id);
        } else {
          addToFavorites('cards', card);
        }
        
        // Special animation for favorite action
        setAnimation(prev => ({
          ...prev,
          scale: 1.15,
          brightness: 1.3
        }));
        
        setTimeout(() => {
          setAnimation(prev => ({
            ...prev,
            scale: 1.05,
            brightness: 1.1
          }));
        }, 200);
        
        // Enhanced haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([25, 50, 25, 50, 25]);
        }
        
        logger.debug('Card favorited via double interaction', { cardId: card.id });
      }
    } else if (onCardClick && card) {
      // Single click - trigger card click
      onCardClick(card);
    }
    
    lastTapRef.current = now;
  }, [card, favorites, addToFavorites, removeFromFavorites, onCardClick]);

  // Keyboard interactions
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleDoubleInteraction();
        break;
      case 'f':
      case 'F':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (card) {
            const isCurrentlyFavorite = favorites.cards.some(c => c.id === card.id);
            if (isCurrentlyFavorite) {
              removeFromFavorites('cards', card.id);
            } else {
              addToFavorites('cards', card);
            }
          }
        }
        break;
    }
  }, [card, handleDoubleInteraction, favorites, addToFavorites, removeFromFavorites]);

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Dynamic shadow based on interaction state
  const getCardShadow = useCallback(() => {
    if (interactionState.isPressed) {
      return '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    if (interactionState.isHovered || interactionState.isFocused) {
      return '0 10px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.1)';
    }
    return '0 4px 12px rgba(0, 0, 0, 0.08)';
  }, [interactionState]);

  // Generate dynamic styles based on animation state
  const getCardStyles = useCallback((): CSSProperties => {
    const isFavorite = card && favorites.cards.some(c => c.id === card.id);
    
    return {
      transform: `
        scale(${animation.scale})
        rotateX(${animation.rotate * 0.5}deg)
        rotateY(${animation.rotate}deg)
        translateX(${animation.translateX}px)
        translateY(${animation.translateY}px)
      `,
      filter: `brightness(${animation.brightness})`,
      transition: interactionState.isPressed 
        ? 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)' 
        : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease',
      transformOrigin: 'center center',
      willChange: 'transform, filter',
      boxShadow: getCardShadow(),
      ...(isFavorite && {
        borderColor: '#ef4444',
        borderWidth: '2px'
      })
    };
  }, [animation, interactionState, card, favorites, getCardShadow]);

  // Interaction event handlers
  const eventHandlers: EventHandlers = {
    ref: cardRef,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onClick: handleDoubleInteraction,
    onKeyDown: handleKeyDown,
    tabIndex: 0,
    'aria-pressed': interactionState.isPressed,
    'aria-expanded': interactionState.isHovered
  };

  return {
    cardStyles: getCardStyles(),
    eventHandlers,
    interactionState,
    animation
  };
};

interface InteractiveCardProps {
  children: ReactNode;
  card: TCGCard | null;
  onCardClick?: (card: TCGCard) => void;
  className?: string;
  enableAdvancedInteractions?: boolean;
  [key: string]: any;
}

/**
 * Card Interaction Wrapper Component
 */
export const InteractiveCard = memo<InteractiveCardProps>(({ 
  children, 
  card, 
  onCardClick, 
  className = '',
  enableAdvancedInteractions = true,
  ...props 
}) => {
  const { cardStyles, eventHandlers } = useCardInteractions({
    card,
    onCardClick,
    enableAdvancedInteractions
  });

  return (
    <div
      className={`card-interactive ${className}`}
      style={cardStyles}
      {...eventHandlers}
      {...props}
    >
      {children}
      
      <style jsx>{`
        .card-interactive {
          cursor: pointer;
          perspective: 1000px;
          transform-style: preserve-3d;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        
        .card-interactive:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .card-interactive:focus:not(:focus-visible) {
          outline: none;
        }
        
        .card-interactive:active {
          transform-origin: center center;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .card-interactive {
            transition: none !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.card?.id === nextProps.card?.id &&
    prevProps.className === nextProps.className &&
    prevProps.enableAdvancedInteractions === nextProps.enableAdvancedInteractions &&
    prevProps.onCardClick === nextProps.onCardClick &&
    React.isValidElement(prevProps.children) && 
    React.isValidElement(nextProps.children) &&
    prevProps.children.key === nextProps.children.key
  );
});

InteractiveCard.displayName = 'InteractiveCard';

interface CardInteractionIndicatorProps {
  interactionState: InteractionState;
  className?: string;
}

/**
 * Card Interaction Indicator
 * Shows visual feedback for interaction states
 */
export const CardInteractionIndicator = memo<CardInteractionIndicatorProps>(({ 
  interactionState, 
  className = '' 
}) => {
  if (!interactionState.lastInteraction) return null;

  return (
    <div className={`interaction-indicator ${className}`}>
      <div className={`indicator-dot ${interactionState.lastInteraction}`} />
      
      <style jsx>{`
        .interaction-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
          pointer-events: none;
        }
        
        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          opacity: 0;
          animation: indicator-pulse 0.6s ease-out;
        }
        
        .indicator-dot.hover {
          background-color: #3b82f6;
        }
        
        .indicator-dot.press {
          background-color: #ef4444;
        }
        
        .indicator-dot.touch {
          background-color: #10b981;
        }
        
        .indicator-dot.focus {
          background-color: #8b5cf6;
        }
        
        @keyframes indicator-pulse {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.interactionState?.lastInteraction === nextProps.interactionState?.lastInteraction &&
    prevProps.className === nextProps.className
  );
});

CardInteractionIndicator.displayName = 'CardInteractionIndicator';

export default { useCardInteractions, InteractiveCard, CardInteractionIndicator };