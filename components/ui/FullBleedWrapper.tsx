import React from 'react';

interface FullBleedWrapperProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'pokedex' | 'tcg' | 'regions' | 'pocket' | 'collections' | 'custom' | 'pokemon-type';
  customGradient?: string;
  pokemonTypes?: Array<{ type: { name: string } }>; // For pokemon-type gradient
  disablePadding?: boolean;
}

/**
 * FullBleedWrapper - A robust component that provides full-bleed backgrounds
 * Automatically handles layout conflicts and ensures proper background coverage
 * Works by using viewport units and fixed positioning for true edge-to-edge coverage
 */
export const FullBleedWrapper: React.FC<FullBleedWrapperProps> = ({ 
  children, 
  className = '', 
  gradient = 'pokedex',
  customGradient,
  pokemonTypes,
  disablePadding = false
}) => {
  // Import the type gradient function
  const { generateTypeGradient } = React.useMemo(() => {
    // Dynamic import to avoid SSR issues
    if (typeof window !== 'undefined') {
      return require('../../utils/pokemonTypeGradients');
    }
    return { generateTypeGradient: () => 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900' };
  }, []);

  // Predefined gradients with enhanced consistency
  const gradients = {
    pokedex: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900',
    tcg: 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/30 dark:to-pink-950/30',
    regions: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950',
    pocket: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950',
    collections: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900',
    'pokemon-type': pokemonTypes ? generateTypeGradient(pokemonTypes) : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900',
    custom: customGradient || ''
  };

  // Apply background to document body for complete coverage
  React.useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // Add gradient classes to both body and html
    const gradientClasses = gradients[gradient].split(' ');
    gradientClasses.forEach((cls: string) => {
      body.classList.add(cls);
      html.classList.add(cls);
    });
    
    // Ensure minimum height
    body.style.minHeight = '100vh';
    html.style.minHeight = '100vh';
    
    // Cleanup function
    return () => {
      gradientClasses.forEach((cls: string) => {
        body.classList.remove(cls);
        html.classList.remove(cls);
      });
      body.style.minHeight = '';
      html.style.minHeight = '';
    };
  }, [gradient, gradients]);

  return (
    <div className={`relative ${disablePadding ? '' : 'min-h-screen'} ${className}`}>
      {/* Fallback background layer that grows with content */}
      <div 
        className={`absolute inset-0 w-full h-full z-[-1] ${gradients[gradient]}`}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          minHeight: '100vh',
          height: '100%',
          zIndex: -1
        }}
      />
      
      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

/**
 * PageBackground - A simpler alternative for pages that just need a background without full-bleed
 * Uses the same gradient system but without the fixed positioning
 */
export const PageBackground: React.FC<FullBleedWrapperProps> = ({
  children,
  className = '',
  gradient = 'pokedex',
  customGradient,
  pokemonTypes
}) => {
  // Import the type gradient function
  const { generateTypeGradient } = React.useMemo(() => {
    // Dynamic import to avoid SSR issues
    if (typeof window !== 'undefined') {
      return require('../../utils/pokemonTypeGradients');
    }
    return { generateTypeGradient: () => 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900' };
  }, []);

  const gradients = {
    pokedex: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900',
    tcg: 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/30 dark:to-pink-950/30',
    regions: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950',
    pocket: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950',
    collections: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900',
    'pokemon-type': pokemonTypes ? generateTypeGradient(pokemonTypes) : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900',
    custom: customGradient || ''
  };

  return (
    <div className={`min-h-screen ${gradients[gradient]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * BackgroundOnly - Just applies the background without any wrapper div
 * Useful for pages that want to manage their own layout structure
 */
export const BackgroundOnly: React.FC<{ 
  gradient?: FullBleedWrapperProps['gradient']; 
  customGradient?: string;
  pokemonTypes?: Array<{ type: { name: string } }>;
}> = ({ 
  gradient = 'pokedex', 
  customGradient,
  pokemonTypes
}) => {
  // Import the type gradient function
  const { generateTypeGradient } = React.useMemo(() => {
    // Dynamic import to avoid SSR issues
    if (typeof window !== 'undefined') {
      return require('../../utils/pokemonTypeGradients');
    }
    return { generateTypeGradient: () => 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900' };
  }, []);

  const gradients = {
    pokedex: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900',
    tcg: 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/30 dark:to-pink-950/30',
    regions: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950',
    pocket: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950',
    collections: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900',
    'pokemon-type': pokemonTypes ? generateTypeGradient(pokemonTypes) : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900',
    custom: customGradient || ''
  };

  React.useEffect(() => {
    // Apply background to body for true full coverage
    const body = document.body;
    const originalClass = body.className;
    
    body.className = `${originalClass} ${gradients[gradient]}`.trim();
    
    return () => {
      body.className = originalClass;
    };
  }, [gradient, customGradient, gradients]);

  return null;
};

/**
 * USAGE GUIDE:
 * 
 * 1. FullBleedWrapper: 
 *    - For pages that need true edge-to-edge backgrounds
 *    - Applies background to document body for complete coverage
 *    - Includes fallback absolute positioning for content overflow
 *    - Automatically handles cleanup on component unmount
 *    - Example: <FullBleedWrapper gradient="pokedex">{content}</FullBleedWrapper>
 * 
 * 2. PageBackground:
 *    - For pages that want background but respect layout constraints
 *    - Uses standard div with min-height
 *    - Good for pages with complex layouts
 * 
 * 3. BackgroundOnly:
 *    - Applies background to document body only
 *    - No wrapper divs
 *    - Automatically cleans up on unmount
 * 
 * Page Setup:
 * - Add `YourComponent.fullBleed = true;` to use with Layout's fullBleed prop
 * - This removes Layout's default padding for FullBleedWrapper pages
 * 
 * FIXED ISSUES:
 * - ✅ No more partial backgrounds at page bottom
 * - ✅ Complete coverage for long content pages
 * - ✅ Works with any layout structure
 * - ✅ Automatic cleanup prevents conflicts between pages
 * - ✅ Handles viewport and content height scenarios
 */

export default FullBleedWrapper;