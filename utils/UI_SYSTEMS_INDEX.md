# UI/UX Utility Systems Index

## Complete List of UI Systems Created

### 1. **Shadow System** (`/utils/shadowSystem.ts`)
- Standardized elevation levels (xs, sm, md, lg, xl, 2xl)
- Component-specific shadows
- Dark mode optimized shadows
- Hover and active state shadows

### 2. **Border Radius System** (`/utils/borderRadiusSystem.ts`)
- Consistent corner rounding (4px, 8px, 12px, 16px, 24px)
- Component-specific radius presets
- Special cases for Pokemon and TCG cards

### 3. **Input Styles System** (`/utils/inputStyles.ts`)
- Prevents mobile zoom with 16px minimum font size
- Standardized input variants (default, search, minimal, solid)
- Touch-manipulation CSS to disable double-tap zoom
- Size presets with proper min-heights

### 4. **Border Color System** (`/utils/borderColorSystem.ts`)
- Consistent border colors for light/dark modes
- Interactive states (hover, focus, active)
- Status colors (success, warning, error, info)
- Pokemon type-specific borders

### 5. **Safe Area System** (`/utils/safeAreaSystem.ts`)
- Proper spacing for notched devices (iPhone X+)
- Component presets (header, footer, modal, container)
- React hook for notch detection
- CSS variable integration

### 6. **Spacing System** (`/utils/spacingSystem.ts`)
- Standardized section spacing (xs to 2xl)
- Container padding presets
- Component spacing (cards, buttons, forms)
- Responsive spacing utilities
- Gap spacing for flexbox/grid

### 7. **Loading System** (`/utils/loadingSystem.ts`)
- Standardized loading spinners
- Skeleton loader presets
- Loading overlays
- Progressive loading animations
- Stagger animations for lists

### 8. **Dark Mode Color System** (`/utils/darkModeColorSystem.ts`)
- Semantic color mappings
- Gray scale with proper dark mode mappings
- Component-specific color presets
- Extended grays (750, 850)
- Patterns to avoid and recommended patterns

### 9. **Focus State System** (`/utils/focusStateSystem.ts`)
- Standardized focus rings for all interactive elements
- Component-specific focus styles
- Keyboard navigation utilities
- ARIA attributes for accessibility
- Focus management utilities
- High contrast mode support

### 10. **Mobile Touch System** (`/utils/mobileTouchSystem.ts`)
- Touch target sizes (minimum 48px)
- Touch feedback styles
- Swipe gesture classes
- Mobile viewport optimizations
- Pull-to-refresh styles
- Mobile navigation patterns
- Mobile form optimizations

### 11. **Micro-Interaction System** (`/utils/microInteractionSystem.ts`)
- Hover effects (scale, lift, glow)
- Click/tap animations
- Page transition animations
- Loading animations
- Feedback animations
- Scroll-triggered animations
- Card and button specific animations

## How to Use These Systems

### Import Examples

```typescript
// Shadow System
import { shadows, getShadowClasses } from '@/utils/shadowSystem';

// Dark Mode Colors
import { semanticColors, getSemanticColor } from '@/utils/darkModeColorSystem';

// Focus States
import { componentFocus, getFocusClasses } from '@/utils/focusStateSystem';

// Mobile Touch
import { touchTargets, touchFeedback } from '@/utils/mobileTouchSystem';

// Micro-interactions
import { hoverEffects, pageTransitions } from '@/utils/microInteractionSystem';
```

### Component Examples

```tsx
// Card with all systems applied
<div className={cn(
  shadows.card,                         // Shadow system
  borderRadius.card,                     // Border radius
  semanticColors.component.cardBg,       // Dark mode colors
  componentFocus.card,                   // Focus states
  touchTargets.medium,                   // Touch targets
  hoverEffects.liftMedium,              // Micro-interactions
  'transition-all duration-200'
)}>
  {/* Card content */}
</div>

// Button with all systems
<button className={cn(
  shadows.button,
  borderRadius.button,
  semanticColors.component.buttonPrimary,
  componentFocus.button,
  touchTargets.button,
  touchFeedback.tap,
  hoverEffects.scaleSmall,
  'text-white font-semibold'
)}>
  Click Me
</button>

// Input with all systems
<input className={cn(
  inputStyles.default,
  semanticColors.component.inputBg,
  borderColors.input,
  componentFocus.input,
  mobileForm.input,
  'transition-all duration-200'
)} />
```

## Benefits of Using These Systems

1. **Consistency**: All components use the same design tokens
2. **Maintainability**: Change once, update everywhere
3. **Accessibility**: Built-in WCAG compliance
4. **Performance**: GPU-optimized animations
5. **Mobile-First**: Touch-optimized with proper sizing
6. **Dark Mode**: Automatic dark mode support
7. **Type Safety**: Full TypeScript support
8. **Tree-Shaking**: Only import what you use

## Quick Reference

| System | Primary Use | Key Features |
|--------|------------|--------------|
| Shadow | Elevation & depth | 6 levels, dark mode aware |
| Border Radius | Corner rounding | 5 sizes, component presets |
| Input Styles | Form inputs | No zoom, 16px minimum |
| Border Colors | Borders | Semantic colors, type colors |
| Safe Area | Notched devices | iPhone X+ support |
| Spacing | Padding & margins | Responsive, consistent |
| Loading | Loading states | Spinners, skeletons, overlays |
| Dark Mode | Color theming | Semantic mappings |
| Focus States | Accessibility | WCAG compliant, visible indicators |
| Mobile Touch | Touch interactions | 48px targets, gestures |
| Micro-interactions | Animations | Hover, click, transitions |

## CSS Variables Required

Add these to your CSS:
```css
:root {
  --safe-area-top: env(safe-area-inset-top);
  --safe-area-right: env(safe-area-inset-right);
  --safe-area-bottom: env(safe-area-inset-bottom);
  --safe-area-left: env(safe-area-inset-left);
}
```

## Tailwind Config Extensions

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2D3748',
          850: '#1A202C',
        }
      }
    }
  }
}
```

---

Created as part of the comprehensive UI/UX evolution project.
Last updated: 2025-08-30