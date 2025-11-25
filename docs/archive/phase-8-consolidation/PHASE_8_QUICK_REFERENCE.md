# Phase 8 Quick Reference Guide

## 🎯 GOAL: 384 → 80-100 Components (74-79% reduction)

## 📁 KEY DOCUMENTS
- **Full Plan**: `PHASE_8_DEEP_CONSOLIDATION_PLAN.md`
- **Safe Deletions**: `SAFE_TO_DELETE_COMPONENTS.md`
- **Verification Tool**: `./verify-component-usage.sh`
- **Progress Tracking**: `CURRENT_WORK.md`

## ⚡ QUICK COMMANDS

### Verify Before Deleting:
```bash
./verify-component-usage.sh ComponentName
```

### Rename Component Safely:
```bash
./rename-component.sh OldName NewName
```

### Find All Imports of a Component:
```bash
grep -r "import.*ComponentName" --include="*.tsx" --include="*.ts" .
```

### Check for Mobile Patterns:
```bash
# Find viewport checks
grep -r "window.innerWidth" --include="*.tsx" components/

# Find mobile conditionals
grep -r "isMobileView" --include="*.tsx" components/
```

### Archive Before Deletion:
```bash
mkdir -p archived-components/stage-1
cp components/path/to/Component.tsx archived-components/stage-1/
```

### TypeScript Check:
```bash
npx tsc --noEmit
```

## 🔄 10-STAGE PLAN (Now with Naming Fixes!)

| Stage | Focus | Naming Fixes | Components | Timeline |
|-------|-------|--------------|------------|----------|
| **1** | Safe Deletions | Fix "Card" confusion | 384 → 334 | Week 1 |
| **2** | Mobile Patterns | Remove "Mobile" prefix | 334 → 314 | Week 1-2 |
| **3** | Modals | Remove misleading prefixes | 314 → 301 | Week 2 |
| **4** | Forms | Clear form names | 301 → 281 | Week 2 |
| **5** | Data Display | Specific display names | 281 → 258 | Week 3 |
| **6** | Pokemon | Remove version numbers | 258 → 220 | Week 3 |
| **7** | TCG | Add TCG prefix | 220 → 193 | Week 4 |
| **8** | Animation | Clear animation names | 193 → 181 | Week 4 |
| **9** | Search | Specific search names | 181 → 165 | Week 5 |
| **10** | Final | Fix remaining generics | 165 → 80-100 | Week 5 |

## ✅ STAGE 1 CHECKLIST (Do First!)

### Completely Unused (0 imports):
- [ ] `components/ui/forms/EnhancedInput.tsx`
- [ ] `components/ui/forms/EnhancedSelect.tsx`
- [ ] `components/ui/forms/EnhancedSwitch.tsx`
- [ ] `components/ui/forms/EnhancedTextarea.tsx`
- [ ] `components/ui/AdvancedSearchInterface.tsx`
- [ ] `components/ui/AdvancedKeyboardShortcuts.tsx`

### Critical Renames (Fix confusion):
- [ ] `SimpleCardWrapper` → `TCGCardLogicWrapper`
- [ ] `Card` → `Container` (when it's a UI container)
- [ ] `PokemonCard` → `PokemonInfoDisplay` (not TCG)
- [ ] `CardGrid` → `TCGCardGrid`
- [ ] `Display` → [Specific]Display

### Process:
1. Run `./verify-component-usage.sh [name]`
2. Confirm 0 usage (except self-reference)
3. Archive: `cp [file] archived-components/`
4. Delete: `rm [file]`
5. Test: `npx tsc --noEmit`
6. Commit: `git commit -m "Remove unused [name]"`

## 🚨 SAFETY RULES

### NEVER Delete Without:
1. ✅ Running verification script
2. ✅ Checking for dynamic imports
3. ✅ Archiving first
4. ✅ Running TypeScript check
5. ✅ Testing in browser

### Components That Look Similar But Aren't:
- `AnimationSystem` vs `EnhancedAnimationSystem`
- `Skeleton` vs `SkeletonLoadingSystem`
- `PokemonHeroSection` vs `PokemonHeroSectionV3`

### Keep These Core Components:
- `Button.tsx`, `Modal.tsx`, `Container.tsx`
- `Skeleton.tsx`, `Sheet.tsx`, `Toast.tsx`
- Main Pokemon/TCG display components

## 📊 EXPECTED OUTCOMES

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| **Components** | 384 | 80-100 | -74% |
| **Code Lines** | ~150K | ~40K | -73% |
| **Bundle Size** | ~5MB | ~1.5MB | -70% |
| **Build Time** | ~45s | ~15s | -67% |
| **TS Errors** | 74 | 0 | -100% |

## 🔥 START NOW

1. **Create branch**: 
   ```bash
   git checkout -b phase-8-stage-1
   ```

2. **Verify first unused component**:
   ```bash
   ./verify-component-usage.sh EnhancedInput
   ```

3. **If 0 usage, archive and delete**:
   ```bash
   mkdir -p archived-components/stage-1
   cp components/ui/forms/EnhancedInput.tsx archived-components/stage-1/
   rm components/ui/forms/EnhancedInput.tsx
   ```

4. **Test and commit**:
   ```bash
   npx tsc --noEmit
   git add -A
   git commit -m "Phase 8 Stage 1: Remove unused EnhancedInput"
   ```

---

*Remember: Methodical and safe wins. Verify everything, archive everything, test everything.*