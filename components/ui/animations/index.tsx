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

// Import placeholder components to avoid Fast Refresh warnings
import {
  Skeleton,
  ShakeAnimation,
  TypeWriter,
  ParallaxScroll,
  AnimatedCounter,
  GlowEffect,
  RainbowGlow,
  MorphingText,
  AnimatedProgress,
  WaveAnimation,
  AnimatedBackground,
  ParticleEffect,
  FlipCard,
  AnimatedTabs
} from './placeholders';

// Export aliases for existing animations
export const ScaleIn = Scale; // Alias to Scale
export const FadeInScale = FadeIn; // Temporary alias
export const FloatingAnimation = FloatingElement; // Alias to FloatingElement
export const SmoothReveal = RevealElement; // Alias to RevealElement
export const InteractiveCard = HoverCard; // Alias to HoverCard
export const AnimatedList = StaggerContainer; // Alias to StaggerContainer

// Export placeholder components
export {
  Skeleton,
  ShakeAnimation,
  TypeWriter,
  ParallaxScroll,
  AnimatedCounter,
  GlowEffect,
  RainbowGlow,
  MorphingText,
  AnimatedProgress,
  WaveAnimation,
  AnimatedBackground,
  ParticleEffect,
  FlipCard,
  AnimatedTabs
};