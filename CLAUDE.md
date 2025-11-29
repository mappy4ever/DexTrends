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

### Deprecated Components (Do Not Use)
- `PokemonHeroSection` → Use `PokemonHeroSectionV3`
- `PokemonHeroSectionV2` → Use `PokemonHeroSectionV3`
- `StarterShowcase` → Use `StarterShowcaseComplete`
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

## Current Work: Comprehensive UI/UX Redesign

**Status:** 🟡 In Progress
**Active Plan:** `~/.claude/plans/glistening-pondering-cerf.md`

### Overview
Comprehensive redesign covering all 43 pages with focus on:
- Premium Index page experience
- Pro-like stats lookup (easy to read/access)
- Subtle type accents throughout
- Missing components (Tabs, Toggle, StatDisplay)
- Page consistency with unified PageHeader

### Current Sprint: Sprint 1 - Foundation + Quick Wins
Check plan file for detailed task status. 7 Sprints total:
1. **Foundation + Quick Wins** ← CURRENT (Components + Critical Fixes)
2. Premium Experiences (Homepage + Pro Stats)
3. Pokedex & Pokemon Detail
4. Battle Tools
5. Pocket Mode
6. Market & Collections
7. Secondary Pages & Polish

### Before Making Changes
1. Read the plan file: `~/.claude/plans/glistening-pondering-cerf.md`
2. Check Progress Tracking section for current status
3. Look for ⬜ (not started) / 🟡 (in progress) / ✅ (complete) markers
4. Update status markers as you complete tasks
5. Add entries to Change Log in plan file

### Key Analysis Findings
- 43 total pages analyzed (17 good, 17 need work, 8 incomplete, 1 critical)
- 125 UI components (target: reduce to ~60-70)
- Missing: Tabs, Toggle/Switch, Typography system, StatDisplay
- Critical: Damage Calculator needs complete redesign
- Duplicate pages to consolidate: moves, items, abilities

### Design Decisions
- **Type Theming**: Subtle accents only (not aggressive)
- **Approach**: Balanced (foundation + pages in parallel)
- **Focus**: Premium feel, easy-to-read stats
- **Glass effects** = Modals/sheets ONLY (not content cards)
- **Container variants**: `default`, `elevated`, `outline`, `ghost`, `gradient`, `featured`, `glass`
- **Animations**: Subtle, Apple-like (150-250ms, ease-out)
- **Types**: Use EnergyIcon component with official TCG symbols

### Previous Work Completed (Before This Plan)
- GlassContainer removed from all 12 page files
- Type gradients fixed in PokemonDisplay.tsx
- Gray → Stone color migration (51 files)
- Build passes, TypeScript passes

## Documentation

- **README.md** - Project overview and setup
- **docs/UI-PROGRESS-NOTES.md** - Current UI work progress and remaining tasks
- **docs/archive/** - Historical documentation and phase reports
