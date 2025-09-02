# Protected Mobile Features - DO NOT MODIFY

## Critical Mobile Components (Working Perfectly)

### 1. VirtualPokemonGrid ✅
**File**: `/components/mobile/VirtualPokemonGrid.tsx`
**Used In**: Pokédex page
**Features**:
- Virtual scrolling with react-window
- 2 columns at 320px, 3 columns at 420px
- Smooth 60fps scrolling
- Memory efficient (only renders visible items)
- Touch-optimized card interactions
**Protection**: This component must not be modified without extensive testing

### 2. BottomSheet ✅
**File**: `/components/mobile/BottomSheet.tsx`
**Used In**: Pokédex filters, card details
**Features**:
- Smooth slide animation from bottom
- Swipe to dismiss
- Backdrop blur
- Safe area handling
- Touch gesture support
**Protection**: Core interaction pattern, preserve all animations

### 3. PullToRefresh ✅
**File**: `/components/mobile/PullToRefresh.tsx`
**Used In**: Pokédex, Type Effectiveness
**Features**:
- Pokéball animation
- Haptic feedback on trigger
- Smooth spring physics
- 60fps animation
**Protection**: Signature interaction, must remain identical

### 4. MobileLayout ✅
**File**: `/components/mobile/MobileLayout.tsx`
**Used In**: All mobile pages
**Features**:
- Safe area padding (notch, home indicator)
- Fixed header handling
- Scroll restoration
- Touch event optimization
**Protection**: Foundation component, critical for iOS/Android

### 5. MobileSearchExperience ✅
**File**: `/components/mobile/MobileSearchExperience.tsx`
**Used In**: Homepage, Pokédex
**Features**:
- Full-screen overlay
- Voice search
- Recent searches
- Instant results
- Keyboard handling
**Protection**: Complex interaction flow, works perfectly

### 6. TypeEffectivenessCards ✅
**File**: `/components/mobile/TypeEffectivenessCards.tsx`
**Used In**: Type Effectiveness page
**Features**:
- Card-based layout (better than table)
- Interactive type selection
- Grouped effectiveness display
- Color-coded damage multipliers
**Protection**: Superior to table on mobile

## Mobile Interactions to Preserve

### Touch Gestures
- Swipe to dismiss (BottomSheet)
- Pull to refresh (PullToRefresh)
- Pinch to zoom (planned for cards)
- Long press for quick actions
- Horizontal swipe for filters

### Performance Targets
- 60fps scrolling (achieved with virtual scrolling)
- <100ms touch response
- <3s initial load
- Smooth animations (using transform, not position)

### Visual Standards
- 48px minimum touch targets
- 16px minimum text size
- High contrast ratios
- Safe area respect
- No horizontal scroll

## Mobile-Specific Features

### Pokédex Mobile Features
1. **Search bar in header** - Saves vertical space
2. **Filter count badges** - Shows active filters
3. **Load more button** - Better than infinite scroll for control
4. **Compact cards** - Circular design saves space
5. **Type badges** - Small but tappable

### Responsive Breakpoints
- 320px: 2 columns (iPhone SE)
- 375px: 2 columns (iPhone 12 mini)
- 390px: 2-3 columns (iPhone 12/13)
- 420px: 3 columns (iPhone Plus)
- 430px: 3 columns (iPhone Pro Max)
- 460px: Transition to tablet

## Testing Checklist Before ANY Change

### Functional Tests
- [ ] Virtual scrolling still smooth?
- [ ] Bottom sheet slides correctly?
- [ ] Pull to refresh triggers properly?
- [ ] Search overlay opens/closes?
- [ ] Filters apply correctly?
- [ ] Cards are tappable?
- [ ] No horizontal scroll?

### Performance Tests
- [ ] 60fps maintained during scroll?
- [ ] Memory usage stable?
- [ ] No layout shifts?
- [ ] Animations smooth?
- [ ] Touch response <100ms?

### Visual Tests
- [ ] Safe areas respected?
- [ ] Touch targets ≥48px?
- [ ] Text readable (≥16px)?
- [ ] No content cut off?
- [ ] Proper spacing maintained?

## Migration Rules

### Rule 1: Wrap, Don't Replace
```tsx
// BAD: Replacing mobile component
const NewGrid = () => { /* new implementation */ }

// GOOD: Wrapping mobile component
const AdaptiveGrid = () => {
  const { isMobile } = useResponsive();
  if (isMobile) return <VirtualPokemonGrid />; // Original preserved
  return <DesktopGrid />; // Desktop enhanced
}
```

### Rule 2: Test Mobile First
Any PR must pass mobile tests before desktop consideration

### Rule 3: Preserve Interactions
All gestures, animations, and haptics must remain identical

### Rule 4: Performance Non-Negotiable
60fps and virtual scrolling are requirements, not features

## Components Safe to Unify

These can be carefully unified without breaking mobile:
- Navigation (can be made responsive)
- Buttons (can use responsive sizing)
- Cards (can adapt layout)
- Forms (can be responsive)
- Modals (can become BottomSheets on mobile)

## Components That Must Stay Separate

These are too different to unify:
- VirtualPokemonGrid (mobile) vs Regular Grid (desktop)
- BottomSheet (mobile) vs Sidebar (desktop)
- PullToRefresh (mobile only)
- Full-screen search (mobile) vs Inline search (desktop)

## Next Steps Priority

1. ✅ Create this protection document
2. Write comprehensive tests for protected features
3. Build adaptive wrappers that preserve mobile
4. Gradually enhance desktop to use mobile patterns
5. Consolidate where safe
6. Never break mobile

---

**Last Updated**: 2025-08-29
**Status**: Mobile features working perfectly, must be preserved during unification