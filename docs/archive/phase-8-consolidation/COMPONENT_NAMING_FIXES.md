# Component Naming Fixes - Phase 8 Integration

## 🚨 CRITICAL NAMING PROBLEMS IDENTIFIED

### 1. **"Card" Confusion** (HIGHEST PRIORITY)
The word "Card" is used for 3 completely different concepts:
- **UI Container**: Basic layout wrapper (should be `Container`)
- **TCG Trading Card**: Pokemon trading cards (should be `TCGCard`)
- **Pokemon Display**: Pokemon info display (should be `PokemonDisplay`)

### 2. **Misleading Prefixes**
- **"Simple"** components that are actually complex
- **"Enhanced/Advanced/Unified"** that aren't enhanced
- **"Mobile"** in unified architecture
- **Version numbers** (V2, V3) without clear differences

### 3. **Generic Names** for Specific Functions
- `Display.tsx` → What does it display?
- `Item.tsx` → What kind of item?
- `View.tsx` → View of what?
- `Manager.tsx` → Managing what?

---

## 📝 NAMING STANDARDS

### Component Naming Rules:
1. **Be Specific**: `Display` → `PokemonStatsDisplay`
2. **Domain First**: `TCGCardPrice`, `PokemonEvolutionChain`
3. **Purpose Clear**: `PriceTracker` not `Tracker`
4. **No Redundant Prefixes**: Remove Enhanced/Advanced/Unified unless meaningful
5. **No Version Numbers**: Use git for versioning, not filenames

### Naming Patterns:
```
[Domain][Purpose][Type]
- TCGCardDisplay (domain: TCG, purpose: Card, type: Display)
- PokemonStatsTable (domain: Pokemon, purpose: Stats, type: Table)
- MarketPriceChart (domain: Market, purpose: Price, type: Chart)
```

---

## 🔄 RENAME MAPPING BY STAGE

### **STAGE 1: Safe Deletions + Initial Renames**
```bash
# While deleting unused, also rename obviously wrong names:
SimpleCardWrapper.tsx → TCGCardLogicWrapper.tsx  # It's complex TCG logic!
Card.tsx → Container.tsx  # Already done
UnifiedCard.tsx → DELETE  # Duplicate of TCGCard
```

### **STAGE 2: Mobile Pattern + Mobile Naming**
```bash
# Remove "Mobile" prefix from everything:
MobilePokemonDetail → PokemonDetail
MobileTCGSetDetail → TCGSetDetail
MobileLayout → ResponsiveLayout → DELETE
```

### **STAGE 3: Modal Consolidation + Modal Naming**
```bash
# Clear modal naming:
ConsistentModal → DELETE (use Modal)
EnhancedModal → DELETE (use Modal)
AdaptiveModal → DELETE (use Modal)
CardPreviewModal → TCGCardPreviewModal  # Specify TCG
ComparisonModal → TCGCardComparisonModal
```

### **STAGE 4: Form Unification + Form Naming**
```bash
# Clear form component names:
EnhancedInput → DELETE
SearchBox → SearchInput  # Consistent with Input pattern
FormField → FormInput  # More specific
Dropdown → Select  # Match HTML semantics
Toggle → Switch  # Industry standard
```

### **STAGE 5: Data Display + Display Naming**
```bash
# Specific display names:
Display.tsx → DELETE  # Too generic
DataDisplay → DataTable  # More specific
CardGrid → TCGCardGrid  # Specify domain
PokemonGrid → PokemonDisplayGrid
ItemList → ItemCatalogList
UnifiedDataTable → DataTable  # Remove "Unified"
```

### **STAGE 6: Pokemon Components + Pokemon Naming**
```bash
# Clear Pokemon component names:
PokemonHeroSection → PokemonDetailHero
PokemonHeroSectionV3 → DELETE  # No version numbers
UnifiedPokemonDetail → PokemonDetail
PokemonCard → PokemonInfoCard  # Not a TCG card
PokemonTile → PokemonGridItem
EnhancedPokemonCard → DELETE
PokemonCardRenderer → DELETE
```

### **STAGE 7: TCG Components + TCG Naming**
```bash
# Clear TCG component names:
Card → TCGCard  # Always prefix with TCG
CardSet → TCGSet
SetDetail → TCGSetDetail
CardPrice → TCGCardPrice
CardRarity → TCGCardRarity
Advanced3DCard → TCG3DCard  # Remove "Advanced"
UnifiedSetDashboard → TCGSetDashboard
```

### **STAGE 8: Animation + Effect Naming**
```bash
# Clear animation names:
AnimationSystem → AnimationProvider
EnhancedAnimationSystem → DELETE or merge
MotionWrapper → AnimationWrapper
SpringWrapper → SpringAnimation
GestureWrapper → GestureHandler
InteractiveWrapper → InteractiveElement
```

### **STAGE 9: Search/Filter + Search Naming**
```bash
# Clear search component names:
SearchInterface → SearchBar
AdvancedSearchInterface → DELETE
EnhancedSearch → SearchWithFilters
UnifiedSearchBar → SearchBar
SearchBox → SearchInput
Filter → SearchFilter  # More specific
```

