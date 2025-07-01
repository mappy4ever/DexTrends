# iOS Quick Fixes Reference Guide

## Common iOS/iPhone Issues and Solutions

### 1. Safe Area Issues

#### Problem: Content hidden behind notch/Dynamic Island
```css
/* ❌ Wrong */
.header {
  position: fixed;
  top: 0;
  height: 60px;
}

/* ✅ Correct */
.header {
  position: fixed;
  top: 0;
  padding-top: env(safe-area-inset-top);
  height: 60px;
}
```

#### Problem: Bottom navigation overlaps home indicator
```css
/* ✅ Solution */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
  /* Fallback for older browsers */
  padding-bottom: constant(safe-area-inset-bottom);
}
```

### 2. Input Zoom Issues

#### Problem: Input fields zoom on focus
```css
/* ❌ Wrong - causes zoom */
input, textarea, select {
  font-size: 14px;
}

/* ✅ Correct - prevents zoom */
input, textarea, select {
  font-size: 16px; /* Minimum to prevent zoom */
}

/* Alternative with meta tag */
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```

### 3. Touch Target Size

#### Problem: Buttons too small to tap reliably
```css
/* ✅ Ensure 44x44 point minimum */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* For smaller visual elements, increase tap area */
.small-icon {
  position: relative;
  padding: 12px; /* Increases tap area without visual size */
}
```

### 4. Scroll Performance

#### Problem: Janky scrolling
```css
/* ✅ Enable momentum scrolling */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Optimize for performance */
.scroll-container {
  will-change: scroll-position;
  transform: translateZ(0); /* Force GPU acceleration */
  backface-visibility: hidden;
}
```

### 5. Fixed Positioning Issues

#### Problem: Fixed elements jump with keyboard
```javascript
// ✅ Solution: Detect keyboard and adjust
const handleViewportChange = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', handleViewportChange);
window.addEventListener('orientationchange', handleViewportChange);

// CSS usage
.full-height {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
```

### 6. Tap Highlight

#### Problem: Ugly gray box on tap
```css
/* ✅ Remove tap highlight */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Add custom feedback */
.button:active {
  transform: scale(0.95);
  opacity: 0.8;
}
```

### 7. Viewport Configuration

#### Complete viewport meta tag
```html
<meta name="viewport" content="
  width=device-width,
  initial-scale=1,
  viewport-fit=cover,
  user-scalable=no,
  shrink-to-fit=no
">
```

### 8. PWA Status Bar

#### Problem: Status bar styling in standalone mode
```html
<!-- iOS specific -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">

<!-- For notched devices -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### 9. Rubber Band Scrolling

#### Problem: Unwanted bounce on scroll boundaries
```css
/* ✅ Disable bounce on specific elements */
.no-bounce {
  overscroll-behavior: contain;
}

/* For the entire page */
html, body {
  overscroll-behavior: none;
}
```

### 10. Image Rendering

#### Problem: Blurry images on Retina displays
```html
<!-- ✅ Use srcset for responsive images -->
<img 
  src="image.jpg"
  srcset="image.jpg 1x, image@2x.jpg 2x, image@3x.jpg 3x"
  alt="Description"
>

<!-- CSS solution -->
.retina-image {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
```

### 11. Font Smoothing

#### Problem: Fonts look different on iOS
```css
/* ✅ iOS font smoothing */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 12. Landscape Safe Areas

#### Problem: Content hidden in landscape mode
```css
/* ✅ Handle landscape orientation */
@supports (padding: max(0px)) {
  .container {
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
  }
}
```

### 13. Modal/Dialog Issues

#### Problem: Modal doesn't respect safe areas
```css
/* ✅ Safe area aware modal */
.modal {
  position: fixed;
  inset: 0;
  padding: env(safe-area-inset-top) 
           env(safe-area-inset-right) 
           env(safe-area-inset-bottom) 
           env(safe-area-inset-left);
}
```

### 14. CSS Environment Variables

#### Complete list of iOS environment variables
```css
:root {
  /* Safe area insets */
  --safe-top: env(safe-area-inset-top);
  --safe-right: env(safe-area-inset-right);
  --safe-bottom: env(safe-area-inset-bottom);
  --safe-left: env(safe-area-inset-left);
  
  /* Keyboard insets (iOS 15+) */
  --keyboard-height: env(keyboard-inset-height);
}
```

### 15. Performance Optimizations

#### Reduce repaints and reflows
```css
/* ✅ Use transform instead of position */
.animated {
  transform: translateX(100px); /* GPU accelerated */
  /* Instead of: left: 100px; */
}

/* Contain layout calculations */
.card-container {
  contain: layout style paint;
}
```

## Testing Checklist

### Quick Manual Tests
1. [ ] Rotate device - check layout
2. [ ] Open keyboard - check fixed elements
3. [ ] Swipe from edges - check gestures
4. [ ] Pinch to zoom - should be disabled on UI
5. [ ] Long press - check for unwanted callouts
6. [ ] Double tap - check for unwanted zoom
7. [ ] Check in Safari private mode
8. [ ] Test with low power mode enabled
9. [ ] Verify with increased text size
10. [ ] Test with VoiceOver enabled

## Device-Specific Considerations

### iPhone SE (2nd/3rd gen)
- Width: 375px
- No notch, traditional status bar
- Smaller viewport requires compact layouts

### iPhone 12 mini / 13 mini
- Width: 375px
- Has notch
- Same width as SE but taller

### iPhone 12/13/14
- Width: 390px
- Has notch
- Standard size for testing

### iPhone 14 Pro/Pro Max
- Width: 393px (Pro), 430px (Pro Max)
- Dynamic Island instead of notch
- Requires special handling for top area

## Debugging Tools

### Safari Developer Tools
1. Connect iPhone to Mac
2. Enable Web Inspector on iPhone (Settings > Safari > Advanced)
3. Open Safari on Mac > Develop menu > Select device
4. Use Responsive Design Mode for quick testing

### Console Debugging
```javascript
// Check safe area values
console.log('Safe area insets:', {
  top: getComputedStyle(document.documentElement).getPropertyValue('--safe-top'),
  right: getComputedStyle(document.documentElement).getPropertyValue('--safe-right'),
  bottom: getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom'),
  left: getComputedStyle(document.documentElement).getPropertyValue('--safe-left')
});

// Check viewport dimensions
console.log('Viewport:', {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
});
```

## Common Mistakes to Avoid

1. **Don't use 100vh** - Use CSS custom properties instead
2. **Don't disable zoom entirely** - Accessibility issue
3. **Don't use fixed pixel values** - Use env() for safe areas
4. **Don't ignore landscape mode** - Test both orientations
5. **Don't assume one size** - Test on multiple devices
6. **Don't skip physical device testing** - Simulators aren't enough
7. **Don't use -webkit prefixes only** - Include standard properties
8. **Don't ignore performance** - iOS users expect 60fps

## Emergency Fixes

### When nothing else works:
```css
/* Nuclear option for safe areas */
* {
  box-sizing: border-box;
  padding-left: env(safe-area-inset-left) !important;
  padding-right: env(safe-area-inset-right) !important;
}

/* Force GPU acceleration on everything */
* {
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
}
```

Remember: These are last resorts. Proper implementation is always better than quick fixes.