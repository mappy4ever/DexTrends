import type { PokemonType, PokemonTheme } from '../types/api/pokemon';

/**
 * Particle configuration for type-based effects
 */
export interface ParticleConfig {
  count: number;
  speed: 'slow' | 'normal' | 'fast';
  opacity: number;
  size: 'small' | 'medium' | 'large';
  colors: string[];
  behavior: 'float' | 'fall' | 'swirl' | 'sparkle';
}

/**
 * Generate type-based particle effects
 * @param types - Pokemon's types
 * @param config - Particle configuration overrides
 * @returns Particle configuration for rendering
 */
export function generateTypeParticles(
  types?: PokemonType[],
  config?: Partial<ParticleConfig>
): ParticleConfig {
  const primaryType = types?.[0]?.type.name || 'normal';
  
  // Type-specific particle behaviors
  const typeParticles: Record<string, Partial<ParticleConfig>> = {
    fire: {
      count: 25,
      speed: 'normal',
      opacity: 0.7,
      size: 'medium',
      colors: ['#ef4444', '#f97316', '#fbbf24', '#dc2626'],
      behavior: 'float'
    },
    water: {
      count: 30,
      speed: 'slow',
      opacity: 0.6,
      size: 'small',
      colors: ['#3b82f6', '#06b6d4', '#0ea5e9', '#0284c7'],
      behavior: 'fall'
    },
    electric: {
      count: 20,
      speed: 'fast',
      opacity: 0.8,
      size: 'small',
      colors: ['#fde047', '#facc15', '#eab308', '#fef3c7'],
      behavior: 'sparkle'
    },
    grass: {
      count: 15,
      speed: 'slow',
      opacity: 0.5,
      size: 'medium',
      colors: ['#22c55e', '#16a34a', '#84cc16', '#65a30d'],
      behavior: 'fall'
    },
    psychic: {
      count: 20,
      speed: 'normal',
      opacity: 0.6,
      size: 'large',
      colors: ['#ec4899', '#d946ef', '#a855f7', '#f472b6'],
      behavior: 'swirl'
    },
    ice: {
      count: 25,
      speed: 'slow',
      opacity: 0.7,
      size: 'small',
      colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#e0f2fe'],
      behavior: 'fall'
    },
    dragon: {
      count: 15,
      speed: 'normal',
      opacity: 0.8,
      size: 'large',
      colors: ['#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa'],
      behavior: 'swirl'
    },
    dark: {
      count: 20,
      speed: 'slow',
      opacity: 0.4,
      size: 'medium',
      colors: ['#374151', '#4b5563', '#6b7280', '#1f2937'],
      behavior: 'float'
    },
    fairy: {
      count: 30,
      speed: 'normal',
      opacity: 0.6,
      size: 'small',
      colors: ['#f472b6', '#ec4899', '#fbbf24', '#f9a8d4'],
      behavior: 'sparkle'
    },
    ghost: {
      count: 15,
      speed: 'slow',
      opacity: 0.5,
      size: 'large',
      colors: ['#7c3aed', '#9333ea', '#a855f7', '#6b21a8'],
      behavior: 'float'
    },
    poison: {
      count: 20,
      speed: 'normal',
      opacity: 0.7,
      size: 'medium',
      colors: ['#a855f7', '#9333ea', '#c026d3', '#d946ef'],
      behavior: 'float'
    },
    flying: {
      count: 10,
      speed: 'fast',
      opacity: 0.4,
      size: 'large',
      colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
      behavior: 'swirl'
    },
    ground: {
      count: 25,
      speed: 'slow',
      opacity: 0.8,
      size: 'small',
      colors: ['#d97706', '#f59e0b', '#fbbf24', '#92400e'],
      behavior: 'fall'
    },
    rock: {
      count: 15,
      speed: 'slow',
      opacity: 0.9,
      size: 'medium',
      colors: ['#78716c', '#a8a29e', '#d6d3d1', '#57534e'],
      behavior: 'fall'
    },
    bug: {
      count: 30,
      speed: 'fast',
      opacity: 0.6,
      size: 'small',
      colors: ['#84cc16', '#65a30d', '#4ade80', '#16a34a'],
      behavior: 'swirl'
    },
    steel: {
      count: 20,
      speed: 'normal',
      opacity: 0.7,
      size: 'medium',
      colors: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#64748b'],
      behavior: 'sparkle'
    },
    fighting: {
      count: 15,
      speed: 'fast',
      opacity: 0.8,
      size: 'medium',
      colors: ['#dc2626', '#ef4444', '#f87171', '#991b1b'],
      behavior: 'float'
    },
    normal: {
      count: 10,
      speed: 'normal',
      opacity: 0.3,
      size: 'medium',
      colors: ['#9ca3af', '#d1d5db', '#e5e7eb', '#6b7280'],
      behavior: 'float'
    }
  };
  
  const defaultConfig = typeParticles[primaryType] || typeParticles.normal;
  
  return {
    ...defaultConfig,
    ...config
  } as ParticleConfig;
}

