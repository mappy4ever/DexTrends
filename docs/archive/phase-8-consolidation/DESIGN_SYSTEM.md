# DexTrends Design System

*Last Updated: 2025-07-24*
*Design System Version: 1.0*

## Design Philosophy

### Core Principles
1. **Circular-First Design**: Circles are the primary shape language
2. **Gradient-Driven Aesthetics**: Every surface uses subtle gradients
3. **Pokemon Type Integration**: Dynamic theming based on Pokemon types
4. **Mobile-First Implementation**: Optimized for touch and small screens
5. **Clean Minimalism**: Focus on content with purposeful negative space

## Visual Language

### Shape System
```css
/* Primary shape: Circle */
.circle-base {
  border-radius: 50%;
  aspect-ratio: 1;
}

/* Size Scale */
.circle-sm { width: 96px; }  /* Small elements */
.circle-md { width: 144px; } /* Default size */
.circle-lg { width: 192px; } /* Hero elements */

/* Multi-ring pattern for complex components */
.multi-ring {
  position: relative;
  padding: 24px;
}

.multi-ring::before,
.multi-ring::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid;
  opacity: 0.2;
}

.multi-ring::before { scale: 1.1; }
.multi-ring::after { scale: 1.2; }
```

### Color System

#### Base Palette
```css
:root {
  /* Primary Colors */
  --primary-gradient: linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%);
  --secondary-gradient: linear-gradient(135deg, #F85555 0%, #E63946 100%);
  
  /* Neutral Colors */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-900: #111827;
  
  /* Dark Mode */
  --dark-surface: #1A1B26;
  --dark-surface-gradient: linear-gradient(135deg, #1A1B26 0%, #16171F 100%);
}
```

#### Pokemon Type Colors (Pastel)
```css
/* Type-specific pastels for backgrounds */
.type-normal { --type-color: #F5F5DC; }
.type-fire { --type-color: #FFE5E5; }
.type-water { --type-color: #E5F3FF; }
.type-electric { --type-color: #FFF9E5; }
.type-grass { --type-color: #E5FFE5; }
.type-ice { --type-color: #E5FFFF; }
.type-fighting { --type-color: #FFE5E5; }
.type-poison { --type-color: #F5E5FF; }
.type-ground { --type-color: #FFF5E5; }
.type-flying { --type-color: #F0F5FF; }
.type-psychic { --type-color: #FFE5F5; }
.type-bug { --type-color: #F0FFE5; }
.type-rock { --type-color: #F5F0E5; }
.type-ghost { --type-color: #F0E5FF; }
.type-dragon { --type-color: #E5E5FF; }
.type-dark { --type-color: #E5E5F0; }
.type-steel { --type-color: #F0F0F5; }
.type-fairy { --type-color: #FFE5F5; }
```

### Typography
```css
:root {
  /* Font Families */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;
  --font-mono: 'SF Mono', Monaco, monospace;
  
  /* Mobile-First Sizes */
  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px - iOS input minimum */
  --text-lg: 1.125rem;  /* 18px */
  --text-xl: 1.25rem;   /* 20px */
  --text-2xl: 1.5rem;   /* 24px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing System
```css
:root {
  /* Base unit: 4px */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  
  /* Mobile-specific */
  --mobile-padding: 16px;
  --safe-area-padding: max(var(--mobile-padding), env(safe-area-inset-left));
}
```

## Component Patterns

### Buttons
```css
.button {
  /* Base styles */
  min-height: 44px; /* iOS touch target */
  padding: 12px 24px;
  border-radius: 9999px; /* Full circular */
  font-size: 16px;
  font-weight: 600;
  touch-action: manipulation;
  
  /* Gradient background */
  background: var(--primary-gradient);
  color: white;
  
  /* Smooth interactions */
  transition: all 200ms ease-out;
}

.button:active {
  transform: scale(0.98);
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  
  /* Subtle gradient overlay */
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.5) 100%);
  pointer-events: none;
}

/* Dark mode */
.dark .card {
  background: var(--dark-surface-gradient);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}
```

### Type-Based Theming
```jsx
// Dynamic type-based backgrounds
<FullBleedWrapper 
  theme="dynamic"
  pokemonTypes={['fire', 'flying']}
  opacity={0.15}
>
  {/* Content */}
</FullBleedWrapper>
```

## Animation System

### Timing & Easing
```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  /* Easing */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Common Animations
```jsx
// Fade In
<FadeIn duration={0.5} delay={0.1}>
  <Card />
</FadeIn>

// Slide Up
<SlideUp duration={0.6} distance={20}>
  <Content />
</SlideUp>

// Card Hover
<CardHover>
  <PokemonCard />
</CardHover>

// Staggered Children
<StaggeredChildren stagger={0.1}>
  {items.map(item => (
    <FadeIn key={item.id}>
      <Item {...item} />
    </FadeIn>
  ))}
</StaggeredChildren>
```

