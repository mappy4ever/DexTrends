import { useRef, useState, useCallback } from 'react';
import { useMotionValue, useTransform, useSpring, MotionValue } from 'framer-motion';
import logger from '@/utils/logger';

interface Use3DTiltCardOptions {
  maxRotation?: number;
  enableHolo?: boolean;
  rarity?: string;
  springConfig?: {
    stiffness?: number;
    damping?: number;
  };
}

interface Use3DTiltCardReturn {
  // Refs
  cardRef: React.RefObject<HTMLDivElement | null>;
  
  // State
  isHovered: boolean;
  
  // Motion values
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  scale: MotionValue<number>;
  
  // Holographic values
  holoX: MotionValue<number>;
  holoY: MotionValue<number>;
  holoOpacity: MotionValue<number>;
  shimmerX: MotionValue<number>;
  
  // Event handlers
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  
  // Computed values
  shouldShowHolo: boolean;
  holoIntensity: number;
  particleCount: number;
}

// Rarity configuration for effects
const RARITY_CONFIG = {
  'Common': { holoIntensity: 0, particles: 0, maxRotation: 10 },
  'Uncommon': { holoIntensity: 0.2, particles: 0, maxRotation: 12 },
  'Rare': { holoIntensity: 0.4, particles: 0, maxRotation: 15 },
  'Rare Holo': { holoIntensity: 0.6, particles: 3, maxRotation: 15 },
  'Rare Ultra': { holoIntensity: 0.8, particles: 5, maxRotation: 18 },
  'Rare Secret': { holoIntensity: 1, particles: 8, maxRotation: 20 },
  'Illustration Rare': { holoIntensity: 0.7, particles: 4, maxRotation: 15 },
  'Special Illustration Rare': { holoIntensity: 0.9, particles: 6, maxRotation: 18 },
  'Hyper Rare': { holoIntensity: 1, particles: 10, maxRotation: 20 },
};

export function use3DTiltCard(options: Use3DTiltCardOptions = {}): Use3DTiltCardReturn {
  const {
    maxRotation = 15,
    enableHolo = true,
    rarity = 'Common',
    springConfig = { stiffness: 300, damping: 30 }
  } = options;
  
  // Get rarity configuration
  const rarityConfig = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.Common;
  const effectiveMaxRotation = maxRotation || rarityConfig.maxRotation;
  
  // Refs and state
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform mouse position to rotation
  const rotateX = useTransform(mouseY, [-100, 100], [effectiveMaxRotation, -effectiveMaxRotation]);
  const rotateY = useTransform(mouseX, [-100, 100], [-effectiveMaxRotation, effectiveMaxRotation]);
  
  // Spring animations for smooth movement
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  
  // Scale animation
  const scale = useMotionValue(1);
  const scaleSpring = useSpring(scale, springConfig);
  
  // Holographic effect values tied to tilt
  const holoX = useTransform(rotateY, [-effectiveMaxRotation, effectiveMaxRotation], [0, 100]);
  const holoY = useTransform(rotateX, [-effectiveMaxRotation, effectiveMaxRotation], [100, 0]);
  const holoOpacity = useTransform(
    [rotateX, rotateY],
    ([x, y]) => {
      const distance = Math.sqrt((x as number) * (x as number) + (y as number) * (y as number));
      return Math.min(distance / effectiveMaxRotation, 1) * rarityConfig.holoIntensity;
    }
  );
  
  // Shimmer effect that moves opposite to tilt for realism
  const shimmerX = useTransform(rotateY, [-effectiveMaxRotation, effectiveMaxRotation], [100, -100]);
  
  // Event handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    // Convert to percentage (-100 to 100)
    const xPct = (mouseXPos / width - 0.5) * 200;
    const yPct = (mouseYPos / height - 0.5) * 200;
    
    mouseX.set(xPct);
    mouseY.set(yPct);
    
    logger.debug('3D Tilt mouse move', { 
      xPct, 
      yPct, 
      rarity, 
      holoIntensity: rarityConfig.holoIntensity 
    });
  }, [mouseX, mouseY, rarity, rarityConfig.holoIntensity]);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    scale.set(1.05);
    logger.debug('3D Tilt mouse enter', { rarity });
  }, [scale, rarity]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
    logger.debug('3D Tilt mouse leave', { rarity });
  }, [mouseX, mouseY, scale, rarity]);
  
  return {
    // Refs
    cardRef,
    
    // State
    isHovered,
    
    // Motion values - use the spring versions for smooth animation
    rotateX: rotateXSpring,
    rotateY: rotateYSpring,
    scale: scaleSpring,
    
    // Holographic values
    holoX,
    holoY,
    holoOpacity,
    shimmerX,
    
    // Event handlers
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    
    // Computed values
    shouldShowHolo: enableHolo && rarityConfig.holoIntensity > 0,
    holoIntensity: rarityConfig.holoIntensity,
    particleCount: rarityConfig.particles,
  };
}

// Helper function to determine if a card should have holographic effects
export function shouldHaveHolographicEffect(rarity: string | undefined): boolean {
  if (!rarity) return false;
  const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
  return config ? config.holoIntensity > 0 : false;
}

// Helper function to get holographic gradient based on rarity
export function getHolographicGradient(rarity: string): string {
  const rarityLower = rarity.toLowerCase();
  
  if (rarityLower.includes('secret') || rarityLower.includes('rainbow')) {
    return 'from-pink-400/60 via-purple-400/60 to-indigo-400/60';
  }
  if (rarityLower.includes('ultra') || rarityLower.includes('hyper')) {
    return 'from-yellow-400/50 via-red-400/50 to-purple-400/50';
  }
  if (rarityLower.includes('illustration')) {
    return 'from-amber-400/40 via-orange-400/40 to-red-400/40';
  }
  if (rarityLower.includes('holo')) {
    return 'from-blue-400/30 via-cyan-400/30 to-teal-400/30';
  }
  return 'from-gray-300/20 via-gray-400/20 to-gray-500/20';
}