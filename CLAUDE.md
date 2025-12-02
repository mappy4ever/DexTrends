# DexTrends - Developer Context

## Project Overview

DexTrends is a Pokemon TCG and Pokedex application built with Next.js.

| Aspect | Details |
|--------|---------|
| Framework | Next.js 15.4.4 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Testing | Playwright E2E |
| Database | Supabase |
| Caching | Redis + UnifiedCacheManager |

## Quick Commands

```bash
npm run dev          # Start development server (port 3001)
npm run build        # Production build
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript check
npm test             # Playwright tests
```

## Project Structure

```
/components
  /ui           # Reusable UI components (Button, Modal, Container, etc.)
  /pokemon      # Pokemon-specific components
  /tcg          # Trading card components
  /regions      # Pokemon region components
/pages          # Next.js pages and API routes
/utils          # Utility functions
/hooks          # Custom React hooks
/types          # TypeScript definitions
/styles         # Global CSS
/tests          # Playwright E2E tests
/lib            # Server utilities (cache, database)
/docs           # Documentation
  /archive      # Historical documentation
```

## Canonical Components (Source of Truth)

Use these as the single source for each purpose:

| Purpose | Component | Location |
|---------|-----------|----------|
| **Buttons** | `Button` | `/components/ui/Button.tsx` |
| **Containers/Cards** | `Container` | `/components/ui/Container.tsx` |
| **Modals** | `Modal` | `/components/ui/Modal.tsx` |
| **Loading (page)** | `PokeballLoader` | `/components/ui/PokeballLoader.tsx` |
| **Loading (skeleton)** | `SkeletonLoadingSystem` | `/components/ui/SkeletonLoadingSystem.tsx` |
| **Type Badges** | `EnergyIcon` / `EnergyBadge` | `/components/ui/EnergyIcon.tsx` |
| **Pokemon Display** | `PokemonDisplay` | `/components/ui/PokemonDisplay.tsx` |
| **Hero Section** | `PokemonHeroSectionV3` | `/components/pokemon/PokemonHeroSectionV3.tsx` |
| **Starter Showcase** | `StarterShowcaseComplete` | `/components/regions/StarterShowcaseComplete.tsx` |
| **Empty States** | `EmptyState` | `/components/ui/EmptyState.tsx` |
| **Form Inputs** | `Select`, `Checkbox`, `Radio` | `/components/ui/` |
| **Pagination** | `Pagination`, `PageInfo` | `/components/ui/Pagination.tsx` |

### Deprecated Components (Deleted)
All deprecated components have been removed:
- ~~`PokemonHeroSection`~~ (deleted)
- ~~`PokemonHeroSectionV2`~~ (deleted)
- ~~`StarterShowcase`~~ (deleted)
- ~~`StarterShowcaseEnhanced`~~ (deleted)
- ~~`StarterPokemonShowcaseGlass`~~ (deleted)
- `GlassContainer` → Use `Container`

## Design System

The design system uses consistent values defined in `/components/ui/design-system/glass-constants.ts`:

- **Border Radius**: 12px for buttons/cards, 16px for modals
- **Shadows**: Subtle, layered shadows
- **Colors**: Blue-based accents, clean white/gray glass effects
- **Transitions**: 200ms ease-out

## Development Rules

### Do
- Use existing components from `/components/ui/`
- Use responsive Tailwind classes (`md:`, `lg:`)
- Use `logger` from `/utils/logger` for logging
- Use `cn()` from `/utils/cn` for class merging
- Maintain 0 TypeScript errors

### Don't
- Create duplicate components
- Use `console.log` (use logger)
- Create separate mobile/desktop components
- Add `any` types without justification

## Key Utilities

```typescript
import { cn } from '@/utils/cn';                    // Tailwind class merging
import logger from '@/utils/logger';                 // Production logging
import { fetchJSON } from '@/utils/unifiedFetch';    // API calls with caching
import { useViewport } from '@/hooks/useViewport';   // Viewport detection
```

## Caching Architecture

The app has multiple caching layers:

| Layer | Location | TTL | Use Case |
|-------|----------|-----|----------|
| UnifiedCacheManager (Memory) | Server | 15 min | Fast lookups |
| UnifiedCacheManager (localStorage) | Browser | 6 hours | Client persistence |
| Redis (tcgCache) | Server | 7 days | TCG set data |
| Supabase | Database | 48 hours | Critical data |

