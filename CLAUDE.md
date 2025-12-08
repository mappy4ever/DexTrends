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
  /pocket       # Pokemon Pocket deck builder components
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

## Canonical Components

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
| **Pagination** | `Pagination`, `PageInfo` | `/components/ui/Pagination.tsx` |

## Design System

Located in `/components/ui/design-system/glass-constants.ts`:

- **Border Radius**: 12px for buttons/cards, 16px for modals
- **Shadows**: Subtle, layered shadows
- **Colors**: Stone-based neutrals, amber accents
- **Transitions**: 200ms ease-out
- **Glass effects**: Modals/sheets ONLY (not content cards)

### Container Variants
`default`, `elevated`, `outline`, `ghost`, `gradient`, `featured`, `glass`

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
- Use glass effects on content cards (only modals/sheets)

## Key Utilities

```typescript
import { cn } from '@/utils/cn';                    // Tailwind class merging
import logger from '@/utils/logger';                 // Production logging
import { fetchJSON } from '@/utils/unifiedFetch';    // API calls with caching
import { useViewport } from '@/hooks/useViewport';   // Viewport detection
```

## Caching Architecture

| Layer | Location | TTL | Use Case |
|-------|----------|-----|----------|
| UnifiedCacheManager (Memory) | Server | 15 min | Fast lookups |
| UnifiedCacheManager (localStorage) | Browser | 6 hours | Client persistence |
| Redis (tcgCache) | Server | 7 days | TCG set data |
| Supabase | Database | 48 hours | Critical data |

To bypass cache:
```typescript
fetchJSON(url, { useCache: false, forceRefresh: true })
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/tcgexpansions` | TCG card sets (paginated) |
| `/api/tcgexpansions/[setId]` | Set details with cards |
| `/api/tcg-cards` | Card search with filters |
| `/api/tcg-cards/[cardId]` | Individual card details |
| `/api/tcg-series` | Series list |
| `/api/tcg-series/[serieId]` | Series detail with sets |
| `/api/pocket-expansions` | Pokemon Pocket sets |
| `/api/pocket-cards` | Pocket card database |

### Card Search Filters (`/api/tcg-cards`)
- `name` - Card name (supports wildcards: `*chu`, `pika*`)
- `type` - Energy type (Fire, Water, Grass, etc.)
- `rarity` - Rarity level
- `hpMin` / `hpMax` - HP range
- `illustrator` - Artist name
- `category` - Pokemon | Trainer | Energy
- `stage` - Basic | Stage1 | Stage2 | V | VMAX | ex
- `legal` - standard | expanded
- `sort` / `order` - Sort field and direction
- `page` / `pageSize` - Pagination

## External APIs

### PokeAPI
- URL: pokeapi.co
- Use: Pokemon data (stats, moves, abilities, sprites)

### TCGDex
- URL: api.tcgdex.net
- Use: TCG + Pocket card data (primary source)
- No API key required
- Includes pricing: TCGPlayer (USD) + CardMarket (EUR)
- Adapter: `/utils/tcgdex-adapter.ts`
- Types: `/types/api/tcgdex.d.ts`

### Pokemon Showdown
- URL: play.pokemonshowdown.com
- Use: Item sprites, competitive data
- Utility: `/utils/showdownData.ts`

## Documentation

- **README.md** - Project overview and setup
- **docs/archive/** - Historical documentation and completed work
- **docs/archive/DECEMBER_2024_RELEASE_NOTES.md** - Latest release notes

---

## Recent Updates (December 2024)

Major improvements completed across 5 sprints. See full release notes in `/docs/archive/DECEMBER_2024_RELEASE_NOTES.md`.

### Key Changes

| Area | Change | Impact |
|------|--------|--------|
| Icons | Standardized to Feather (`react-icons/fi`) | Visual consistency |
| Mobile CSS | Removed 1610 lines of orphan CSS | 71% bundle reduction |
| Search | Added history, suggestions, keyboard nav | Better UX |
| PWA | Offline page, update notifications | Production ready |
| Error Tracking | Sentry integration | Debugging |
| Collections | Full CRUD with Supabase | Feature complete |
| Market | Real pricing data | Feature complete |

### New Utilities

```typescript
// Haptic feedback for mobile
import { haptic, useHaptic } from '@/utils/haptics';
haptic('light'); // light, medium, heavy, selection, success, warning, error

// Service worker hook
import { useServiceWorker } from '@/hooks/useServiceWorker';
const { isUpdateAvailable, isOffline, applyUpdate } = useServiceWorker();

// Market data hook
import { useMarketData } from '@/hooks/useMarketData';
const { trendingCards, priceMovers, loading } = useMarketData();
```

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TabPills` | `/components/ui/TabPills.tsx` | Scrollable tab navigation |
| `UpdateNotification` | `/components/ui/UpdateNotification.tsx` | PWA update banner |
| `OfflineIndicator` | `/components/ui/UpdateNotification.tsx` | Offline status bar |

### Icon Library Standard

**Use Feather icons (`react-icons/fi`) as the primary icon library.**

```typescript
// Preferred
import { FiChevronLeft, FiSearch, FiHeart } from 'react-icons/fi';

// Only use specialty icons when semantically necessary
import { GiPokerHand } from 'react-icons/gi'; // Card games only
```

### Back Navigation Standard

**Always use `StyledBackButton` for back navigation:**

```typescript
import StyledBackButton from '@/components/ui/StyledBackButton';

// Variants: 'default' | 'pokemon' | 'pocket' | 'tcg'
<StyledBackButton variant="pokemon" text="Back to Pokédex" />
```

---

## Production Configuration

### Sentry Error Tracking

Add to `.env.local` to enable:

```bash
NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
SENTRY_DSN=your_dsn_here

# Optional: Source maps upload
SENTRY_AUTH_TOKEN=your_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

### PWA Features

Automatic - no configuration needed:
- Offline page at `/offline`
- Update notifications via `PWAProvider`
- Service worker at `/sw.js` (v1.1.0)
