# DexTrends

A comprehensive Pokemon TCG and Pokedex application featuring card prices, collection management, battle simulation, and Pokemon data.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3001
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Database & Auth |
| Redis | Caching |
| Playwright | E2E testing |

## Features

### Pokedex
- Complete Pokemon database with advanced filtering
- Detailed Pokemon pages (stats, moves, abilities, evolutions)
- Type effectiveness calculator
- Regional variants support

### TCG Cards
- Card database with real-time prices
- Set browser with all expansions
- Collection manager
- Deck builder

### Pokemon TCG Pocket
- Pocket expansion browser
- Pocket card database
- Deck builder for Pocket format

### Battle Tools
- Battle simulator
- Team builder
- EV optimizer

## Project Structure

```
/components
  /ui           # Reusable UI components (Button, Modal, Container, etc.)
  /pokemon      # Pokemon-specific components
  /tcg          # Trading card components
/pages          # Next.js pages and API routes
/utils          # Utility functions
/hooks          # Custom React hooks
/types          # TypeScript type definitions
/styles         # Global CSS and design system
/tests          # Playwright E2E tests
/docs           # Documentation
/lib            # Server-side utilities (cache, database)
```

## Commands

```bash
npm run dev          # Start development server (port 3001)
npm run build        # Production build
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript check (must pass)
npm test             # Run Playwright tests
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY=your_tcg_api_key  # Optional, for higher rate limits
REDIS_URL=your_redis_url  # Optional, for caching
```

## Key APIs

| Endpoint | Description |
|----------|-------------|
| `/api/tcgexpansions` | TCG card sets list |
| `/api/tcgexpansions/[setId]` | Set details and cards |
| `/api/pocket-expansions` | Pokemon Pocket expansions |
| `/api/pocket-cards` | Pocket card database |
| `/api/tcg-sets` | Alternative TCG sets endpoint |

## Documentation

- **CLAUDE.md** - Developer context and coding guidelines
- **docs/** - Additional documentation and archives

## Design System

The app uses a consistent design system:
- 12px border radius for buttons, cards, inputs
- 16px border radius for modals
- Blue-based accent colors
- Glass morphism effects with backdrop blur

Core UI components in `/components/ui/`:
- `Button` - All button variants
- `Modal` - Dialog system
- `Container` - Content cards
- `Skeleton` - Loading states

## License

Private and proprietary.
