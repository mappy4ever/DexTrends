# Mouse Event Error Fix - Regions Page

## Problem
When hovering over navigation buttons on the regions page, a React error appears:
```
onMouseLeave@
executeDispatch@
runWithFiberInDEV@
processDispatchQueue@
```

The error doesn't disrupt functionality but appears in the console.

## Root Cause
The `RegionHero.js` component is directly manipulating DOM element styles in event handlers:

```javascript
onMouseLeave={(e) => {
  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
}}
```

This pattern can cause React Fiber errors because React expects style changes to go through state updates.

## Solution
Convert the direct DOM manipulation to React state-based styling:

```javascript
const [isHovered, setIsHovered] = useState(false);

<button
  style={{
    backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
    transform: `translateY(-50%) scale(${isHovered ? 1.1 : 1})`,
    transition: 'all 0.3s ease',
    // ... other styles
  }}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
```

## Affected Files
1. `/components/regions/RegionHero.js` - Lines 167 and 202
2. Possibly other region components with similar patterns

## Temporary Workaround
Since the error doesn't break functionality:
1. Users can ignore the console error
2. The visual effects still work correctly
3. Fix can be applied during the next refactoring phase

## Prevention
When migrating to TypeScript or refactoring:
- Avoid direct DOM manipulation in React components
- Use state for dynamic styling
- Consider using CSS classes with hover states instead of JavaScript