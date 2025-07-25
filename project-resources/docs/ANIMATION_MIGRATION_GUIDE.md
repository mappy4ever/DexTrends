# Animation Migration Guide

## Overview
To reduce initial bundle size, we're migrating from direct framer-motion imports to a lazy-loaded AnimationProvider.

## Files That Need Migration (20 files)
1. pages/regions/[region].js
2. pages/regions/index.js
3. components/regions/SpecialPokemonShowcase.js
4. components/regions/RegionalVariants.js
5. components/regions/EvilTeamShowcase.js
6. components/regions/StarterShowcaseEnhanced.js
7. components/regions/LegendaryShowcase.js
8. components/regions/ProfessorShowcase.js
9. components/regions/StarterPokemonShowcase.js
10. components/ui/RegionSelector.js
11. components/ui/EnhancedModal.js
12. components/ui/AnimationSystem.js
13. components/ui/GymLeaderShowcase.js
14. components/ui/RegionNavigation.js
15. components/ui/EnhancedAnimationSystem.js
16. components/ui/RegionHeader.js
17. components/ui/animations/AnimationSystem.tsx
18. components/ui/BadgeGrid.js
19. components/ui/FilteredPokemonModal.js
20. components/ui/animations.js

## Migration Steps

### 1. Replace Direct Import
```javascript
// OLD
import { motion, AnimatePresence } from 'framer-motion';

// NEW
import { useAnimations } from '../providers/AnimationProvider';
```

### 2. Use Hook in Component
```javascript
// OLD
const MyComponent = () => {
  return (
    <motion.div animate={{ opacity: 1 }}>
      Content
    </motion.div>
  );
};

// NEW
const MyComponent = () => {
  const { motion, AnimatePresence } = useAnimations();
  
  return (
    <motion.div animate={{ opacity: 1 }}>
      Content
    </motion.div>
  );
};
```

### 3. Wrap App with Provider
In `_app.js`, add:
```javascript
import AnimationProvider from '../components/providers/AnimationProvider';

function MyApp({ Component, pageProps }) {
  return (
    <AnimationProvider>
      {/* existing providers */}
    </AnimationProvider>
  );
}
```

### 4. Handle Loading States
The AnimationProvider provides static elements when framer-motion isn't loaded:
```javascript
const { motion, isLoaded } = useAnimations();

// motion.div will render as a regular <div> until framer-motion loads
// This ensures the page renders immediately
```

### 5. Preload for Critical Animations
For pages where animation is critical:
```javascript
import { preloadAnimations } from '../providers/AnimationProvider';

// In useEffect or on user interaction
useEffect(() => {
  preloadAnimations();
}, []);
```

## Benefits
- **Initial Bundle Reduction**: ~100KB saved from initial load
- **Lazy Loading**: Framer-motion loads only when needed
- **Graceful Degradation**: Pages render without animations initially
- **Better Performance**: Faster initial page load