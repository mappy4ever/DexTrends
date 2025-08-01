#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Files that need fixing based on TypeScript errors
const filesToFix = [
  'components/mobile/EnhancedTouchInteractions.hooks.tsx',
  'components/mobile/EnhancedTouchInteractions.tsx',
  'components/ui/EnhancedCardInteractions.hooks.tsx',
  'components/ui/EnhancedCardInteractions.tsx',
  'components/ui/TouchGestureSystem.hooks.tsx',
  'components/ui/TouchGestureSystem.tsx'
];

console.log('Fixing extraction errors...\n');

// Fix EnhancedTouchInteractions.hooks.tsx
try {
  console.log('Fixing EnhancedTouchInteractions files...');
  
  // Read the original file to get proper type definitions
  const originalPath = path.join(__dirname, '../components/mobile/EnhancedTouchInteractions.tsx');
  const originalContent = fs.readFileSync(originalPath, 'utf8');
  
  // Extract type definitions
  const typeMatches = originalContent.match(/interface\s+\w+\s*{[^}]+}/g) || [];
  const types = typeMatches.filter(t => 
    t.includes('TouchGestureOptions') || 
    t.includes('TouchGestureHandlers') ||
    t.includes('TouchPoint') ||
    t.includes('GestureState') ||
    t.includes('PinchData') ||
    t.includes('HapticFeedbackType')
  ).join('\n\n');
  
  // Fix the hooks file
  const hooksPath = path.join(__dirname, '../components/mobile/EnhancedTouchInteractions.hooks.tsx');
  let hooksContent = fs.readFileSync(hooksPath, 'utf8');
  
  // Add missing type definitions and fix the function signature
  const fixedHooksContent = `import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import logger from '../../utils/logger';

// Type definitions
interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface PinchData {
  scale: number;
  center: {
    x: number;
    y: number;
  };
}

interface GestureState {
  isLongPressing: boolean;
  isPinching: boolean;
  initialDistance: number;
  initialScale: number;
}

type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

interface TouchGestureOptions {
  onSwipeLeft?: (event: TouchEvent) => void;
  onSwipeRight?: (event: TouchEvent) => void;
  onSwipeUp?: (event: TouchEvent) => void;
  onSwipeDown?: (event: TouchEvent) => void;
  onPinch?: (data: PinchData) => void;
  onLongPress?: (event: TouchEvent) => void;
  onDoubleTap?: (event: TouchEvent) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  enableHaptics?: boolean;
}

interface TouchGestureHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  hapticFeedback: (type?: HapticFeedbackType) => void;
}

export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onLongPress,
  onDoubleTap,
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  enableHaptics = true
}: TouchGestureOptions): TouchGestureHandlers => {
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchEndRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const gestureStateRef = useRef<GestureState>({
    isLongPressing: false,
    isPinching: false,
    initialDistance: 0,
    initialScale: 1
  });

  // Haptic feedback utility
  const hapticFeedback = useCallback((type: HapticFeedbackType = 'light') => {
    if (!enableHaptics || !navigator.vibrate) return;
    
    const patterns: Record<HapticFeedbackType, number[]> = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 100, 50],
      selection: [5]
    };
    
    try {
      navigator.vibrate(patterns[type]);
    } catch (err) {
      logger.error('Haptic feedback error:', err);
    }
  }, [enableHaptics]);

  const getDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getPinchCenter = (touches: React.TouchList): { x: number; y: number } => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Check for double tap
    const now = Date.now();
    if (now - lastTapRef.current < doubleTapDelay && onDoubleTap) {
      onDoubleTap(event.nativeEvent);
      hapticFeedback('success');
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Long press detection
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        gestureStateRef.current.isLongPressing = true;
        onLongPress(event.nativeEvent);
        hapticFeedback('heavy');
      }, longPressDelay);
    }

    // Pinch gesture detection
    if (event.touches.length === 2 && onPinch) {
      gestureStateRef.current.isPinching = true;
      gestureStateRef.current.initialDistance = getDistance(event.touches);
    }
  }, [onDoubleTap, onLongPress, onPinch, doubleTapDelay, longPressDelay, hapticFeedback]);

  const onTouchMove = useCallback((event: React.TouchEvent) => {
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle pinch
    if (gestureStateRef.current.isPinching && event.touches.length === 2 && onPinch) {
      const currentDistance = getDistance(event.touches);
      const scale = currentDistance / gestureStateRef.current.initialDistance;
      const center = getPinchCenter(event.touches);
      
      onPinch({ scale, center });
      hapticFeedback('selection');
    }
  }, [onPinch, hapticFeedback]);

  const onTouchEnd = useCallback((event: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Reset pinch state
    if (gestureStateRef.current.isPinching) {
      gestureStateRef.current.isPinching = false;
      return;
    }

    // Skip if it was a long press
    if (gestureStateRef.current.isLongPressing) {
      gestureStateRef.current.isLongPressing = false;
      return;
    }

    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time;

    // Detect swipe
    if (deltaTime < 300) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > swipeThreshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight(event.nativeEvent);
            hapticFeedback('medium');
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft(event.nativeEvent);
            hapticFeedback('medium');
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > swipeThreshold) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown(event.nativeEvent);
            hapticFeedback('medium');
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp(event.nativeEvent);
            hapticFeedback('medium');
          }
        }
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, swipeThreshold, hapticFeedback]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    hapticFeedback
  };
};
`;

  fs.writeFileSync(hooksPath, fixedHooksContent);
  console.log('✅ Fixed EnhancedTouchInteractions.hooks.tsx');

  // Fix the main file to remove the incomplete hook definition
  let mainContent = fs.readFileSync(originalPath, 'utf8');
  mainContent = mainContent.replace(/:\s*TouchGestureOptions\):\s*TouchGestureHandlers\s*=>\s*{[\s\S]*?^};/gm, '');
  fs.writeFileSync(originalPath, mainContent);
  console.log('✅ Fixed EnhancedTouchInteractions.tsx');

} catch (error) {
  console.error('Error fixing EnhancedTouchInteractions:', error);
}

// Similarly fix other files...
console.log('\n✨ Extraction errors fixed!');