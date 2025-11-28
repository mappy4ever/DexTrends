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

## Core UI Components

Use these components from `/components/ui/`:

| Component | Purpose |
|-----------|---------|
| `Button` | All buttons (primary, secondary, ghost, danger, success, glass) |
| `Modal` | Dialogs and popups |
| `Container` | Content cards and containers |
| `Skeleton` | Loading states |
| `Select`, `Checkbox`, `Radio` | Form inputs |

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

## Current Work: UI Standardization

**Status:** In Progress
**Details:** See `docs/UI-PROGRESS-NOTES.md`

### Key Rules
- **Glass effects** = Modals/sheets ONLY (not content cards)
- **Container variants**: `default`, `elevated`, `outline`, `ghost`, `gradient`, `featured`, `glass`
- **Container rounded**: `none`, `sm`, `md`, `lg`, `xl`, `full` (NOT `2xl`/`3xl`)

### Immediate TODOs
1. ~~Fix Pokedex image "?" placeholders~~ - DONE (removed broken useProgressiveImage, added onError fallback)
2. ~~Fix search bar text overlap~~ - DONE (pl-14 sm:pl-16)
3. Migrate 20+ components still using GlassContainer (see docs/UI-PROGRESS-NOTES.md for full list)

### Completed
- GlassContainer removed from all 12 page files
- Type gradients fixed in PokemonDisplay.tsx
- UnifiedGrid virtualization fixed
- Pokedex image loading fixed (PokemonDisplay.tsx)
- Search bar padding fixed (pokedex.tsx)
- Build passes, TypeScript passes

## Documentation

- **README.md** - Project overview and setup
- **docs/UI-PROGRESS-NOTES.md** - Current UI work progress and remaining tasks
- **docs/archive/** - Historical documentation and phase reports
