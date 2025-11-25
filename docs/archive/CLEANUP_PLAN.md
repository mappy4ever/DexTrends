# CLEANUP_PLAN.md - Component Consolidation Strategy

## Executive Summary
**Goal**: Reduce ~300 components to ~80-100 through systematic consolidation
**Timeline**: Phase 7 implementation (current)
**Impact**: 66% code reduction, improved maintainability, unified architecture

## Current State Analysis

### Component Count Breakdown
```
Total Components: ~300
Duplicate Rate: 66% (~200 duplicates)
Target Count: 80-100
Reduction Goal: 67-73%
```

### Critical Problem Areas
1. **Modal Explosion**: 17 variants → consolidate to 4
2. **Card Confusion**: 49 components → reduce to ~10
3. **Skeleton Chaos**: 11 systems → merge to 2
4. **Button Bloat**: 8 variants → simplify to 3
5. **Layout Labyrinth**: 15 wrappers → streamline to 4

## Phase 7: Consolidation Plan

### Stage 1: Modal Consolidation (Week 1)

#### Current Modal Components (17)
```
/components/ui/Modal.tsx ✅ KEEP (base)
/components/ui/ModalV2.tsx ❌ DELETE
/components/ui/ModalV3.tsx ❌ DELETE
/components/ui/EnhancedModal.tsx ❌ DELETE
/components/ui/AdvancedModal.tsx ❌ DELETE
/components/ui/UnifiedModal.tsx ❌ DELETE
/components/modals/BaseModal.tsx ❌ DELETE
/components/modals/SimpleModal.tsx ❌ DELETE
/components/modals/ComplexModal.tsx ❌ DELETE
/components/mobile/MobileModal.tsx ❌ DELETE
/components/desktop/DesktopModal.tsx ❌ DELETE
/components/overlays/Overlay.tsx ❌ DELETE
/components/overlays/ModalOverlay.tsx ❌ DELETE
/components/dialogs/Dialog.tsx ⚠️ MERGE features
/components/dialogs/AlertDialog.tsx ⚠️ MERGE as variant
/components/dialogs/ConfirmDialog.tsx ⚠️ MERGE as variant
/components/popovers/Popover.tsx ✅ KEEP (different purpose)
```

#### Target Modal Architecture
```typescript
// 4 components total:
Modal.tsx         // Base modal with all features
Popover.tsx       // Floating UI elements
Sheet.tsx         // Side/bottom sheets
Toast.tsx         // Notifications
```

### Stage 2: Card Component Cleanup (Week 1-2)

#### Naming Strategy
```typescript
// UI Containers (~/components/ui/)
Card.tsx              // Basic container with shadow
CardGrid.tsx          // Grid layout for cards
CardCarousel.tsx      // Carousel display

// TCG Cards (~/components/tcg/)
TCGCard.tsx           // Trading card display
TCGCardDetails.tsx    // Detailed view
TCGCardGrid.tsx       // Grid of TCG cards

// Pokemon Info (~/components/pokemon/)
PokemonInfo.tsx       // Pokemon data display
PokemonStats.tsx      // Stats visualization
PokemonEvolution.tsx  // Evolution chain
```

#### Components to Delete
```
❌ SimpleCardWrapper (misleading - actually complex)
❌ AdvancedCard
❌ EnhancedCardDisplay
❌ UnifiedCard
❌ CardComponent2
❌ CardVariant3
❌ MobileCard
❌ DesktopCard
❌ ResponsiveCard (all should be responsive)
```

### Stage 3: Skeleton System Unification (Week 2)

#### Current Chaos (11 systems)
```
/components/ui/Skeleton.tsx ✅ KEEP
/components/ui/SkeletonCard.tsx ❌ DELETE (use Skeleton)
/components/ui/SkeletonGrid.tsx ❌ DELETE (use Skeleton)
/components/ui/loading/Skeleton.tsx ❌ DELETE
/components/ui/loading/CardSkeleton.tsx ❌ DELETE
/components/skeletons/* ❌ DELETE ALL
/components/mobile/MobileSkeleton.tsx ❌ DELETE
```

#### Target Architecture
```typescript
// 2 components only:
Skeleton.tsx      // Base skeleton with shape variants
SkeletonTheme.tsx // Theme provider for skeletons
```

### Stage 4: Mobile Directory Deletion (Week 2)

#### Action Items
1. **Audit** `/components/mobile/` for unique features
2. **Merge** unique features into base components
3. **Delete** entire `/components/mobile/` directory
4. **Update** all imports to use unified components

#### Migration Map
```typescript
// Before
import MobileLayout from '@/components/mobile/MobileLayout';
// After
import Layout from '@/components/Layout';

// Before
{isMobile ? <MobileCard /> : <DesktopCard />}
// After
<Card className="w-full md:w-1/2" />
```

### Stage 5: Form Component Standardization (Week 3)

#### Keep These (Already Updated)
```
✅ /components/ui/Select.tsx (390 lines, adaptive)
✅ /components/ui/Checkbox.tsx (220 lines, spring animations)
✅ /components/ui/Radio.tsx (280 lines, managed state)
✅ /components/ui/Switch.tsx (new, accessible)
```

