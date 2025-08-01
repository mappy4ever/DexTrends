import React, { useRef, useState, useCallback, ReactNode, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '../../utils/cn';

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  rarity?: string;
  disabled?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  className,
  rarity = '',
  disabled = false,
  intensity = 'medium'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for smooth tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  // Spring config for smooth movement
  const springConfig = { stiffness: 300, damping: 30 };
  
  // Animated values
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Transform values for 3D rotation
  const rotateX = useTransform(springY, [0, 1], [10, -10]);
  const rotateY = useTransform(springX, [0, 1], [-10, 10]);

  // Determine holographic pattern based on rarity
  const getHolographicClass = () => {
    if (disabled) return '';
    
    const rarityLower = rarity.toLowerCase();
    
    // Secret Rare: Intense rainbow with sparkles
    if (rarityLower.includes('secret') || 
        rarityLower.includes('rainbow') ||
        rarityLower.includes('rare secret')) {
      return 'holographic-secret';
    }
    
    // Hyper Rare: Rainbow prismatic effect
    if (rarityLower.includes('hyper') || 
        rarityLower.includes('special illustration') ||
        rarityLower.includes('trainer gallery')) {
      return 'holographic-hyper';
    }
    
    // Ultra Rare: Purple/blue gradient sweep
    if (rarityLower.includes('ultra') || 
        rarityLower.includes('illustration rare') ||
        rarityLower.includes('full art') ||
        rarityLower.includes('vmax') ||
        rarityLower.includes('vstar') ||
        rarityLower.includes(' gx') ||
        rarityLower.includes(' ex')) {
      return 'holographic-ultra';
    }
    
    // Rare: Golden glow with shimmer
    if (rarityLower.includes('rare') ||
        rarityLower.includes('holo') ||
        rarityLower.includes(' v') ||
        rarityLower.includes('prism')) {
      return 'holographic-rare';
    }
    
    // Base/Common: Subtle white shine
    return 'holographic-base';
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    mouseX.set(x);
    mouseY.set(y);
  }, [disabled, mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  // Update CSS variables when mouse position changes
  useEffect(() => {
    if (!cardRef.current) return;
    
    const unsubscribeX = springX.onChange(value => {
      cardRef.current?.style.setProperty('--mouse-x', `${value * 100}%`);
    });
    
    const unsubscribeY = springY.onChange(value => {
      cardRef.current?.style.setProperty('--mouse-y', `${value * 100}%`);
    });
    
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [springX, springY]);

  return (
    <div className="holographic-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <motion.div
        ref={cardRef}
        className={cn(
          'holographic-card-container',
          getHolographicClass(),
          `intensity-${intensity}`,
          {
            'holographic-active': isHovered,
            'holographic-disabled': disabled,
          },
          className
        )}
        style={{
          '--pointer-from-center': isHovered ? 1 : 0,
          '--card-scale': isHovered ? 1.05 : 1,
        } as React.CSSProperties}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      >
        <div className="holographic-card">
          <div className="holographic-shine" />
          <div className="holographic-glare" />
          <div className="holographic-grain" />
          <div className="holographic-sparkle" />
          <div className="holographic-content">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HolographicCard;