### **STAGE 10: Final Cleanup + Utility Naming**
```bash
# Clear utility names:
Manager → [Specific]Manager (UserManager, StateManager, etc.)
Provider → [Specific]Provider
Wrapper → [Specific]Wrapper or DELETE if unnecessary
Helper → [Specific]Helper or move to utils/
System → [Specific]System or refactor
```

---

## 🎯 SPECIFIC RENAMES NEEDED

### High Priority Renames (Confusing):
| Current Name | New Name | Reason |
|--------------|----------|---------|
| `SimpleCardWrapper` | `TCGCardLogicWrapper` | It's complex, not simple |
| `Card` | `Container` | It's a UI container, not a card |
| `PokemonCard` | `PokemonInfoDisplay` | Not a trading card |
| `CardGrid` | `TCGCardGrid` | Specify it's for TCG |
| `Display` | `[Specific]Display` | Too generic |
| `Item` | `[Specific]Item` | What kind of item? |
| `View` | `[Specific]View` | View of what? |
| `Manager` | `[Specific]Manager` | Managing what? |

### Medium Priority (Misleading Prefixes):
| Current Pattern | New Pattern | Examples |
|-----------------|-------------|----------|
| `Enhanced*` | Remove prefix | `EnhancedModal` → `Modal` |
| `Advanced*` | Remove prefix | `AdvancedSearch` → `Search` |
| `Unified*` | Remove prefix | `UnifiedGrid` → `Grid` |
| `Simple*` | Remove or clarify | `SimpleCard` → `BasicCard` |
| `*V2/*V3` | Remove version | `HeroSectionV3` → `HeroSection` |

### Low Priority (Acceptable but Improvable):
- Components with clear prefixes like `Pokemon*`, `TCG*`
- Utility components with clear purposes
- Layout components with standard names

---

## 🛠️ RENAME IMPLEMENTATION STRATEGY

### Safe Rename Process:
1. **Find all imports**:
   ```bash
   grep -r "import.*OldName" --include="*.tsx" --include="*.ts"
   ```

2. **Create compatibility export** (temporary):
   ```typescript
   // In NewName.tsx
   export default NewNameComponent;
   export { NewNameComponent as OldName }; // Temporary
   ```

3. **Update imports gradually**:
   ```bash
   # Update one file at a time
   sed -i '' 's/OldName/NewName/g' file.tsx
   ```

4. **Remove compatibility export** after all updates

5. **Update component internals**:
   ```typescript
   // Change display name
   NewNameComponent.displayName = 'NewName';
   ```

### Batch Rename Script:
```bash
#!/bin/bash
# rename-component.sh

OLD_NAME=$1
NEW_NAME=$2

echo "Renaming $OLD_NAME to $NEW_NAME..."

# 1. Rename file
find components -name "*$OLD_NAME*" -exec rename "s/$OLD_NAME/$NEW_NAME/g" {} \;

# 2. Update imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/$OLD_NAME/$NEW_NAME/g"

# 3. Update exports
find components -name "index.ts" | xargs sed -i '' "s/$OLD_NAME/$NEW_NAME/g"

# 4. Test
npx tsc --noEmit

echo "Rename complete. Check git diff before committing."
```

---

## 📊 NAMING FIX METRICS

### Before:
- **Misleading names**: ~100 components
- **"Card" confusion**: 49 components
- **Generic names**: ~30 components
- **Version numbers**: ~10 components
- **Misleading prefixes**: ~40 components

### After:
- **Clear domain prefixes**: 100%
- **Specific purposes**: 100%
- **No version numbers**: 0
- **No misleading prefixes**: 0
- **Consistent patterns**: 100%

---

## ✅ NAMING CHECKLIST BY STAGE

### During Each Stage:
- [ ] Identify misleading names in that category
- [ ] Plan new names following standards
- [ ] Check for import conflicts
- [ ] Rename file and update imports
- [ ] Update display names
- [ ] Update documentation
- [ ] Test thoroughly
- [ ] Commit with clear message

### Commit Message Format:
```bash
git commit -m "refactor: Rename [OldName] to [NewName] for clarity

- [OldName] was misleading because [reason]
- [NewName] better describes [actual purpose]
- Updated all imports and references"
```

---

## 🚨 NAMES TO DEFINITELY FIX

### Critical (Fix immediately):
1. `SimpleCardWrapper` → `TCGCardLogicWrapper`
2. `Card` (when it's a container) → `Container`
3. `PokemonCard` (when not TCG) → `PokemonInfoDisplay`
4. All `Mobile*` components → Remove "Mobile" prefix

### Important (Fix during consolidation):
1. All `Enhanced*` → Remove prefix unless truly enhanced
2. All `Advanced*` → Remove prefix unless truly advanced
3. All `Unified*` → Remove prefix
4. All `*V2/*V3` → Remove version numbers

### Nice to Have (Fix if time):
1. Generic `Display` → Specific display name
2. Generic `View` → Specific view name
3. Generic `Manager` → Specific manager name

---

## 🎯 INTEGRATION WITH PHASE 8 STAGES

Each stage now includes:
1. **Delete** unused components
2. **Rename** misleading names
3. **Consolidate** duplicates
4. **Test** everything

This ensures we're not just reducing components but also making the remaining ones crystal clear in purpose and naming.

---

*Last updated: 2025-09-02*
*Naming is documentation. Clear names prevent bugs.*