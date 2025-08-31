# DexTrends Naming Conventions

## Overview
This document establishes naming conventions for the DexTrends codebase to ensure consistency, clarity, and maintainability.

## Core Principles
1. **Clarity over Brevity** - Names should be self-documenting
2. **Consistency** - Similar components use similar patterns
3. **No Ambiguity** - Each name should have one clear meaning
4. **Purpose-Driven** - Names reflect what something does, not how

## Component Naming

### Base Components
Use semantic, descriptive names without unnecessary prefixes:
- ✅ `Button`, `Modal`, `Dropdown`
- ❌ `SimpleButton`, `BasicModal`, `StandardDropdown`

### Component Prefixes (When Needed)
Only use prefixes when they add meaningful distinction:

| Prefix | Usage | Example |
|--------|-------|---------|
| `Base*` | Foundation/primitive components | `BaseButton`, `BaseInput` |
| `Smart*` | Components with business logic/state | `SmartSearch`, `SmartFilter` |
| `TCG*` | Trading Card Game specific | `TCGCard`, `TCGSetList` |
| `Pokemon*` | Pokemon-specific (non-TCG) | `PokemonStats`, `PokemonEvolution` |
| `Mobile*` | Mobile-only components | `MobileNavigation`, `MobileGestures` |

### Card vs Tile vs Display
**Critical Distinction** to avoid confusion:

| Term | Usage | Example |
|------|-------|---------|
| `*Card` | ONLY for actual trading cards | `TCGCard`, `FlippableCard`, `CardDetail` |
| `*Tile` | Grid/list UI containers | `PokemonTile`, `GymLeaderTile`, `SetTile` |
| `*Display` | Detailed view components | `PokemonDisplay`, `StatsDisplay` |
| `*Avatar` | Circular/profile images | `PokemonAvatar`, `TrainerAvatar` |

### Examples of Proper Naming
```
❌ PokemonCard (UI component) → ✅ PokemonTile
❌ GymLeaderCard (not a TCG card) → ✅ GymLeaderTile
❌ EnhancedPokemonCard → ✅ PokemonDisplay
❌ CircularPokemonCard → ✅ PokemonAvatar
✅ TCGCard (actual trading card)
✅ FlippableTCGCard (trading card with flip animation)
```

## File & Folder Structure

### Component Files
```
components/
  ui/                    # Generic UI components
    Button.tsx
    Modal.tsx
  pokemon/               # Pokemon-specific components
    PokemonTile.tsx
    PokemonDisplay.tsx
    PokemonEvolution.tsx
  tcg/                   # Trading card components
    TCGCard.tsx
    TCGSetGrid.tsx
    TCGPriceChart.tsx
  layout/                # Layout components
    Header.tsx
    Footer.tsx
    Sidebar.tsx
```

### Utility Files

| Suffix | Usage | Example |
|--------|-------|---------|
| `*Utils` | Pure utility functions | `dateUtils`, `formatUtils` |
| `*Service` | External API integrations | `pokeApiService`, `tcgService` |
| `*Manager` | Stateful/singleton managers | `cacheManager`, `stateManager` |
| `*Config` | Configuration objects | `routeConfig`, `themeConfig` |
| `*Types` | Type definitions | `pokemonTypes`, `tcgTypes` |

### Examples
```
utils/
  formatUtils.ts         # Formatting utilities
  dateUtils.ts           # Date manipulation
  pokeApiService.ts      # PokeAPI integration
  tcgPriceService.ts     # TCG price API
  cacheManager.ts        # Cache management
  themeConfig.ts         # Theme configuration
```

## Page Naming

### Route Files
Use kebab-case for routes, descriptive names:
```
pages/
  index.tsx              # Home page
  pokedex.tsx            # Pokédex listing
  tcg-sets.tsx           # TCG set listing
  tcg-sets/[id].tsx      # TCG set detail
  pokemon/[id].tsx       # Pokemon detail
  pocket-mode/           # Pocket mode features
  battle-simulator.tsx   # Battle simulator
```

### Page Component Names
Use PascalCase matching the route purpose:
```typescript
// pages/pokedex.tsx
export default function PokedexPage() { }

// pages/tcg-sets.tsx
export default function TCGSetsPage() { }

// pages/pokemon/[id].tsx
export default function PokemonDetailPage() { }
```

## TypeScript Types & Interfaces

### Naming Pattern
- Interfaces: `I` prefix optional, use for contracts
- Types: Descriptive names, no prefix
- Enums: PascalCase, singular

```typescript
// ✅ Good
interface Pokemon {
  id: number;
  name: string;
}

type PokemonType = 'fire' | 'water' | 'grass';

enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare'
}

// ❌ Bad
interface IPokemonInterface { } // Redundant
type TPokemonType = string;     // Unnecessary prefix
```