## Mobile Optimization

### Breakpoints
```css
/* Mobile-first approach */
@media (min-width: 375px) { /* iPhone SE */ }
@media (min-width: 390px) { /* iPhone 14 */ }
@media (min-width: 430px) { /* iPhone Pro Max */ }
@media (min-width: 768px) { /* iPad */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Touch Optimization
```css
/* Disable touch delays */
* {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Smooth scrolling */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
}

/* Prevent input zoom */
input, select, textarea {
  font-size: 16px;
}
```

### Performance
```css
/* GPU acceleration for transforms */
.animated {
  will-change: transform;
  transform: translateZ(0);
}

/* Reduce motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility

### Focus States
```css
.interactive:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
  border-radius: 8px;
}
```

### Color Contrast
- Text on light backgrounds: minimum 4.5:1 ratio
- Text on colored backgrounds: minimum 3:1 ratio
- Use `aria-label` for icon-only buttons
- Ensure all interactive elements have accessible names

## Implementation Examples

### Pokemon Card with Type Theme
```jsx
<div className={`card type-${pokemon.types[0]}`}>
  <div className="circle-md mx-auto mb-4">
    <img src={pokemon.sprite} alt={pokemon.name} />
  </div>
  <h3 className="text-xl font-bold">{pokemon.name}</h3>
  <div className="flex gap-2 mt-2">
    {pokemon.types.map(type => (
      <TypeBadge key={type} type={type} />
    ))}
  </div>
</div>
```

### Mobile Navigation
```jsx
<nav className="fixed bottom-0 left-0 right-0 safe-area-bottom">
  <div className="flex justify-around items-center h-16 bg-white dark:bg-gray-900">
    {navItems.map(item => (
      <button
        key={item.id}
        className="touch-target flex flex-col items-center"
      >
        <Icon name={item.icon} />
        <span className="text-xs mt-1">{item.label}</span>
      </button>
    ))}
  </div>
</nav>
```

## File Organization
```
styles/
├── globals.css          # Base styles & CSS variables
├── design-system.css    # Component classes
├── animations.css       # Animation utilities
└── type-themes.css      # Pokemon type styles
```

## Implementation Status

### ✅ Completed Pages
1. **Battle Simulator** - Glass morphism interface, circular selectors, gradient buttons
2. **Type Effectiveness** - Circular type matrix, glass containers, gradient backgrounds
3. **Team Builder** - Circular card design, glass morphism containers
4. **Collections** - Glass containers, circular progress indicators
5. **Market** - Circular product cards, glass filters, gradient badges
6. **TCG Sets** - Glass containers, gradient navigation
7. **Pocket Mode** - Consistent design across expansions
8. **Error Pages (404/500)** - Playful Pokemon themes with gradients
9. **Gym Leader Carousel** - Fixed SSR issues, circular cards with glass morphism

### 🚧 In Progress
- Pokemon Detail (Pocket Mode) - Needs glass morphism and circular evolution display
- Mobile responsiveness testing across all pages

## Quality Assurance Checklist

### Visual Consistency
- [ ] All Pokemon displays use circular format
- [ ] Consistent gradient application across pages
- [ ] Glass effects have uniform blur/opacity
- [ ] Button styles match throughout
- [ ] Typography follows established hierarchy
- [ ] Spacing is consistent and generous
- [ ] Dark mode maintains readability

### Technical Requirements
- [ ] No SSR hydration warnings
- [ ] Smooth animations (60fps)
- [ ] Touch targets meet accessibility (44px minimum)
- [ ] Images have proper alt text
- [ ] Focus states are visible
- [ ] Loading states are graceful

## Developer Notes

### Common Issues & Solutions
1. **SSR Hydration Error** - Use responsive Tailwind classes instead of window dimensions
2. **Performance** - Use requestIdleCallback for heavy calculations
3. **Import Paths** - Always verify component imports from correct directories

### When Adding New Features
1. Check if a design system component exists first
2. Use established gradient and glass morphism classes
3. Maintain the circular design language
4. Test on both light and dark modes
5. Ensure mobile responsiveness
6. Add appropriate hover/active states

### File Locations
- Design system components: `/components/ui/design-system/`
- Global styles: `/styles/design-system.css`
- Animation utilities: `/utils/motion.tsx`
- Type-specific styles: `/styles/globals.css`

---

Last Updated: 2025-07-24
Maintained in: `/project-resources/docs/DESIGN_SYSTEM.md`