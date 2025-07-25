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


// Removed aliases that break Fast Refresh
// Use the original export names directly instead

