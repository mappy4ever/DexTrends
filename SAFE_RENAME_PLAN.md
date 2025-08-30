# Safe Rename Action Plan

Based on validation analysis, this document outlines ONLY the safe operations that won't break functionality.

## ⚠️ Critical Findings

### DO NOT MERGE These Files (Different Functionality)
1. **Animation Utilities** - Each serves different purpose:
   - `animation.ts` - Framer Motion variants
   - `animations.ts` - Comprehensive animation library
   - `animationVariants.ts` - Simple variant definitions
   - `animationOptimization.ts` - Performance optimization
   - `animationPerformance.ts` - DOM manipulation utilities

2. **Component "Duplicates"** - Actually different implementations:
   - 3 different ErrorBoundary components (different scopes)
   - 2 NotificationSystem components (different features)
   - 2 OptimizedImage components (different optimization strategies)
   - Multiple Button components (different design systems)

## ✅ Safe Operations Only

### Phase 1: Simple Renames (No Risk)
These are just naming corrections with NO functionality changes:

#### Utility Renames
```bash
# Fix inconsistent casing
utils/apiutils.ts → utils/apiUtils.ts

# Clarify purpose
utils/unifiedFetch.ts → utils/fetchService.ts
utils/pokemonTypeColors.ts → utils/typeColorConfig.ts
```

#### Page Renames (Routes)
```bash
# Kebab-case convention
pages/tcgsets.tsx → pages/tcg-sets.tsx
pages/tcgsets/[setid].tsx → pages/tcg-sets/[setid].tsx
pages/pocketmode/ → pages/pocket-mode/
```

### Phase 2: Card → Tile Renames (UI Clarity)
Only rename components that are NOT trading cards:

#### Safe to Rename
```bash
# UI containers, not TCG cards
components/ui/cards/GymLeaderCard.tsx → GymLeaderTile.tsx
components/ui/cards/CircularGymLeaderCard.tsx → GymLeaderAvatar.tsx
components/ui/cards/CircularPokemonCard.tsx → PokemonAvatar.tsx
components/ui/cards/EliteFourCard.tsx → EliteFourTile.tsx
components/ui/cards/ChampionCard.tsx → ChampionTile.tsx
```

#### KEEP as Card (Actual TCG)
```bash
# These ARE trading cards - keep the name
✓ FlippableTCGCard.tsx
✓ Enhanced3DCard.tsx (3D card viewer)
✓ TCGCardDetail.tsx
✓ CardComparisonTool.tsx
```

### Phase 3: Remove Confusing Prefixes
Only where it adds no value:

```bash
# Remove redundant prefixes
UnifiedGrid.tsx → Grid.tsx (if no other Grid exists)
UnifiedModal.tsx → Modal.tsx (after verifying no conflict)

# Standardize meaningful prefixes
EnhancedModal.tsx → SmartModal.tsx
SimplePokemonDisplay.tsx → BasePokemonDisplay.tsx
```

## 📋 Implementation Checklist

### Step 1: Backup
- [ ] Create git branch: `git checkout -b naming-standardization`
- [ ] Create full backup of current state
- [ ] Document current imports

### Step 2: Execute Safe Renames
- [ ] Run rename script for utilities (5 files)
- [ ] Update all imports automatically
- [ ] Verify TypeScript compilation

### Step 3: Card → Tile Migration
- [ ] Rename 5 confirmed UI containers
- [ ] Update imports across codebase
- [ ] Update any CSS module references
- [ ] Test affected pages

### Step 4: Page Route Updates
- [ ] Rename page files
- [ ] Update Next.js routing
- [ ] Add redirects for old routes
- [ ] Update navigation components

### Step 5: Validation
- [ ] Run full test suite
- [ ] Check TypeScript: `npx tsc --noEmit`
- [ ] Verify all pages load
- [ ] Check for console errors

## 🚫 What We're NOT Doing

1. **NOT merging** animation utilities (they do different things)
2. **NOT removing** any "duplicate" components without verification
3. **NOT renaming** TCG-related Card components
4. **NOT deleting** anything marked as "unimplemented feature"
5. **NOT merging** similar-named but different components

## 📊 Impact Analysis

### Safe Changes: 23 files
- 5 utility renames (casing/clarity)
- 5 Card→Tile renames (UI containers)
- 3 page renames (routes)
- 10 prefix standardizations

### At Risk (Need Review): 13 items
- Will be handled in separate PR after manual review

### Preserved: 40+ files
- All animation utilities (different functionality)
- All TCG Card components
- All "duplicate" components with different implementations

## 🔄 Rollback Plan

If issues arise:
1. `git checkout main`
2. Restore from backup
3. Document specific issue
4. Adjust plan accordingly

## ✅ Success Criteria

- Zero functionality broken
- All tests passing
- TypeScript compiles without errors
- Clear distinction between TCG cards and UI containers
- Consistent naming patterns established

## 📅 Timeline

- **Day 1**: Safe utility and page renames
- **Day 2**: Card → Tile migrations
- **Day 3**: Testing and validation
- **Day 4**: Documentation updates

## Notes

This plan is intentionally conservative. We're prioritizing stability over aggressive cleanup. Once these safe changes are complete and validated, we can revisit the more complex consolidations with better understanding.

Remember: **When in doubt, don't merge or delete!**