# DexTrends Architecture Overview

## Responsive Design Architecture

DexTrends uses a **unified responsive architecture** where components adapt to all viewports using CSS and Tailwind utilities, rather than maintaining separate mobile and desktop components.

### Design Principles

1. **Single Component, Multiple Viewports**
   - Components use responsive Tailwind classes (`sm:`, `md:`, `lg:`, `xl:`)
   - Grid layouts adapt from 2 columns on mobile to 6+ on desktop
   - Typography scales appropriately with viewport

2. **Mobile-First Approach**
   - Base styles target mobile (320px minimum)
   - Progressive enhancement for larger screens
   - Touch targets minimum 48px on all interactive elements

3. **Performance Optimizations**
   - Lazy loading for heavy components
   - Virtual scrolling for large lists
   - Progressive image loading
   - Code splitting by route

### Breakpoints

```css
/* Mobile: 320px - 460px */
/* Tablet: 461px - 768px */  
/* Desktop: 769px+ */
```

### Component Structure

```
components/
├── ui/                    # Unified responsive components
│   ├── cards/            # Card components (adapt to viewport)
│   ├── layout/           # Layout components (responsive grids)
│   └── forms/            # Form components (mobile-optimized)
├── mobile/               # Mobile-specific utilities (minimal)
│   ├── BottomSheet.tsx   # Mobile-only interactions
│   ├── PullToRefresh.tsx # Touch gestures
│   └── MobileLayout.tsx  # Safe area handling
└── _archive/             # Legacy components (not in use)
```

### Responsive Patterns

#### Grid Layouts
```tsx
// Adapts from 2 to 6 columns based on viewport
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
```

#### Typography
```tsx
// Scales text appropriately
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
```

#### Spacing
```tsx
// Responsive padding/margins
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
```

### Current Implementation Status

- ✅ **Homepage** - Fully responsive
- ✅ **Pokédex** - Responsive grid with virtual scrolling
- ✅ **TCG Sets** - Responsive card grids
- ✅ **Type Effectiveness** - Responsive table/card view
- ✅ **Most feature pages** - Using responsive design
- ⚠️ **Battle Simulator** - Still uses separate mobile component (to be unified)

### Utility Systems

All utilities are unified and work across all viewports:

- `utils/lazyLoad.tsx` - Code splitting and lazy loading
- `utils/animations.ts` - Consistent animations with reduced motion support
- `utils/accessibility.tsx` - WCAG compliant helpers
- `utils/apiOptimizations.ts` - API caching and optimization
- `utils/performanceMonitor.ts` - Performance tracking

### Production Build

The application compiles with:
- Zero TypeScript errors (strict mode)
- Optimized bundle size (~487KB First Load JS)
- Static pre-rendering where possible
- Dynamic server-side rendering for data pages

### Development

```bash
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint check
npm test                 # Run Playwright tests
npx tsc --noEmit        # TypeScript check
```