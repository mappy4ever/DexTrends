# iOS & Mobile Development Guide

## Overview
This guide consolidates all iOS and mobile development standards, best practices, and implementation details for the DexTrends project.

## Device Specifications & Safe Areas

### Current iOS Device Matrix (2025)
| Device | Viewport | Safe Area Insets | Status Bar |
|--------|----------|------------------|------------|
| iPhone 15 Pro Max | 430x932 | top: 59px, bottom: 34px | Dynamic Island |
| iPhone 15/14 | 393x852 | top: 47px, bottom: 34px | Notch |
| iPhone SE 3 | 375x667 | top: 20px, bottom: 0px | Traditional |
| iPhone 13 mini | 375x812 | top: 44px, bottom: 34px | Notch |

### Implementation Standards

#### 1. Safe Area Implementation
```css
/* Use CSS environment variables for safe areas */
.container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* With fallbacks */
.safe-container {
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
}
```

#### 2. Touch Targets
- **Minimum**: 44x44px (iOS HIG requirement)
- **Recommended**: 48x48px for comfortable interaction
- **Implementation**:
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### 3. Input Zoom Prevention
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

```css
/* Prevent zoom on input focus */
input, select, textarea {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

## Performance Standards

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Frame Rate**: 60 FPS (minimum 55 FPS acceptable)
- **Bundle Size**: < 300KB (gzipped)
- **Memory Usage**: < 100MB active

### Optimization Techniques

#### 1. Image Optimization
```jsx
// Use Next.js Image component with proper sizing
<Image
  src={imagePath}
  alt={alt}
  width={300}
  height={300}
  sizes="(max-width: 768px) 100vw, 300px"
  quality={85}
  placeholder="blur"
/>
```

#### 2. Touch Gesture Optimization
```css
/* Disable touch delays */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

/* Smooth scrolling with momentum */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

#### 3. Animation Performance
```css
/* Use transform and opacity for animations */
.animate {
  will-change: transform;
  transform: translateZ(0); /* Force GPU acceleration */
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Component Guidelines

### Mobile-First Components
1. **Always start with mobile layout**
2. **Use CSS Grid/Flexbox for responsive layouts**
3. **Implement touch gestures where appropriate**
4. **Ensure all interactive elements are accessible**

### Example Mobile Component Structure
```jsx
const MobileComponent = () => {
  return (
    <div className="mobile-container">
      <header className="mobile-header safe-area-top">
        {/* Header content */}
      </header>
      
      <main className="mobile-content">
        {/* Scrollable content */}
      </main>
      
      <nav className="mobile-nav safe-area-bottom">
        {/* Navigation */}
      </nav>
    </div>
  );
};
```

## CSS Architecture

### Mobile CSS Variables
```css
:root {
  /* Spacing */
  --mobile-padding: 16px;
  --mobile-margin: 12px;
  --safe-area-padding: max(var(--mobile-padding), env(safe-area-inset-left));
  
  /* Typography */
  --mobile-font-base: 16px;
  --mobile-font-small: 14px;
  --mobile-font-large: 20px;
  
  /* Touch targets */
  --touch-target-min: 44px;
  --touch-target-comfortable: 48px;
  
  /* Animations */
  --mobile-transition: 200ms ease-out;
  --mobile-animation-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Responsive Breakpoints
```css
/* Mobile-first breakpoints */
@media (min-width: 375px) { /* iPhone SE and up */ }
@media (min-width: 390px) { /* iPhone 14 and up */ }
@media (min-width: 428px) { /* iPhone Pro Max */ }
@media (min-width: 768px) { /* iPad and up */ }
```

## Testing Requirements

### Manual Testing Checklist
- [ ] Safe areas respected on all devices
- [ ] Touch targets meet 44px minimum
- [ ] No input zoom on focus
- [ ] Smooth scrolling with momentum
- [ ] Animations run at 60 FPS
- [ ] Gestures work as expected
- [ ] Landscape orientation handled
- [ ] PWA features functional

### Automated Testing
```javascript
// Example Playwright test for mobile
test('mobile navigation works', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  
  // Test touch interactions
  await page.tap('.mobile-menu-button');
  await expect(page.locator('.mobile-menu')).toBeVisible();
});
```

## Quick Fixes Reference

### Common Issues & Solutions

#### 1. Fixed Elements Behind Notch
```css
.fixed-header {
  position: fixed;
  top: 0;
  padding-top: env(safe-area-inset-top);
}
```

#### 2. Keyboard Overlap
```javascript
// Adjust viewport when keyboard shows
window.visualViewport?.addEventListener('resize', () => {
  document.documentElement.style.setProperty(
    '--viewport-height',
    `${window.visualViewport.height}px`
  );
});
```

#### 3. Rubber Band Scrolling
```css
html {
  position: fixed;
  height: 100%;
  overflow: hidden;
}

body {
  position: fixed;
  height: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
```

## Runtime Fixes

The project includes `public/js/iosFixes.js` for runtime iOS adjustments:
- Dynamic viewport height calculation
- Safe area padding updates
- Touch event optimizations
- Scroll behavior improvements

## Known Issues & Workarounds

1. **iOS 15+ Focus Zoom**: Despite font-size: 16px, some inputs still zoom. Use maximum-scale=1 in viewport meta.
2. **Dynamic Island**: Test thoroughly on iPhone 14 Pro/15 Pro devices for proper content positioning.
3. **PWA Status Bar**: Use apple-mobile-web-app-status-bar-style meta tag for proper styling.

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WebKit Feature Status](https://webkit.org/status/)
- [Can I Use - Mobile Features](https://caniuse.com/)

---

Last Updated: January 2025
Maintained in: `/project-resources/docs/iOS_MOBILE_DEVELOPMENT_GUIDE.md`