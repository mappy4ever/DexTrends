# TCG Dense Grid Layout Fix

## Problem
Cards were displaying correctly at first (dense grid), then flashing and becoming large (only 4 columns).

## Root Cause
1. Initial render: `containerRef` is null, so `containerWidth` defaults to 1200px → correct dense grid
2. After mount: `containerRef` gets set, actual container width is used (often smaller) → fewer columns calculated
3. Result: Cards resize to fill the reduced column count, appearing larger

## Solution Implemented

### 1. **Use Viewport Width Instead of Container Width**
```typescript
const effectiveWidth = Math.max(viewportWidth, 1400); // Minimum 1400px
```
- Always use at least 1400px for column calculations
- Prevents container constraints from affecting grid density

### 2. **Lock Initial Column Count**
```typescript
useEffect(() => {
  if (actualColumnCount > 4 && !initialColumnCount) {
    setInitialColumnCount(actualColumnCount);
  }
}, [actualColumnCount, initialColumnCount]);

const finalColumnCount = initialColumnCount || actualColumnCount;
```
- Captures the initial (correct) column count
- Prevents reduction when container ref updates
- Ensures grid stays dense after mount

### 3. **Enhanced Debug Logging**
Added detailed logging to track:
- Container width vs viewport width
- Effective width used for calculations
- Initial vs final column counts
- When container ref changes

## Console Output
You'll now see:
```
Container ref set. Width: 1200 Viewport: 1440
Locking initial column count: 9
VirtualizedCardGrid State: {
  containerWidth: 1200,
  viewportWidth: 1440,
  effectiveWidth: 1440,
  calculatedColumns: 9,
  actualColumns: 9,
  finalColumns: 9,
  initialLocked: 9,
  ...
}
```

## Result
- No more flashing
- Cards maintain dense grid layout (8-10+ columns on desktop)
- Consistent layout regardless of container constraints
- Better Pokemon TCG Pocket-style appearance