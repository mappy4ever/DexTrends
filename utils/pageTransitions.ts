import { Variants } from 'framer-motion';

export type TransitionType = 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'zoom' | 'flip' | 'morph';

export interface PageTransitionConfig {
  type: TransitionType;
  duration?: number;
  ease?: string | number[];
}

// Page transition variants
export const pageVariants: Record<TransitionType, Variants> = {
  fade: {
    initial: {
      opacity: 0
    },
    in: {
      opacity: 1
    },
    out: {
      opacity: 0
    }
  },
  slideUp: {
    initial: {
      opacity: 0,
      y: 30
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -30
    }
  },
  slideDown: {
    initial: {
      opacity: 0,
      y: -30
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: 30
    }
  },
  slideLeft: {
    initial: {
      opacity: 0,
      x: 50
    },
    in: {
      opacity: 1,
      x: 0
    },
    out: {
      opacity: 0,
      x: -50
    }
  },
  slideRight: {
    initial: {
      opacity: 0,
      x: -50
    },
    in: {
      opacity: 1,
      x: 0
    },
    out: {
      opacity: 0,
      x: 50
    }
  },
  scale: {
    initial: {
      opacity: 0,
      scale: 0.95
    },
    in: {
      opacity: 1,
      scale: 1
    },
    out: {
      opacity: 0,
      scale: 1.05
    }
  },
  rotate: {
    initial: {
      opacity: 0,
      rotate: -10,
      scale: 0.9
    },
    in: {
      opacity: 1,
      rotate: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      rotate: 10,
      scale: 1.1
    }
  },
  zoom: {
    initial: {
      opacity: 0,
      scale: 0.8,
      filter: 'blur(4px)'
    },
    in: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    },
    out: {
      opacity: 0,
      scale: 1.2,
      filter: 'blur(4px)'
    }
  },
  flip: {
    initial: {
      opacity: 0,
      rotateY: 90,
      scale: 0.9
    },
    in: {
      opacity: 1,
      rotateY: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      rotateY: -90,
      scale: 0.9
    }
  },
  morph: {
    initial: {
      opacity: 0,
      scale: [1, 1.1, 0.95],
      rotate: [0, 1, -1, 0]
    },
    in: {
      opacity: 1,
      scale: 1,
      rotate: 0
    },
    out: {
      opacity: 0,
      scale: [1, 0.95, 1.1],
      rotate: [0, -1, 1, 0]
    }
  }
};

// Default transition config
export const defaultTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  duration: 0.4
};

// Route-specific transition configurations
export const routeTransitions: Record<string, PageTransitionConfig> = {
  '/': { type: 'fade' },
  '/pokedex': { type: 'slideUp' },
  '/pokedex/[pokeid]': { type: 'zoom' },
  '/tcgsets': { type: 'scale' },
  '/tcgsets/[setid]': { type: 'zoom' },
  '/cards/[cardId]': { type: 'flip' },
  '/team-builder': { type: 'slideUp' },
  '/team-builder/advanced': { type: 'morph' },
  '/battle-simulator': { type: 'rotate' },
  '/favorites': { type: 'scale' },
  '/trending': { type: 'slideLeft' },
  '/type-effectiveness': { type: 'morph' },
  '/pocketmode': { type: 'zoom' },
  '/pocketmode/expansions': { type: 'slideLeft' },
  '/pocketmode/deckbuilder': { type: 'flip' },
  '/pocketmode/packs': { type: 'scale' },
  '/pokemon/regions': { type: 'slideUp' },
  '/pokemon/regions/[region]': { type: 'slideLeft' },
  '/pokemon/starters': { type: 'scale' },
  '/pokemon/moves': { type: 'slideUp' },
  '/pokemon/moves/[moveName]': { type: 'zoom' },
  '/pokemon/abilities': { type: 'slideUp' },
  '/pokemon/items': { type: 'slideUp' },
  '/analytics': { type: 'morph' },
  '/404': { type: 'rotate' },
  '/500': { type: 'rotate' }
};

// Get transition for a specific route
export const getRouteTransition = (pathname: string): PageTransitionConfig => {
  // Check for exact match first
  if (routeTransitions[pathname]) {
    return routeTransitions[pathname];
  }

  // Check for dynamic route patterns
  const dynamicRoutes = Object.keys(routeTransitions).filter(route => route.includes('['));
  for (const route of dynamicRoutes) {
    const pattern = route.replace(/\[.*?\]/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    if (regex.test(pathname)) {
      return routeTransitions[route];
    }
  }

  // Default transition
  return { type: 'fade' };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};