/**
 * Get Pokemon theme configuration based on types
 * @param types - Pokemon's types
 * @returns Theme configuration object
 */
export function getPokemonTheme(types?: PokemonType[]): PokemonTheme {
  const primaryType = types?.[0]?.type.name || 'normal';
  const secondaryType = types?.[1]?.type.name;
  
  // Type color mappings
  const typeThemes: Record<string, Omit<PokemonTheme, 'gradient'>> = {
    fire: {
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      particleColors: ['#ef4444', '#f97316', '#fbbf24'],
      glowColor: 'rgba(239, 68, 68, 0.5)',
      accentColor: '#dc2626'
    },
    water: {
      primaryColor: '#3b82f6',
      secondaryColor: '#06b6d4',
      particleColors: ['#3b82f6', '#06b6d4', '#0ea5e9'],
      glowColor: 'rgba(59, 130, 246, 0.5)',
      accentColor: '#0284c7'
    },
    electric: {
      primaryColor: '#fde047',
      secondaryColor: '#facc15',
      particleColors: ['#fde047', '#facc15', '#eab308'],
      glowColor: 'rgba(253, 224, 71, 0.5)',
      accentColor: '#eab308'
    },
    grass: {
      primaryColor: '#22c55e',
      secondaryColor: '#16a34a',
      particleColors: ['#22c55e', '#16a34a', '#84cc16'],
      glowColor: 'rgba(34, 197, 94, 0.5)',
      accentColor: '#15803d'
    },
    psychic: {
      primaryColor: '#ec4899',
      secondaryColor: '#d946ef',
      particleColors: ['#ec4899', '#d946ef', '#a855f7'],
      glowColor: 'rgba(236, 72, 153, 0.5)',
      accentColor: '#be185d'
    },
    ice: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#38bdf8',
      particleColors: ['#0ea5e9', '#38bdf8', '#7dd3fc'],
      glowColor: 'rgba(14, 165, 233, 0.5)',
      accentColor: '#0284c7'
    },
    dragon: {
      primaryColor: '#6366f1',
      secondaryColor: '#7c3aed',
      particleColors: ['#6366f1', '#7c3aed', '#8b5cf6'],
      glowColor: 'rgba(99, 102, 241, 0.5)',
      accentColor: '#4f46e5'
    },
    dark: {
      primaryColor: '#374151',
      secondaryColor: '#4b5563',
      particleColors: ['#374151', '#4b5563', '#6b7280'],
      glowColor: 'rgba(55, 65, 81, 0.5)',
      accentColor: '#1f2937'
    },
    fairy: {
      primaryColor: '#f472b6',
      secondaryColor: '#ec4899',
      particleColors: ['#f472b6', '#ec4899', '#fbbf24'],
      glowColor: 'rgba(244, 114, 182, 0.5)',
      accentColor: '#db2777'
    },
    ghost: {
      primaryColor: '#7c3aed',
      secondaryColor: '#9333ea',
      particleColors: ['#7c3aed', '#9333ea', '#a855f7'],
      glowColor: 'rgba(124, 58, 237, 0.5)',
      accentColor: '#6b21a8'
    },
    poison: {
      primaryColor: '#a855f7',
      secondaryColor: '#9333ea',
      particleColors: ['#a855f7', '#9333ea', '#c026d3'],
      glowColor: 'rgba(168, 85, 247, 0.5)',
      accentColor: '#7e22ce'
    },
    flying: {
      primaryColor: '#3b82f6',
      secondaryColor: '#60a5fa',
      particleColors: ['#3b82f6', '#60a5fa', '#93c5fd'],
      glowColor: 'rgba(59, 130, 246, 0.5)',
      accentColor: '#2563eb'
    },
    ground: {
      primaryColor: '#d97706',
      secondaryColor: '#f59e0b',
      particleColors: ['#d97706', '#f59e0b', '#fbbf24'],
      glowColor: 'rgba(217, 119, 6, 0.5)',
      accentColor: '#b45309'
    },
    rock: {
      primaryColor: '#78716c',
      secondaryColor: '#a8a29e',
      particleColors: ['#78716c', '#a8a29e', '#d6d3d1'],
      glowColor: 'rgba(120, 113, 108, 0.5)',
      accentColor: '#57534e'
    },
    bug: {
      primaryColor: '#84cc16',
      secondaryColor: '#65a30d',
      particleColors: ['#84cc16', '#65a30d', '#4ade80'],
      glowColor: 'rgba(132, 204, 22, 0.5)',
      accentColor: '#4d7c0f'
    },
    steel: {
      primaryColor: '#94a3b8',
      secondaryColor: '#cbd5e1',
      particleColors: ['#94a3b8', '#cbd5e1', '#e2e8f0'],
      glowColor: 'rgba(148, 163, 184, 0.5)',
      accentColor: '#64748b'
    },
    fighting: {
      primaryColor: '#dc2626',
      secondaryColor: '#ef4444',
      particleColors: ['#dc2626', '#ef4444', '#f87171'],
      glowColor: 'rgba(220, 38, 38, 0.5)',
      accentColor: '#991b1b'
    },
    normal: {
      primaryColor: '#9ca3af',
      secondaryColor: '#d1d5db',
      particleColors: ['#9ca3af', '#d1d5db', '#e5e7eb'],
      glowColor: 'rgba(156, 163, 175, 0.5)',
      accentColor: '#6b7280'
    }
  };
  
  const primaryTheme = typeThemes[primaryType] || typeThemes.normal;
  const secondaryTheme = secondaryType ? typeThemes[secondaryType] : null;
  
  // Create gradient based on types
  let gradient: string;
  if (secondaryTheme) {
    gradient = `linear-gradient(135deg, ${primaryTheme.primaryColor} 0%, ${primaryTheme.secondaryColor} 40%, ${secondaryTheme.primaryColor} 60%, ${secondaryTheme.secondaryColor} 100%)`;
  } else {
    gradient = `linear-gradient(135deg, ${primaryTheme.primaryColor} 0%, ${primaryTheme.secondaryColor} 100%)`;
  }
  
  return {
    ...primaryTheme,
    gradient
  };
}

