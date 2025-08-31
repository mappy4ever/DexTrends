# React Hook Dependency Warning Fixes

This document lists all React Hook dependency warnings and recommended fixes. These warnings can lead to bugs where components use stale values.

## Critical Fixes (Functions that should be wrapped in useCallback)

### 1. CollectionManager.tsx
```typescript
// Line 152: createCollection should be wrapped in useCallback
const createCollection = useCallback(async (name: string) => {
  // ... implementation
}, []); // Add dependencies as needed

// Line 376: updateCollection should be wrapped in useCallback  
const updateCollection = useCallback(async (id: string, updates: any) => {
  // ... implementation
}, []); // Add dependencies as needed
```

### 2. GlobalSearchModal.tsx (Line 65)
```typescript
// Instead of passing debounce directly, create inline function
const debouncedSearch = useCallback(
  debounce((query: string) => {
    // search logic
  }, 300),
  [] // dependencies
);
```

## useEffect Missing Dependencies

### High Priority (Can cause bugs)

1. **pages/battle-simulator.tsx**
   - Lines 254, 265: Add `calculateAllStats` to dependencies
   - Lines 555, 564: Add `loadMoveData` to dependencies

2. **pages/pokedex.tsx** (Line 534)
   - Add `fetchPokemonBatch`, `isStarter`, `loadRemainingPokemon` to dependencies

3. **components/ui/EnhancedCardInteractions.tsx** (Line 334)
   - Store `animationFrameRef.current` in a variable inside useEffect

### Medium Priority

1. **pages/_app.tsx** (Line 107)
   - Add `isScrolling` to dependencies or use a ref

2. **pages/type-effectiveness.tsx** (Line 109) 
   - Add `loadTypeData` to dependencies

3. **components/CollectionManager.tsx**
   - Line 65: Add `loadCollections`
   - Line 71: Add `calculatePortfolioValue`

## useCallback/useMemo Missing Dependencies

### Functions that reference state/props

1. **components/mobile/GestureCardSorting.tsx** (Line 79)
   ```typescript
   const sortGestures = useMemo(() => ({
     // gesture definitions
   }), []); // Add dependencies
   ```

2. **components/mobile/VoiceSearch.tsx** (Line 63)
   ```typescript
   const voiceCommands = useMemo(() => ({
     // command definitions  
   }), []); // Add dependencies
   ```

## Common Patterns for Fixes

### 1. For Functions Called in useEffect
```typescript
// Before
useEffect(() => {
  loadData();
}, []);

// After - Option 1: Add to dependencies
useEffect(() => {
  loadData();
}, [loadData]);

// After - Option 2: Define inside useEffect
useEffect(() => {
  const loadData = async () => {
    // implementation
  };
  loadData();
}, []);
```

### 2. For Event Handlers
```typescript
// Wrap in useCallback to prevent recreating on every render
const handleClick = useCallback(() => {
  // handler logic
}, [/* dependencies */]);
```

### 3. For Complex Objects
```typescript
// Use useMemo for objects/arrays created from props/state
const config = useMemo(() => ({
  key: value,
  // ...
}), [value]);
```

## Safe to Ignore (Add eslint-disable comment)

Some warnings can be safely ignored when:
- The function is guaranteed to be stable (from context/props)
- You explicitly want to run effect only once
- Adding dependency would cause infinite loops

Example:
```typescript
useEffect(() => {
  // One-time initialization
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

## Testing After Fixes

After applying fixes:
1. Run `npm run lint` to verify warnings are resolved
2. Test affected components thoroughly
3. Watch for infinite render loops
4. Verify state updates work correctly

## Priority Order

1. Fix functions that should be wrapped in useCallback/useMemo
2. Fix useEffect dependencies that reference changing values
3. Add stable dependencies (refs, constants)
4. Document any intentional exclusions with comments