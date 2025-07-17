// Import animations that actually exist in animations.tsx
import { 
  FadeIn, 
  SlideUp, 
  Scale,
  CardHover, 
  StaggeredChildren,
  Bounce,
  Pulse
} from './animations';

// Import components from AnimationSystem.tsx for aliasing
import {
  HoverCard,
  FloatingElement,
  RevealElement,
  StaggerContainer
} from './AnimationSystem';

// Re-export animations
export { 
  FadeIn, 
  SlideUp, 
  Scale,
  CardHover, 
  StaggeredChildren,
  Bounce,
  Pulse
};

// Re-export components from AnimationSystem.tsx
export { 
  AnimationProvider,
  PageTransition,
  StaggerContainer,
  StaggerItem,
  HoverCard,
  FloatingElement,
  RevealElement,
  PulseElement,
  LoadingDots,
  ModalAnimation,
  PressableButton,
  useAnimation
} from './AnimationSystem';

// Create placeholder exports for missing animations that are being imported elsewhere
// These will need to be implemented or imports updated in consuming components
export const ScaleIn = Scale; // Alias to Scale
export const FadeInScale = FadeIn; // Temporary alias
export const Skeleton = null as any; // Placeholder
export const ShakeAnimation = null as any; // Placeholder
export const TypeWriter = null as any; // Placeholder
export const ParallaxScroll = null as any; // Placeholder
export const AnimatedCounter = null as any; // Placeholder
export const GlowEffect = null as any; // Placeholder
export const RainbowGlow = null as any; // Placeholder
export const FloatingAnimation = FloatingElement; // Alias to FloatingElement
export const MorphingText = null as any; // Placeholder
export const AnimatedProgress = null as any; // Placeholder
export const WaveAnimation = null as any; // Placeholder
export const SmoothReveal = RevealElement; // Alias to RevealElement
export const AnimatedBackground = null as any; // Placeholder - this is causing the warning
export const ParticleEffect = null as any; // Placeholder
export const InteractiveCard = HoverCard; // Alias to HoverCard
export const AnimatedList = StaggerContainer; // Alias to StaggerContainer
export const FlipCard = null as any; // Placeholder
export const AnimatedTabs = null as any; // Placeholder