/**
 * Create ring animation configuration for dual-type Pokemon
 * @param types - Pokemon's types
 * @returns Animation keyframes and timing
 */
export function createRingAnimation(types?: PokemonType[]): {
  keyframes: string;
  duration: string;
  timing: string;
} {
  const hasDualType = types && types.length > 1;
  
  if (hasDualType) {
    return {
      keyframes: `
        @keyframes dual-type-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
      duration: '20s',
      timing: 'linear infinite'
    };
  }
  
  return {
    keyframes: `
      @keyframes single-type-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
    `,
    duration: '3s',
    timing: 'ease-in-out infinite'
  };
}

/**
 * Get type-specific glow effect
 * @param types - Pokemon's types
 * @returns CSS box-shadow value for glow effect
 */
export function getTypeGlow(types?: PokemonType[]): string {
  if (!types || types.length === 0) {
    return '0 0 20px rgba(156, 163, 175, 0.3)';
  }
  
  const theme = getPokemonTheme(types);
  const primaryGlow = `0 0 30px ${theme.glowColor}`;
  
  if (types.length > 1) {
    const secondaryType = types[1].type.name;
    const secondaryTheme = getPokemonTheme([types[1]]);
    return `${primaryGlow}, 0 0 50px ${secondaryTheme.glowColor}`;
  }
  
  return primaryGlow;
}

/**
 * Animation presets for different UI elements
 */
export const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  float: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }
};

/**
 * Get animation delay for staggered effects
 * @param index - Element index
 * @param baseDelay - Base delay in seconds
 * @returns Delay value for animation
 */
export function getStaggerDelay(index: number, baseDelay: number = 0.05): number {
  return index * baseDelay;
}

/**
 * Create CSS for particle animations
 * @param behavior - Particle behavior type
 * @returns CSS animation string
 */
export function getParticleAnimation(behavior: ParticleConfig['behavior']): string {
  const animations: Record<ParticleConfig['behavior'], string> = {
    float: `
      @keyframes particle-float {
        0% { transform: translate(0, 100vh) scale(0); }
        10% { transform: translate(10px, 90vh) scale(1); }
        20% { transform: translate(-10px, 80vh) scale(1); }
        30% { transform: translate(10px, 70vh) scale(1); }
        40% { transform: translate(-10px, 60vh) scale(1); }
        50% { transform: translate(10px, 50vh) scale(1); }
        60% { transform: translate(-10px, 40vh) scale(1); }
        70% { transform: translate(10px, 30vh) scale(1); }
        80% { transform: translate(-10px, 20vh) scale(1); }
        90% { transform: translate(10px, 10vh) scale(1); }
        100% { transform: translate(0, -10vh) scale(0); }
      }
    `,
    fall: `
      @keyframes particle-fall {
        0% { transform: translate(0, -10vh) scale(0) rotate(0deg); }
        10% { transform: translate(10px, 10vh) scale(1) rotate(36deg); }
        20% { transform: translate(-10px, 20vh) scale(1) rotate(72deg); }
        30% { transform: translate(15px, 30vh) scale(1) rotate(108deg); }
        40% { transform: translate(-5px, 40vh) scale(1) rotate(144deg); }
        50% { transform: translate(10px, 50vh) scale(1) rotate(180deg); }
        60% { transform: translate(-15px, 60vh) scale(1) rotate(216deg); }
        70% { transform: translate(5px, 70vh) scale(1) rotate(252deg); }
        80% { transform: translate(-10px, 80vh) scale(1) rotate(288deg); }
        90% { transform: translate(10px, 90vh) scale(1) rotate(324deg); }
        100% { transform: translate(0, 100vh) scale(0) rotate(360deg); }
      }
    `,
    swirl: `
      @keyframes particle-swirl {
        0% { transform: rotate(0deg) translateX(0) scale(0); }
        10% { transform: rotate(36deg) translateX(20px) scale(1); }
        20% { transform: rotate(72deg) translateX(40px) scale(1); }
        30% { transform: rotate(108deg) translateX(30px) scale(1); }
        40% { transform: rotate(144deg) translateX(20px) scale(1); }
        50% { transform: rotate(180deg) translateX(10px) scale(1); }
        60% { transform: rotate(216deg) translateX(20px) scale(1); }
        70% { transform: rotate(252deg) translateX(30px) scale(1); }
        80% { transform: rotate(288deg) translateX(40px) scale(1); }
        90% { transform: rotate(324deg) translateX(20px) scale(1); }
        100% { transform: rotate(360deg) translateX(0) scale(0); }
      }
    `,
    sparkle: `
      @keyframes particle-sparkle {
        0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1) rotate(180deg); opacity: 1; }
      }
    `
  };
  
  return animations[behavior] || animations.float;
}