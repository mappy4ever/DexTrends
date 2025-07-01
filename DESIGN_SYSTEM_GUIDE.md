# DexTrends Mobile Design System Guide

## Overview

The DexTrends design system is a sophisticated, mobile-first design framework optimized for iPhone displays. It emphasizes clean, professional aesthetics without emojis, ensuring WCAG AA compliance and native iOS feel.

## Core Design Principles

1. **Clean & Professional**: No tacky colors or emojis
2. **Mobile-First**: Optimized for iPhone SE (375px) to Pro Max (430px)
3. **Accessibility**: WCAG AA compliant with proper contrast ratios
4. **Touch-Friendly**: All interactive elements meet iOS 44px minimum
5. **Performance**: GPU-accelerated animations and optimized shadows

## Design Tokens

### Typography Scale (Mobile-Optimized)

```css
/* Base sizes - adjusted for iPhone displays */
--text-2xs: 0.625rem;   /* 10px - Micro labels */
--text-xs: 0.6875rem;   /* 11px - Small labels */
--text-sm: 0.8125rem;   /* 13px - Secondary text */
--text-base: 0.9375rem; /* 15px - Body text (iOS optimal) */
--text-lg: 1.0625rem;   /* 17px - Emphasized text */
--text-xl: 1.25rem;     /* 20px - Section headers */
--text-2xl: 1.5rem;     /* 24px - Page headers */
--text-3xl: 1.75rem;    /* 28px - Major headers */
--text-4xl: 2rem;       /* 32px - Hero text */

/* Dynamic type for accessibility */
--text-dynamic-base: clamp(0.875rem, 3vw, 1rem);
```

### Spacing System (4px Grid)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-7: 1.75rem;   /* 28px */
--space-8: 2rem;      /* 32px */
--space-9: 2.25rem;   /* 36px */
--space-10: 2.5rem;   /* 40px */
--space-11: 2.75rem;  /* 44px - iOS touch target */
--space-12: 3rem;     /* 48px */

--touch-target: 44px; /* iOS minimum touch target */
```

### Color Palette

```css
/* Primary Colors - Used Sparingly */
--pokemon-red: #DC2626;
--pokemon-blue: #2563EB;
--pokemon-yellow: #F59E0B;
--pokemon-green: #059669;

/* Neutral Scale */
--white: #FFFFFF;
--off-white: #FAFAFA;
--light-grey: #F5F5F5;
--mid-grey: #E5E7EB;
--border-grey: #D1D5DB;
--text-grey: #6B7280;
--dark-text: #374151;
--charcoal: #1F2937;
--black: #111827;
```

### iOS-Optimized Shadows

```css
/* Standard shadows */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08);

/* iOS-style elevation */
--elevation-1: 0 1px 3px rgba(0, 0, 0, 0.12);
--elevation-2: 0 3px 6px rgba(0, 0, 0, 0.15);
--elevation-3: 0 10px 20px rgba(0, 0, 0, 0.15);
```

## iPhone-Specific Breakpoints

```css
/* iPhone SE */
@media (max-width: 375px) { }

/* iPhone Standard (12/13/14) */
@media (min-width: 376px) and (max-width: 390px) { }

/* iPhone Plus */
@media (min-width: 391px) and (max-width: 414px) { }

/* iPhone Pro Max */
@media (min-width: 415px) and (max-width: 430px) { }

/* Landscape Mode */
@media (max-height: 414px) and (orientation: landscape) { }
```

## Component Patterns

### iOS-Style Buttons

```html
<!-- Primary Button -->
<button class="btn-ios btn-ios-primary">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="btn-ios btn-ios-secondary">
  Secondary Action
</button>

<!-- Ghost Button -->
<button class="btn-ios btn-ios-ghost">
  Ghost Action
</button>
```

### iOS-Style Cards

```html
<!-- Basic Card -->
<div class="card-ios">
  <h3 class="font-medium mb-2">Card Title</h3>
  <p class="text-sm text-gray-600">Card content</p>
</div>

<!-- Interactive Card -->
<div class="card-ios mobile-card cursor-pointer">
  <!-- Content -->
</div>
```

### iOS Form Inputs

```html
<!-- Text Input -->
<input type="text" class="input-ios" placeholder="Enter text...">

<!-- Select -->
<select class="input-ios select-ios">
  <option>Choose option...</option>
</select>

<!-- All inputs use 16px font to prevent iOS zoom -->
```

### Navigation Components

```html
<!-- iOS Navigation Bar -->
<div class="navbar-ios">
  <div class="navbar-ios-content">
    <!-- Navigation content -->
  </div>
