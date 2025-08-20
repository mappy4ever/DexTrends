import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface EnhancedRarityBadgeProps {
  rarity: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  glowing?: boolean;
  className?: string;
}

export const EnhancedRarityBadge: React.FC<EnhancedRarityBadgeProps> = ({
  rarity,
  size = 'sm',
  showLabel = true,
  animated = true,
  glowing = false,
  className
}) => {
  // Get rarity display properties
  const getRarityProperties = (rarityStr: string) => {
    const lower = rarityStr.toLowerCase();
    
    // Special Premium Rarities
    if (lower.includes('gold star') || lower.includes('gold')) {
      return {
        icon: 'GS',
        label: 'Gold Star',
        gradient: 'from-yellow-300 via-amber-400 to-yellow-500',
        textColor: 'text-yellow-900',
        glow: '0 0 20px rgba(251, 191, 36, 0.6)',
        sparkle: true,
        pulse: true
      };
    }
    
    if (lower.includes('silver star') || lower.includes('silver')) {
      return {
        icon: 'SS',
        label: 'Silver Star',
        gradient: 'from-gray-300 via-gray-400 to-gray-500',
        textColor: 'text-gray-900',
        glow: '0 0 18px rgba(156, 163, 175, 0.6)',
        sparkle: true,
        pulse: false
      };
    }
    
    if (lower.includes('diamond') || lower.includes('crystal')) {
      return {
        icon: 'D',
        label: 'Diamond',
        gradient: 'from-cyan-200 via-blue-300 to-cyan-400',
        textColor: 'text-cyan-900',
        glow: '0 0 25px rgba(34, 211, 238, 0.7)',
        sparkle: true,
        pulse: true
      };
    }
    
    // Secret Rare
    if (lower.includes('secret')) {
      return {
        icon: 'SR',
        label: rarityStr,
        gradient: 'from-purple-400 via-pink-400 to-purple-500',
        textColor: 'text-purple-900',
        glow: '0 0 15px rgba(168, 85, 247, 0.5)',
        sparkle: true,
        pulse: false
      };
    }
    
    // Rainbow Rare
    if (lower.includes('rainbow')) {
      return {
        icon: 'RR',
        label: rarityStr,
        gradient: 'from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400',
        textColor: 'text-gray-900',
        glow: '0 0 20px rgba(168, 85, 247, 0.6)',
        sparkle: true,
        pulse: true
      };
    }
    
    // Ultra Rare
    if (lower.includes('ultra')) {
      return {
        icon: 'UR',
        label: rarityStr,
        gradient: 'from-purple-300 to-pink-300',
        textColor: 'text-purple-800',
        glow: '0 0 12px rgba(196, 181, 253, 0.4)',
        sparkle: false,
        pulse: false
      };
    }
    
    // VMAX
    if (lower.includes('vmax')) {
      return {
        icon: 'VM',
        label: rarityStr,
        gradient: 'from-red-400 via-orange-400 to-red-500',
        textColor: 'text-red-900',
        glow: '0 0 12px rgba(239, 68, 68, 0.4)',
        sparkle: false,
        pulse: false
      };
    }
    
    // VSTAR
    if (lower.includes('vstar')) {
      return {
        icon: 'VS',
        label: rarityStr,
        gradient: 'from-yellow-300 via-yellow-400 to-orange-400',
        textColor: 'text-yellow-900',
        glow: '0 0 12px rgba(234, 179, 8, 0.4)',
        sparkle: true,
        pulse: false
      };
    }
    
    // V Cards
    if (lower.includes(' v') || lower.endsWith(' v')) {
      return {
        icon: 'V',
        label: rarityStr,
        gradient: 'from-blue-400 to-indigo-500',
        textColor: 'text-blue-900',
        glow: '0 0 10px rgba(59, 130, 246, 0.4)',
        sparkle: false,
        pulse: false
      };
    }
    
    // GX
    if (lower.includes('gx')) {
      return {
        icon: 'GX',
        label: rarityStr,
        gradient: 'from-blue-500 to-purple-500',
        textColor: 'text-blue-900',
        glow: '0 0 10px rgba(37, 99, 235, 0.4)',
        sparkle: false,
        pulse: false
      };
    }
    
    // EX
    if (lower.includes('ex')) {
      return {
        icon: 'EX',
        label: rarityStr,
        gradient: 'from-green-400 to-emerald-500',
        textColor: 'text-green-900',
        glow: '0 0 10px rgba(34, 197, 94, 0.4)',
        sparkle: false,
        pulse: false
      };
    }
    
    // Holo Rare
    if (lower.includes('holo')) {
      return {
        icon: 'H',
        label: rarityStr,
        gradient: 'from-blue-300 via-purple-300 to-pink-300',
        textColor: 'text-purple-800',
        glow: '0 0 8px rgba(129, 140, 248, 0.3)',
        sparkle: false,
        pulse: false
      };
    }
    
    // Rare
    if (lower.includes('rare')) {
      return {
        icon: 'R',
        label: rarityStr,
        gradient: 'from-blue-200 to-blue-300',
        textColor: 'text-blue-800',
        glow: undefined,
        sparkle: false,
        pulse: false
      };
    }
    
    // Uncommon
    if (lower.includes('uncommon')) {
      return {
        icon: 'U',
        label: rarityStr,
        gradient: 'from-green-200 to-green-300',
        textColor: 'text-green-800',
        glow: undefined,
        sparkle: false,
        pulse: false
      };
    }
    
    // Common
    if (lower.includes('common')) {
      return {
        icon: 'C',
        label: rarityStr,
        gradient: 'from-gray-200 to-gray-300',
        textColor: 'text-gray-700',
        glow: undefined,
        sparkle: false,
        pulse: false
      };
    }
    
    // Default
    return {
      icon: '?',
      label: rarityStr,
      gradient: 'from-gray-100 to-gray-200',
      textColor: 'text-gray-600',
      glow: undefined,
      sparkle: false,
      pulse: false
    };
  };

  const properties = getRarityProperties(rarity);
  
  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'text-xs font-bold',
      label: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'text-sm font-bold',
      label: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'text-base font-bold',
      label: 'text-base'
    }
  };

  const sizeConfig = sizeClasses[size];
  
  const badge = (
    <div
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full',
        'bg-gradient-to-r backdrop-blur-md',
        'border border-white/40 dark:border-white/20',
        'shadow-lg',
        sizeConfig.container,
        properties.gradient,
        className
      )}
      style={{
        boxShadow: glowing && properties.glow ? properties.glow : undefined
      }}
    >
      {/* Icon */}
      <span className={cn(
        'relative',
        sizeConfig.icon,
        'text-white drop-shadow-lg'
      )}>
        {properties.icon}
        
        {/* Sparkle effect for premium rarities */}
        {properties.sparkle && animated && (
          <>
            <motion.span
              className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            />
            <motion.span
              className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-white rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                delay: 0.5
              }}
            />
          </>
        )}
      </span>
      
      {/* Label */}
      {showLabel && (
        <span className={cn(
          sizeConfig.label,
          'font-medium text-white/90 drop-shadow'
        )}>
          {properties.label}
        </span>
      )}
      
      {/* Pulse animation for ultra-premium rarities */}
      {properties.pulse && animated && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, transparent, ${properties.gradient.includes('gold') ? 'rgba(251, 191, 36, 0.2)' : properties.gradient.includes('diamond') ? 'rgba(34, 211, 238, 0.2)' : 'rgba(168, 85, 247, 0.2)'})`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="inline-block"
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
};

export default EnhancedRarityBadge;