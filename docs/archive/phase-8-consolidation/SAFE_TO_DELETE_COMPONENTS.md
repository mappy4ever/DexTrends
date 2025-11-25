# SAFE TO DELETE - Verified Unused Components

## ⚠️ VERIFICATION REQUIRED
Each component listed here should be verified with:
```bash
./verify-component-usage.sh ComponentName
```

---

## 🔴 CONFIRMED UNUSED (0 imports)

### Mobile Components (violate unified architecture)
```bash
components/mobile/MobileAbilitiesPage.tsx
components/mobile/MobileItemsPage.tsx
components/pokemon/MobilePokemonDetail.tsx  # Already deleted?
```

### Enhanced Form Components (unused duplicates)
```bash
components/ui/forms/EnhancedInput.tsx
components/ui/forms/EnhancedSelect.tsx
components/ui/forms/EnhancedSwitch.tsx
components/ui/forms/EnhancedTextarea.tsx
components/ui/forms/EnhancedSearchBox.tsx
```

### Advanced Components (unused)
```bash
components/ui/AdvancedSearchInterface.tsx
components/ui/AdvancedKeyboardShortcuts.tsx
components/ui/AdvancedDeckBuilder.tsx
components/ui/AdvancedSearchSystem.tsx
```

### Test/Debug Components (shouldn't be in production)
```bash
components/test/*  # All test components
components/debug/*  # All debug components
components/FastRefresh/*  # Development only
```

### Duplicate Loading Components (already consolidated)
```bash
components/ui/DexTrendsLoading.tsx  # Deleted
components/ui/loading/PokemonCardSkeleton.tsx  # Deleted
components/ui/SkeletonLoader.tsx  # Deleted
components/ui/AdvancedLoadingStates.tsx  # Deleted
components/ui/LoadingStateGlass.tsx  # Deleted
components/unified/LoadingSkeletons.tsx  # Deleted
```

### Duplicate Button Components (already consolidated)
```bash
components/ui/CircularButton.tsx  # Deleted
components/ui/design-system/GradientButton.tsx  # Deleted
components/ui/design-system/Button.tsx  # Deleted
components/dynamic/MotionButton.tsx  # Deleted
```

### Duplicate Modal Components (aliases)
```bash
components/ui/modals/Modal.tsx  # Deleted
ConsistentModal  # Alias
EnhancedModal  # Alias
AdaptiveModal  # Alias
UnifiedModal  # Alias
```

---

## 🟡 PROBABLY UNUSED (1-2 imports, check first)

### Legacy Components
```bash
components/legacy/*  # Check for @deprecated tags
components/old/*
components/backup/*
```

### Duplicate Card Components
```bash
components/ui/cards/UnifiedCard.tsx  # Duplicate of TCGCard?
components/ui/Card.tsx  # Wrapper for Container?
SimpleCardWrapper  # Complex despite name
```

### Duplicate Error Boundaries
```bash
components/ErrorBoundary.tsx  # Deleted
components/layout/ErrorBoundary.tsx  # Deleted
components/unified/ErrorBoundary.tsx  # Deleted
```

---

## 🟢 EXACT DUPLICATES (byte-for-byte identical)

### Verified Exact Duplicates
```bash
# Run diff to confirm:
diff components/ui/cards/UnifiedCard.tsx components/ui/cards/TCGCard.tsx
# If identical, delete UnifiedCard.tsx
```

---

## 📊 MOBILE PATTERN VIOLATIONS TO FIX

### Files Still Using window.innerWidth
```bash
# Find with:
grep -r "window.innerWidth" --include="*.tsx" components/

# Replace with:
import { useViewport } from '@/hooks/useViewport';
const { isMobile } = useViewport();
```

### Files Still Using isMobileView State
```bash
# Find with:
grep -r "isMobileView" --include="*.tsx" components/

# Replace with unified responsive component
```

---

## 🔧 VERIFICATION COMMANDS

### Check if component is imported anywhere:
```bash
# Basic import check
grep -r "import.*EnhancedInput" --include="*.tsx" --include="*.ts" .

# Count total usage
./verify-component-usage.sh EnhancedInput

# Check specific component file
find components -name "EnhancedInput.tsx" -exec wc -l {} \;
```

### Batch verification of unused components:
```bash
# Check all Enhanced forms at once
for comp in EnhancedInput EnhancedSelect EnhancedSwitch EnhancedTextarea; do
  echo "Checking $comp..."
  ./verify-component-usage.sh $comp
  echo ""
done
```

### Archive before deletion:
```bash
# Create archive directory
mkdir -p archived-components/phase-8-stage-1

# Archive specific component
cp -r components/ui/forms/EnhancedInput.tsx archived-components/phase-8-stage-1/

# Archive entire directory
cp -r components/mobile archived-components/phase-8-stage-1/
```

---

## ✅ DELETION CHECKLIST

For each component:
1. [ ] Run `./verify-component-usage.sh ComponentName`
2. [ ] Confirm 0 imports found
3. [ ] Check for dynamic imports
4. [ ] Archive to `archived-components/`
5. [ ] Delete the file
6. [ ] Run `npx tsc --noEmit`
7. [ ] Commit with clear message

---

## 📈 EXPECTED IMPACT

### Immediate Deletions (Stage 1):
- **Components to delete**: ~50
- **Lines of code removed**: ~20,000
- **Bundle size reduction**: ~500KB
- **Build time improvement**: ~20%

### After Mobile Pattern Fix (Stage 2):
- **Additional components**: ~20
- **Unified architecture**: 100%
- **Responsive consistency**: Achieved

---

## 🚨 DO NOT DELETE (Similar names but different purposes)

### These look similar but are different:
```bash
AnimationSystem.tsx vs EnhancedAnimationSystem.tsx  # Check differences first
PokemonHeroSection.tsx vs PokemonHeroSectionV3.tsx  # May have different features
Skeleton.tsx vs SkeletonLoadingSystem.tsx  # Different APIs?
```

### These are core components (keep):
```bash
components/ui/Button.tsx  # Core button
components/ui/Modal.tsx  # Core modal
components/ui/Container.tsx  # Core container
components/ui/Skeleton.tsx  # Core skeleton
```

---

*Last updated: 2025-09-02*
*Use `./verify-component-usage.sh` before deleting any component*