#### Delete These Duplicates
```
❌ /components/forms/*
❌ /components/inputs/*
❌ /components/ui/form/*
❌ Any *V2, *V3 variants
```

### Stage 6: Layout System Simplification (Week 3)

#### Target Layout Components (4 total)
```typescript
Layout.tsx           // Main app layout
PageLayout.tsx       // Page-specific layout
GridLayout.tsx       // Responsive grid system
FlexLayout.tsx       // Flexbox utilities
```

#### Delete These
```
❌ MobileLayout
❌ DesktopLayout
❌ TabletLayout
❌ ResponsiveLayout
❌ AdvancedLayout
❌ EnhancedLayout
❌ UnifiedLayout
❌ SimpleLayout
❌ ComplexLayout
❌ All numbered variants
```

## Implementation Strategy

### Step-by-Step Process

#### For Each Component Group:
1. **Audit** - List all variants and their usage
2. **Analyze** - Identify unique features to preserve
3. **Merge** - Combine features into base component
4. **Test** - Verify no functionality lost
5. **Migrate** - Update all imports
6. **Delete** - Remove duplicate files
7. **Verify** - Run type check and tests

### Migration Script Template
```bash
# Example for Modal consolidation
grep -r "ModalV2" --include="*.tsx" --include="*.ts" | cut -d: -f1 | xargs -I {} sed -i '' 's/ModalV2/Modal/g' {}
grep -r "import.*ModalV2" --include="*.tsx" --include="*.ts" | cut -d: -f1 | xargs -I {} sed -i '' 's|components/ui/ModalV2|components/ui/Modal|g' {}
```

### Testing Requirements
```bash
# After each consolidation:
npx tsc --noEmit         # Must pass
npm run lint             # Must pass
npm test                 # Must pass
npm run build           # Must succeed
```

## Success Metrics

### Quantitative Goals
- Component count: ~300 → 80-100
- File count reduction: >60%
- Bundle size reduction: >40%
- Build time improvement: >30%

### Qualitative Goals
- Clear component naming
- No ambiguous "Card" usage
- Zero mobile/desktop splits
- Intuitive component selection

## Risk Mitigation

### Before Starting
1. Create git branch: `phase-7-consolidation`
2. Document all component usage
3. Create rollback plan
4. Notify team of changes

### During Implementation
1. One component group at a time
2. Test after each consolidation
3. Keep detailed migration notes
4. Update documentation immediately

### After Completion
1. Full regression testing
2. Performance benchmarking
3. Bundle size analysis
4. Team training on new structure

## Component Naming Convention

### Prefixes to REMOVE
```
❌ Advanced*
❌ Enhanced*
❌ Unified*
❌ Simple* (when not actually simple)
❌ Complex*
❌ Base* (unless truly base)
❌ Super*
❌ Ultra*
❌ Mega*
```

### Clear Naming Pattern
```typescript
// Purpose-first naming
Modal           // Not AdvancedModal
Card            // Not EnhancedCard
Select          // Not UnifiedSelect

// Feature suffixes when needed
ModalSheet      // Specific variant
CardCarousel    // Specific layout
SelectMulti     // Specific capability
```

## Viewport Detection Standardization

### Current Issues
- Some use 460px breakpoint
- Others use 640px (Tailwind sm:)
- Inconsistent detection methods

### Standardization Plan
```typescript
// DELETE all of these patterns:
const isMobile = window.innerWidth < 460;
const isMobileView = useMediaQuery('(max-width: 460px)');

// USE Tailwind breakpoints only:
<div className="block sm:hidden">   // Mobile only
<div className="hidden sm:block">   // Desktop only
<div className="w-full sm:w-1/2">   // Responsive width
```

## Timeline

### Week 1 (Current)
- [x] Documentation setup
- [ ] Modal consolidation
- [ ] Start Card cleanup

### Week 2
- [ ] Complete Card cleanup
- [ ] Skeleton unification
- [ ] Delete mobile directory

### Week 3
- [ ] Form standardization
- [ ] Layout simplification
- [ ] Final testing

### Week 4
- [ ] Performance benchmarking
- [ ] Documentation update
- [ ] Team training

## Checklist for Each Component

- [ ] Document current usage
- [ ] Identify unique features
- [ ] Plan migration path
- [ ] Update base component
- [ ] Write migration script
- [ ] Update all imports
- [ ] Test thoroughly
- [ ] Delete duplicates
- [ ] Update documentation
- [ ] Verify build success

## Commands for Verification

```bash
# Count components
find components -name "*.tsx" | wc -l

# Find duplicates
find components -name "*Modal*" -o -name "*Card*" -o -name "*Skeleton*"

# Check for mobile patterns
grep -r "isMobileView\|isMobile\|MobileView" components/

# Find 'any' types
grep -r ": any" --include="*.ts" --include="*.tsx"

# Check bundle size
npm run build && npm run analyze
```

---

**Warning**: This is a major refactor. Proceed systematically and test thoroughly.

*Created: 2025-09-01*
*Purpose: Systematic plan to fix component explosion crisis*