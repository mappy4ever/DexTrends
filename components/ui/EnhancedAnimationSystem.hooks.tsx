import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useReducedMotion, 
  useAnimation, 
  useInView, 
  useSpring, 
  useTransform,
  useScroll,
  Transition,
  Variants,
  MotionValue
} from 'framer-motion';
import { AnimationContext } from './EnhancedAnimationSystem';

export const useEnhancedAnimation = () => useContext(AnimationContext);
