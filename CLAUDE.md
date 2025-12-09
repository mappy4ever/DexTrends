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
| **Responsive Grid** | `UnifiedGrid` | `/components/ui/UnifiedGrid.tsx` |
| **Filter Sheet** | `FilterDrawer` | `/components/ui/FilterDrawer.tsx` |
| **Rating Badges** | `RatingTierBadge` | `/components/ui/RatingTierBadge.tsx` |
| **Rarity Icons** | `RarityIcon` | `/components/ui/RarityIcon.tsx` |

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

**Documented Exceptions (domain-specific with no Feather equivalent):**

| Icon | Library | Usage | Reason |
|------|---------|-------|--------|
| `FaMars`, `FaVenus` | FontAwesome | Gender ratio display | Universal gender symbols |
| `FaWeight` | FontAwesome | Pokemon weight | Semantic weight icon |
| `FaDna` | FontAwesome | Genetics/breeding | DNA helix symbol |
| `FaEgg` | FontAwesome | Egg groups | Semantic egg icon |
| `FaGamepad` | FontAwesome | Gaming features | Gamepad symbol |
| `MdCatchingPokemon` | Material | Pokemon-specific UI | Pokeball icon |
| `GiPokerHand` | GameIcons | Card game actions | Card hand symbol |
| `GiSwordWound`, `GiShield` | GameIcons | Combat/competitive | Battle semantics |
| `GiSparkles` | GameIcons | Special effects | Magic/sparkle effect |
| `GiTrophy`, `GiLaurelCrown` | GameIcons | Achievements/wins | Trophy symbols |
| `GiTwoCoins` | GameIcons | Currency/economy | Coin symbol |
| `FaTwitter`, `FaReddit`, `FaDiscord` | FontAwesome | Social sharing | Brand icons |
| `FaQrcode` | FontAwesome | QR code sharing | QR symbol |

All exceptions must include a comment explaining the domain-specific reason:
```typescript
// Pokemon-specific icon - documented domain exception
import { MdCatchingPokemon } from 'react-icons/md';
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

---

## Active Audit Work (December 2024)

### Current Sprint: Visual Consistency Foundation

Full audit plan: `/.claude/plans/sharded-watching-leaf.md`

#### Status Tracker

| Task | Status | Notes |
|------|--------|-------|
| Consolidate RarityIcon variants | DONE | Deprecated CleanRaritySymbol, ProfessionalRarityIcon, migrated all usages |
| PokeballLoader design tokens | DONE | Added POKEBALL_BORDER_COLOR constant, documented domain-specific colors |
| TYPE_GRADIENTS duplication | DONE | TypeBadge.tsx now imports from glass-constants.ts |
| Rename CompetitiveTierBadge | DONE | Renamed to RatingTierBadge, added backwards-compatible alias |
| Icon Migration Sprint 1 | DONE | PokemonHeroSectionV3: FaStar→FiStar, FaHeart→FiHeart, FaRuler→FiMaximize2. FaMars/FaVenus/FaWeight kept as documented exceptions (domain-specific) |
| Standardize EmptyState | DONE | Migrated pocketmode, tcgexpansions, games.tsx to use ErrorState/NoSearchResults from EmptyState |
| Icon Migration Sprint 2 | DONE | games.tsx: Bs→Fi (Calendar, Globe, ArrowRight, Play). PocketCardList: FaCrown→FiAward. Navbar: Removed Ri/Ai icons, added FiZap |
| Icon Migration Sprint 3 | DONE | VoiceSearchInterface, GameTimeline, TradingMarketplace, TournamentSystem, SocialPlatform, GameficationSystem, AdvancedDeckBuilder, CircularCard, CollectionTracker, CardSharingSystem, LocationsTab, constants.ts |
| Pagination ARIA (A1) | DONE | Already had comprehensive ARIA: aria-label, aria-current, role="navigation", keyboard nav |
| TypeBadge accessibility (A2) | DONE | Already had role="button", tabIndex, aria-label, aria-describedby when interactive |
| Document unified infrastructure | DONE | Added UnifiedGrid, FilterDrawer, RatingTierBadge, RarityIcon to Canonical Components table |
| Health endpoint (S2) | DONE | Returns 503 for degraded/unhealthy, removed NODE_ENV from response |
| Type safety cleanup | DONE | Fixed `any` types in api-middleware.ts, unifiedFetch.ts, supabase.ts |
| E2E route coverage test | DONE | Created tests/audit/full-route-coverage.spec.ts with 44 routes × 3 viewports |
| API latency monitoring | DONE | Created tests/audit/api-latency.spec.ts - 8 endpoints tested, all passing |
| Filter pattern audit | DONE | FilterDrawer is canonical; page-specific filters (pokedex types, pocket drawer) work well |
| Skeleton audit | DONE | SkeletonLoadingSystem has 10+ variants (Card, Pokemon, List, Table, Chart, Form, Detail, Nav) |
| Grid breakpoint audit | DONE | UnifiedGrid provides 2→3→4→6→8 responsive columns; standard inline: grid-cols-2 sm:3 md:4 lg:5 xl:6 |
| Visual regression testing | DONE | Created tests/audit/visual-regression.spec.ts - 12 pages × 2 viewports |
| Accessibility audit (axe-core) | DONE | Created tests/audit/accessibility.spec.ts - WCAG 2.1 AA scanning, 12 pages |
| Focus trap fixes (A3) | DONE | Added focus trap to FilterDrawer and MoreSheet (Modal, Sheet, Dialog, ConfirmDialog already had it) |

#### Deprecated Components

**DO NOT USE** - These components are deprecated and will be removed:

| Component | Replacement | Reason |
|-----------|-------------|--------|
| `CleanRaritySymbol` | `RarityIcon` | Duplicate functionality |
| `ProfessionalRarityIcon` | `RarityIcon` | Duplicate functionality |

#### Rarity Icons Standard

**Always use `RarityIcon` from `/components/ui/RarityIcon.tsx`:**

```typescript
import { RarityIcon, RARITY_ORDER, getRarityRank } from '@/components/ui/RarityIcon';