</div>

<!-- iOS Tab Bar -->
<div class="tabbar-ios">
  <div class="tabbar-ios-content">
    <div class="tabbar-ios-item active">Home</div>
    <div class="tabbar-ios-item">Cards</div>
  </div>
</div>
```

## Responsive Grid System

```html
<!-- iPhone SE (2 columns) -->
<div class="grid grid-iphone-se">
  <!-- Grid items -->
</div>

<!-- iPhone Pro Max (3 columns) -->
<div class="grid grid-iphone-max">
  <!-- Grid items -->
</div>

<!-- Auto-responsive -->
<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
  <!-- Grid items -->
</div>
```

## Touch Optimizations

### Touch Targets

All interactive elements must meet the 44px minimum:

```html
<!-- Ensure touch targets -->
<button class="touch-target">
  <svg class="w-6 h-6"><!-- Icon --></svg>
</button>

<!-- Expand touch area without visual change -->
<a class="touch-target relative">
  Small Link
</a>
```

### Touch Feedback

```html
<!-- Ripple effect on touch -->
<button class="touch-feedback btn-ios">
  Tap Me
</button>

<!-- Scale feedback -->
<div class="mobile-card">
  <!-- Scales to 0.98 on press -->
</div>
```

## Performance Utilities

### GPU Acceleration

```html
<!-- For smooth animations -->
<div class="gpu-accelerate">
  <!-- Animated content -->
</div>
```

### Smooth Scrolling

```html
<!-- iOS-optimized scrolling -->
<div class="smooth-scroll overflow-auto">
  <!-- Scrollable content -->
</div>
```

### Containment

```html
<!-- Optimize rendering -->
<div class="contain-paint">
  <!-- Complex content -->
</div>
```

## Accessibility Features

### WCAG AA Compliance

```html
<!-- Proper contrast ratios -->
<div class="contrast-aa">
  Normal text (4.5:1 minimum)
</div>

<div class="contrast-aa-large">
  Large text (3:1 minimum)
</div>
```

### Focus States

```html
<!-- Visible focus indicators -->
<button class="focus-visible">
  Keyboard Accessible
</button>
```

### Screen Reader Support

```html
<!-- Hidden but accessible -->
<span class="sr-only">Screen reader text</span>

<!-- Focusable when needed -->
<a class="sr-only sr-only-focusable">Skip to content</a>
```

## Implementation Examples

### Mobile-First Card Component

```jsx
import React from 'react';
import { TypeBadge } from './TypeBadge';

const MobileCard = ({ card }) => (
  <div className="card-ios mobile-card p-4">
    <div className="aspect-[3/4] relative mb-3 rounded-lg overflow-hidden">
      {/* Card image */}
    </div>
    
    <h3 className="font-medium text-base line-clamp-1">
      {card.name}
    </h3>
    
    <div className="flex gap-1 mt-2">
      {card.types.map(type => (
        <TypeBadge key={type} type={type} size="sm" />
      ))}
    </div>
  </div>
);
```

### Touch-Optimized List Item

```jsx
const ListItem = ({ item, onClick }) => (
  <div 
    className="flex items-center gap-3 p-3 bg-white rounded-lg touch-target cursor-pointer active:bg-gray-50"
    onClick={onClick}
  >
    <div className="flex-1">
      <h4 className="font-medium text-sm">{item.title}</h4>
      <p className="text-xs text-gray-600">{item.subtitle}</p>
    </div>
    <svg className="w-4 h-4 text-gray-400">
      {/* Chevron icon */}
    </svg>
  </div>
);
```

## Best Practices

1. **Always use 16px minimum font size for inputs** to prevent iOS zoom
2. **Ensure 44px minimum touch targets** for all interactive elements
3. **Use CSS variables** for consistent theming
4. **Apply touch-action: manipulation** to prevent delays
5. **Test on real devices** - iPhone SE to Pro Max
6. **Optimize animations** with GPU acceleration
7. **Use proper semantic HTML** for accessibility
8. **Implement safe area padding** for notched devices

## Testing Checklist

- [ ] All touch targets are at least 44x44px
- [ ] Text is readable without zooming (16px minimum)
- [ ] Contrast ratios meet WCAG AA standards
- [ ] Forms don't zoom on focus (16px font size)
- [ ] Animations run at 60fps
- [ ] Safe areas are respected on notched devices
- [ ] Landscape mode is properly handled
- [ ] Dark mode maintains proper contrast
- [ ] Focus indicators are clearly visible
- [ ] Content is accessible via screen readers