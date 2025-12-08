import React from 'react';

// Stable gradients defined outside component to prevent re-creation
// Updated to warm cream/beige palette for clean minimal design
const STABLE_GRADIENTS = {
  pokedex: 'bg-gradient-to-b from-[#FFFDF7] to-[#FBF8F3] dark:from-stone-900 dark:to-stone-950',
  tcg: 'bg-gradient-to-b from-[#FFFDF7] via-[#FBF8F3] to-[#F5F1EA] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950',
  regions: 'bg-gradient-to-b from-[#FFFDF7] to-[#F5F1EA] dark:from-stone-900 dark:to-stone-950',
  pocket: 'bg-gradient-to-b from-[#FFFDF7] via-amber-50/30 to-[#FBF8F3] dark:from-stone-900 dark:via-amber-950/20 dark:to-stone-950',
  collections: 'bg-gradient-to-b from-[#FFFDF7] to-stone-50 dark:from-stone-900 dark:to-stone-950',
};

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
 * Simplified version that avoids SSR issues
 */
export const FullBleedWrapper: React.FC<FullBleedWrapperProps> = ({ 
  children, 
  className = '', 
  gradient = 'pokedex',
  customGradient,
  pokemonTypes,
  disablePadding = false
}) => {
  // Get gradient classes based on the gradient type
  const getGradientClasses = (): string => {
    if (gradient === 'custom') return customGradient || '';
    if (gradient === 'pokemon-type') {
      // For now, return default gradient for pokemon-type
      return STABLE_GRADIENTS.pokedex;
    }
    return STABLE_GRADIENTS[gradient] || STABLE_GRADIENTS.pokedex;
  };

  const gradientClasses = getGradientClasses();

  return (
    <div className={`min-h-screen relative ${gradientClasses} ${className} px-safe`}>
      {/* Background extender to ensure full page coverage */}
      <div className={`fixed inset-0 ${gradientClasses} -z-10`} aria-hidden="true" />
      <div className="relative z-0 min-h-screen flex flex-col">
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
  const gradients = {
    pokedex: 'bg-gradient-to-b from-[#FFFDF7] to-[#FBF8F3] dark:from-stone-900 dark:to-stone-950',
    tcg: 'bg-gradient-to-b from-[#FFFDF7] via-[#FBF8F3] to-[#F5F1EA] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950',
    regions: 'bg-gradient-to-b from-[#FFFDF7] to-[#F5F1EA] dark:from-stone-900 dark:to-stone-950',
    pocket: 'bg-gradient-to-b from-[#FFFDF7] via-amber-50/30 to-[#FBF8F3] dark:from-stone-900 dark:via-amber-950/20 dark:to-stone-950',
    collections: 'bg-gradient-to-b from-[#FFFDF7] to-stone-50 dark:from-stone-900 dark:to-stone-950',
    'pokemon-type': 'bg-gradient-to-b from-[#FFFDF7] to-[#FBF8F3] dark:from-stone-900 dark:to-stone-950',
    custom: customGradient || ''
  };

  return (
    <div className={`min-h-screen relative ${className} px-safe`}>
      {/* Fixed background layer */}
      <div className={`fixed inset-0 ${gradients[gradient]} -z-10`} aria-hidden="true" />
      <div className="relative z-0 min-h-screen">
        {children}
      </div>
    </div>
  );
};

/**
 * BackgroundOnly - Just applies the background without any wrapper div
 * Useful for pages that want to manage their own layout structure
 */
export const BackgroundOnly: React.FC<{ 
  gradient?: 'pokedex' | 'tcg' | 'regions' | 'pocket' | 'collections' | 'custom';
  customGradient?: string;
}> = ({ gradient = 'pokedex', customGradient }) => {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const body = document.body;
    const html = document.documentElement;
    
    // Get gradient classes
    const gradientClasses = gradient === 'custom' 
      ? customGradient || '' 
      : STABLE_GRADIENTS[gradient] || STABLE_GRADIENTS.pokedex;
    
    const classes = gradientClasses.split(' ');
    
    // Add gradient classes to both body and html
    classes.forEach((cls: string) => {
      if (cls) {
        body.classList.add(cls);
        html.classList.add(cls);
      }
    });
    
    // Ensure minimum height
    body.style.minHeight = '100vh';
    html.style.minHeight = '100vh';
    
    // Cleanup function
    return () => {
      classes.forEach((cls: string) => {
        if (cls) {
          body.classList.remove(cls);
          html.classList.remove(cls);
        }
      });
      body.style.minHeight = '';
      html.style.minHeight = '';
    };
  }, [gradient, customGradient]);

  return null;
};

/**
 * Usage Guide:
 * 
 * 1. FullBleedWrapper (Recommended):
 *    - Wraps content with full background
 *    - Handles edge-to-edge coverage automatically
 *    - Works with server-side rendering
 * 
 * 2. PageBackground:
 *    - Similar to FullBleedWrapper but simpler
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
 */

export default FullBleedWrapper;