// Basic usage
<RarityIcon rarity="Rare Holo" size="md" />

// With filter interaction
<RarityIcon rarity="Rare Holo" onClick={() => handleFilter("Rare Holo")} isActive={true} />

// Get rarity rank for sorting
const rank = getRarityRank("Illustration Rare"); // Returns numeric rank
```

#### Icon Migration Status: COMPLETE

All non-Feather icons have been migrated or documented as domain exceptions.

**Completed Migrations:**
- [x] PokemonHeroSectionV3.tsx - FaStar→FiStar, FaHeart→FiHeart, FaRuler→FiMaximize2
- [x] StarterShowcaseComplete.tsx - GiSwordWound, GiShield kept (documented exception)
- [x] CleanRaritySymbol.tsx - Deprecated, use RarityIcon instead
- [x] VoiceSearchInterface.tsx - FaSpinner→FiLoader, FaMicrophone→FiMic, BsSoundwave→FiActivity
- [x] GameTimeline.tsx - BsController→FiMonitor, BsGlobe→FiGlobe, BsCalendar→FiCalendar
- [x] TradingMarketplace.tsx - FaDollarSign→FiDollarSign, FaExchangeAlt→FiRefreshCw
- [x] TournamentSystem.tsx - BsGraphUp→FiTrendingUp, FaUsers→FiUsers
- [x] SocialPlatform.tsx - FaHeart→FiHeart, FaComment→FiMessageCircle, FaShare→FiShare2
- [x] GameficationSystem.tsx - BsLightning→FiZap, BsCollection→FiLayers
- [x] AdvancedDeckBuilder.tsx - FaSave→FiSave, type icons documented
- [x] CircularCard.tsx - FaHeart→FiHeart, FaShare→FiShare2, FaInfo→FiInfo
- [x] CollectionTracker.tsx - FaChartPie→FiPieChart, FaTrophy→FiAward, FaStar→FiStar
- [x] CardSharingSystem.tsx - FaShare→FiShare2, FaDownload→FiDownload
- [x] LocationsTab.tsx - FaMapMarkerAlt→FiMapPin, FaFilter→FiFilter
- [x] constants.ts (competitive) - Domain exceptions documented

**Migration Map (for reference):**
```
FaStar → FiStar          FaHeart → FiHeart
FaRuler → FiMaximize2    FaTag → FiTag
FaWeight → FiActivity    FaCrown → FiAward
BsGrid → FiGrid          BsList → FiList
BsCalendar → FiCalendar  BsGlobe → FiGlobe
FaSpinner → FiLoader     FaMicrophone → FiMic
FaShare → FiShare2       FaDownload → FiDownload
```

#### Audit Test Suite

Run production audit tests:

```bash
# Full route coverage (44 routes × 3 viewports = 132 tests)
npx playwright test tests/audit/full-route-coverage.spec.ts --project=chromium

# API latency monitoring (8 endpoints)
npx playwright test tests/audit/api-latency.spec.ts --project=chromium

# Visual regression (generate baselines first run)
npx playwright test tests/audit/visual-regression.spec.ts --update-snapshots
npx playwright test tests/audit/visual-regression.spec.ts --project=chromium

# Accessibility audit (WCAG 2.1 AA)
npx playwright test tests/audit/accessibility.spec.ts --project=chromium

# Run all audit tests
npx playwright test tests/audit/ --project=chromium
```

Results are saved to:
- `test-results/audit-screenshots/` - Screenshots from route coverage
- `test-results/` - Visual regression snapshots and traces

---

## Pending Tasks (Next Session)

### 1. Set Up OAuth Providers for Authentication

**Step 1: Run Supabase Migration**
- Go to Supabase SQL Editor
- Run contents of `supabase/migrations/20241210_user_profiles.sql`

**Step 2: Configure OAuth in Supabase Dashboard**

All redirect URIs use: `https://ptvpxfrfkkzisihufitz.supabase.co/auth/v1/callback`

| Provider | Setup URL | Notes |
|----------|-----------|-------|
| Google | https://console.cloud.google.com/ | APIs & Services → Credentials → OAuth Client ID |
| GitHub | https://github.com/settings/developers | New OAuth App |
| Discord | https://discord.com/developers/applications | New Application → OAuth2 |

After getting Client ID & Secret from each provider, add them in:
**Supabase Dashboard → Authentication → Providers**

### 2. Set Up Price History Tracking
- Create `price_history` table migration
- Set up scheduled job to capture daily prices
- Add price history charts to card detail pages

### 3. Completed This Session
- [x] Showdown sync added to GitHub Actions (weekly on Sundays)
- [x] Fixed mobile navbar safe area issues (iOS notch support)
- [x] Enabled AuthProvider for user login/signup
- [x] Created profiles table migration
- [x] Created /profile page with logout
