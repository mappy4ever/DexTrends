# Unused Code Audit - DexTrends

## Purpose
This audit identifies which code is truly unused (redundant/duplicate) versus unimplemented features that should be kept.

## Categories

### ✅ SAFE TO REMOVE - Truly Unused/Redundant

1. **Duplicate Imports**
   - Multiple imports of the same module in a file
   - Imports that are replaced by other imports (e.g., importing both a function and the module it comes from)

2. **Replaced Functionality**
   - Old implementations replaced by new ones
   - Legacy code superseded by unified architecture

3. **Dead Variables**
   - Variables declared but never referenced
   - State variables that are set but never read

### ⚠️ KEEP - Unimplemented Features

1. **Battle Simulator Features**
   - `searchQuery`, `setSearchQuery` - Likely for Pokemon search functionality
   - `showQuickPicker` - Quick selection UI feature
   - `battleState` - Battle progress tracking
   - These appear to be planned features not yet wired up

2. **Mobile Gestures** 
   - Touch handlers in BottomSheet (handleTouchStart, handleTouchMove, handleTouchEnd)
   - These might be for gesture-based interactions not yet implemented

3. **Navigation Features**
   - `hoverExpanded` in Navbar - Hover state for desktop
   - `dropdownRefs` - Dropdown menu references
   - These could be for enhanced navigation UX

4. **Card Features**
   - `onRarityClick` in CardList - Click handler for rarity filtering
   - Could be a planned feature for filtering by rarity

### 🔍 NEEDS INVESTIGATION

1. **Error Boundary**
   - `useResetOnRouteChange` - Might be important for error recovery
   - Need to check if error boundaries should reset on navigation

2. **Type Imports**
   - Some type-only imports marked as unused
   - TypeScript sometimes needs these for proper type inference

## Recommendations

1. **DO NOT bulk remove "unused" code**
2. **Check each item individually:**
   - Is it referenced elsewhere?
   - Is it a planned feature?
   - Is it needed for TypeScript types?
   - Is it a fallback/safety mechanism?

3. **Safe cleanup targets:**
   - Console.log statements (already done)
   - Duplicate imports of the same thing
   - Old commented-out code
   - Variables that are truly never used anywhere

4. **Keep for now:**
   - Anything that looks like a planned feature
   - Error handling code
   - Type imports
   - Utility functions that might be used later

## Files to Review Carefully

1. `components/battle-simulator/MobileBattleSimulator.tsx`
   - Has search and quick picker features that may be unimplemented

2. `components/mobile/BottomSheet.tsx`
   - Touch gesture handlers might be for future enhancements

3. `components/Navbar.tsx`
   - Hover and dropdown features might be partially implemented

4. `components/CardList.tsx`
   - Rarity click handler might be a planned feature

## Next Steps

1. Review each "unused" item against this criteria
2. Only remove truly redundant code
3. Document unimplemented features for future development
4. Consider adding TODO comments for unimplemented features instead of removing them