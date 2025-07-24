// Placeholder components for animations that haven't been implemented yet
// These prevent Fast Refresh warnings from null exports

import React from 'react';

interface PlaceholderProps {
  children?: React.ReactNode;
  [key: string]: any;
}

// Create a generic placeholder component
const createPlaceholder = (name: string) => {
  const Placeholder: React.FC<PlaceholderProps> = ({ children, ...props }) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`${name} animation component is not yet implemented`);
    }
    return <div {...props}>{children}</div>;
  };
  Placeholder.displayName = name;
  return Placeholder;
};

// Export placeholder components
export const Skeleton = createPlaceholder('Skeleton');
export const ShakeAnimation = createPlaceholder('ShakeAnimation');
export const TypeWriter = createPlaceholder('TypeWriter');
export const ParallaxScroll = createPlaceholder('ParallaxScroll');
export const AnimatedCounter = createPlaceholder('AnimatedCounter');
export const GlowEffect = createPlaceholder('GlowEffect');
export const RainbowGlow = createPlaceholder('RainbowGlow');
export const MorphingText = createPlaceholder('MorphingText');
export const AnimatedProgress = createPlaceholder('AnimatedProgress');
export const WaveAnimation = createPlaceholder('WaveAnimation');
export const AnimatedBackground = createPlaceholder('AnimatedBackground');
export const ParticleEffect = createPlaceholder('ParticleEffect');
export const FlipCard = createPlaceholder('FlipCard');
export const AnimatedTabs = createPlaceholder('AnimatedTabs');