# Background Fixes Summary

## Issue
Pages throughout the project had background cutoffs where gradients didn't extend fully, especially visible in headers and at the bottom of pages.

## Root Cause
1. Missing height constraints in global styles
2. Layout component adding padding to pages with FullBleedWrapper
3. Pages using FullBleedWrapper but not setting `fullBleed = true` flag

## Fixes Applied

### 1. Global Styles (`styles/globals.css`)
- Added `height: 100%` to `html` element
- Added `min-height: 100vh` to `body` element
- Added `#__next` container with `min-height: 100vh` and flex layout
- Added utility classes for full-bleed backgrounds

### 2. Layout Component (`components/layout/Layout.tsx`)
- Modified to conditionally apply padding based on `fullBleed` prop
- When `fullBleed` is true, children render without wrapper padding
- When false, standard padding is applied

### 3. FullBleedWrapper Component (`components/ui/FullBleedWrapper.tsx`)
- Added background extender div to ensure full coverage
- Added relative positioning and z-index management
- Ensures gradient extends even when content is short

### 4. Fixed Pages (Added `fullBleed = true` flag)

#### High Priority Pages Fixed:
- `/pages/cards/[cardId].tsx` - Card detail pages
- `/pages/tcgsets/[setid].tsx` - TCG set detail pages
- `/pages/market.tsx` - Market analytics page
- `/pages/collections.tsx` - Collections management page
- `/pages/favorites.tsx` - Favorites page
- `/pages/trending.tsx` - Trending page

#### PocketMode Pages Fixed:
- `/pages/pocketmode/[pokemonid].tsx` - Pokemon detail pages
- `/pages/pocketmode.tsx` - Main PocketMode page
- `/pages/pocketmode/set/[setId].tsx` - Set detail pages
- `/pages/pocketmode/expansions.tsx` - Expansions page
- `/pages/pocketmode/decks.tsx` - Decks page
- `/pages/pocketmode/deckbuilder.tsx` - Deck builder page

#### Team Builder Pages Fixed:
- `/pages/team-builder/advanced.tsx` - Advanced team builder
- `/pages/team-builder/ev-optimizer.tsx` - EV optimizer

#### Battle Simulator Pages Fixed:
- `/pages/battle-simulator/team-builder.tsx` - Team builder
- `/pages/battle-simulator/damage-calc.tsx` - Damage calculator

## Testing
Created comprehensive Playwright tests in `/tests/full-bleed-backgrounds.spec.ts` to verify:
- Full-height background coverage
- No cutoffs at viewport edges
- Proper gradient application
- Mobile view compatibility

## Result
All pages now have properly extending backgrounds without cutoffs. The gradient backgrounds extend fully from top to bottom of the viewport, even when content is shorter than the screen height.