To bypass cache on API calls:
```typescript
fetchJSON(url, { useCache: false, forceRefresh: true })
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/tcgexpansions` | TCG card sets (paginated) |
| `/api/tcgexpansions/[setId]` | Set details with cards |
| `/api/pocket-expansions` | Pokemon Pocket sets |
| `/api/pocket-cards` | Pocket card database |

## External APIs

- **PokeAPI**: Pokemon data (pokeapi.co)
- **Pokemon TCG API**: Card data (pokemontcg.io)
- **TCGDex**: Pokemon Pocket data (tcgdex.net)

## Current Work: QA & Design Audit

**Status:** ✅ Complete
**Active Plan:** `~/.claude/plans/swift-greeting-hedgehog.md`

### Overview
Comprehensive site audit covering 45+ pages, 130+ components, and design system improvements.

### Progress Status

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Delete Deprecated | ✅ Complete | Removed PokemonHeroSection V1/V2, StarterShowcase variants |
| 1b. Fix Mobile Grid | ✅ Complete | Fixed card overlap in UnifiedGrid + PokemonDisplay |
| 2. Fix Focus States | ✅ Complete | WCAG compliance - focus-visible with amber rings |
| 3. Dark Mode Contrast | ✅ Complete | Changed stone-400 → stone-300 (6.3:1 contrast) |
| 4. Reduced Motion | ✅ Complete | CSS + useReducedMotion hook for accessibility |
| 5. Pagination Component | ✅ Complete | /components/ui/Pagination.tsx with PageInfo |
| 6. Design Polish | ✅ Complete | Added COLORS.status (success/warning/error/info) |

### Critical Issues (FIXED)
- ✅ **Focus States**: Now uses focus-visible with amber rings
- ✅ **Dark Mode Contrast**: Changed stone-400 → stone-300 (6.3:1 contrast)
- ✅ **Reduced Motion**: Added prefers-reduced-motion CSS + React hook

### Files Deleted (Phase 1 Complete)
- ✅ `/components/pokemon/PokemonHeroSection.tsx`
- ✅ `/components/pokemon/PokemonHeroSectionV2.tsx`
- ✅ `/components/regions/StarterShowcase.tsx`
- ✅ `/components/regions/StarterPokemonShowcaseGlass.tsx`
- ✅ `/components/regions/StarterShowcaseEnhanced.tsx`

### Files to Modify
- `/styles/focus-overrides.css` - Remove blanket focus override
- `/styles/design-system.css` - Add accessible focus ring styles
- `/components/ui/design-system/glass-constants.ts` - Add focus tokens

### New Components
- `/components/ui/Pagination.tsx` - Page navigation for large lists

---

## Previous Work: Mobile Experience Redesign

**Status:** ✅ Complete

### Completed Phases
- ✅ Navigation (BottomNav + MoreSheet + Navbar)
- ✅ Pokedex Cards ("listing" variant)
- ✅ Search/Filters (prominent search + type pills)
- ✅ Section Components (SectionDivider + SectionHeader)
- ✅ Spacing (SPACING + TOUCH_TARGET tokens)
- ✅ Visual Consistency (colors, radius, shadows)
- ✅ Touch Fixes (44px+ targets)

---

## Previous Work: UI/UX Redesign (Reference)

**Plan:** `~/.claude/plans/glistening-pondering-cerf.md`

### Completed
- GlassContainer removed from all 12 page files
- Type gradients fixed in PokemonDisplay.tsx
- Gray → Stone color migration (51 files)
- Build passes, TypeScript passes

### Design Decisions (Still Apply)
- **Glass effects** = Modals/sheets ONLY (not content cards)
- **Container variants**: `default`, `elevated`, `outline`, `ghost`, `gradient`, `featured`, `glass`
- **Animations**: Subtle, Apple-like (150-250ms, ease-out)
- **Types**: Use EnergyIcon component with official TCG symbols

## Documentation

- **README.md** - Project overview and setup
- **docs/UI-PROGRESS-NOTES.md** - Current UI work progress and remaining tasks
- **docs/archive/** - Historical documentation and phase reports