## Function & Hook Naming

### Functions
- Use camelCase
- Start with verb
- Be descriptive

```typescript
// ✅ Good
function calculateDamage() { }
function fetchPokemonData() { }
function formatCurrency() { }

// ❌ Bad
function damage() { }      // Not descriptive
function PokemonData() { }  // Should be camelCase
function fmt() { }         // Too abbreviated
```

### Custom Hooks
- Always start with `use`
- Descriptive of what they provide

```typescript
// ✅ Good
useAuth()
usePokemonData()
useTCGPrices()
useInfiniteScroll()

// ❌ Bad
auth()           // Not a hook
useData()        // Too generic
useTCG()         // Too abbreviated
```

## CSS Classes & Styling

### CSS Modules
Use camelCase for CSS module classes:
```scss
// styles/Pokemon.module.scss
.pokemonTile { }
.evolutionChain { }
.statsDisplay { }
```

### Tailwind Classes
Use semantic grouping with comments:
```tsx
<div className={cn(
  // Layout
  "flex flex-col gap-4",
  // Styling
  "bg-white rounded-lg shadow-md",
  // Responsive
  "md:flex-row md:gap-6"
)} />
```

## API Routes & Endpoints

### API Routes (Next.js)
```
pages/api/
  pokemon/
    [id].ts              # GET /api/pokemon/123
    search.ts            # GET /api/pokemon/search
  tcg/
    sets.ts              # GET /api/tcg/sets
    cards/[id].ts        # GET /api/tcg/cards/123
```

### Endpoint Naming
- Use plural for collections: `/pokemon`, `/cards`
- Use singular for single resources: `/pokemon/123`
- Use kebab-case for multi-word: `/gym-leaders`

## State & Props

### State Variables
```typescript
// ✅ Good
const [isLoading, setIsLoading] = useState(false);
const [selectedPokemon, setSelectedPokemon] = useState(null);
const [filters, setFilters] = useState({});

// ❌ Bad
const [loading, setLoading] = useState(false);     // Should be isLoading
const [pokemon, setPokemon] = useState(null);      // Not clear if single or multiple
const [data, setData] = useState({});              // Too generic
```

### Component Props
```typescript
interface PokemonTileProps {
  pokemon: Pokemon;        // Singular for single item
  onSelect?: () => void;   // on* for event handlers
  isSelected?: boolean;    // is* for boolean
  className?: string;      // Optional styling
}
```

## Common Patterns to Avoid

### 1. Redundant Naming
```typescript
// ❌ Bad
PokemonPokemon
CardCard
ComponentComponent

// ✅ Good
Pokemon
Card
Component
```

### 2. Inconsistent Pluralization
```typescript
// ❌ Bad - Mixed plurality
interface PokemonList {
  pokemon: Pokemon[];  // Should be pokemons or items
}

// ✅ Good - Consistent
interface PokemonList {
  items: Pokemon[];
  total: number;
}
```

### 3. Ambiguous Abbreviations
```typescript
// ❌ Bad
const pkm = fetchPokemon();
const dmg = calculateDamage();
const usr = getCurrentUser();

// ✅ Good
const pokemon = fetchPokemon();
const damage = calculateDamage();
const user = getCurrentUser();
```

## Migration Guide

### Phase 1: Critical Renames (Immediate)
1. All `*Card` components that aren't TCG cards → `*Tile` or `*Display`
2. Duplicate components → Single source
3. Fix casing issues (e.g., `apiutils` → `apiUtils`)

### Phase 2: Standardization (Next Sprint)
1. Apply prefix conventions
2. Consolidate utility files
3. Standardize route names

### Phase 3: Documentation (Ongoing)
1. Update component documentation
2. Add JSDoc comments
3. Update README files

## Enforcement

### ESLint Rules
```json
{
  "rules": {
    "naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

### Pre-commit Hooks
- Validate naming conventions
- Check for duplicate component names
- Ensure consistent imports

## Exceptions

Some legacy code or third-party integrations may not follow these conventions:
- External API response fields
- Third-party library requirements
- Legacy database fields

Document exceptions in code:
```typescript
// Exception: External API uses snake_case
const { pokemon_species } = apiResponse;
```

## Review Checklist

Before merging PRs, ensure:
- [ ] No `*Card` components unless actual TCG cards
- [ ] No duplicate component names
- [ ] Consistent file naming (camelCase for utils, PascalCase for components)
- [ ] Clear, descriptive names
- [ ] Proper TypeScript types (no unnecessary `any`)
- [ ] Consistent pluralization
- [ ] No ambiguous abbreviations

## Questions?

If unsure about naming:
1. Check this document
2. Look for similar existing patterns
3. Ask in code review
4. Err on the side of clarity

---

*Last Updated: 2025-08-30*
*Version: 1.0*