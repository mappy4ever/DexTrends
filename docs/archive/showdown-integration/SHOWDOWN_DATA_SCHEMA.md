# Pokemon Showdown Data Schema Reference

This document details the structure of each Pokemon Showdown data file and how it maps to DexTrends requirements.

## Table of Contents
1. [Pokedex Data](#pokedex-data)
2. [Moves Data](#moves-data)
3. [Abilities Data](#abilities-data)
4. [Items Data](#items-data)
5. [Type Chart](#type-chart)
6. [Learnsets Data](#learnsets-data)
7. [Competitive Formats](#competitive-formats)
8. [Additional Data Files](#additional-data-files)

---

## Pokedex Data
**Files**: `pokedex.json`, `pokedex.js`

### Schema Structure
```typescript
interface ShowdownPokemon {
  num: number;                    // National dex number
  name: string;                   // Species name
  types: string[];                // Array of type names
  genderRatio?: {                 // Gender distribution
    M: number;                    // Male ratio (0-1)
    F: number;                    // Female ratio (0-1)
  };
  baseStats: {                    // Base stat values
    hp: number;
    atk: number;
    def: number;
    spa: number;                  // Special Attack
    spd: number;                  // Special Defense
    spe: number;                  // Speed
  };
  abilities: {                    // Available abilities
    0: string;                    // Primary ability
    1?: string;                   // Secondary ability
    H?: string;                   // Hidden ability
    S?: string;                   // Special ability (events)
  };
  heightm: number;                // Height in meters
  weightkg: number;               // Weight in kilograms
  color: string;                  // Pokemon color category
  evos?: string[];                // Evolution names
  prevo?: string;                 // Pre-evolution name
  evoLevel?: number;              // Level to evolve
  evoType?: string;               // Evolution method
  eggGroups: string[];            // Egg groups for breeding
  tier?: string;                  // Competitive tier
  forme?: string;                 // Form name
  baseForme?: string;             // Base form reference
  formes?: string[];              // Available forms
  gen: number;                    // Generation introduced
  isNonstandard?: string;         // "Past", "Future", "CAP"
}
```

### DexTrends Mapping
```sql
-- Supabase table: pokemon_competitive_data
CREATE TABLE pokemon_competitive_data (
  id SERIAL PRIMARY KEY,
  pokemon_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT,
  gender_ratio_male DECIMAL(3,2),
  gender_ratio_female DECIMAL(3,2),
  is_nonstandard TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Moves Data
**Files**: `moves.json`, `moves.js`

### Schema Structure
```typescript
interface ShowdownMove {
  num: number;                    // Move ID
  name: string;                   // Move name
  type: string;                   // Type name
  category: string;               // "Physical", "Special", "Status"
  power: number | null;           // Base power (null for status)
  accuracy: number | true;        // Accuracy % or true (always hits)
  pp: number;                     // Power Points
  priority: number;               // Move priority (-7 to 5)
  target: string;                 // Target type
  flags: {                        // Move flags
    protect?: 1;                  // Blocked by Protect
    mirror?: 1;                   // Copied by Mirror Move
    contact?: 1;                  // Makes contact
    sound?: 1;                    // Sound-based move
    punch?: 1;                    // Punching move
    bite?: 1;                     // Biting move
    bullet?: 1;                   // Bullet/ball move
    dance?: 1;                    // Dance move
    heal?: 1;                     // Healing move
  };
  secondary?: {                   // Secondary effects
    chance: number;               // Effect chance %
    status?: string;              // Status inflicted
    volatileStatus?: string;      // Volatile status
    boosts?: Record<string, number>; // Stat changes
  };
  drain?: [number, number];       // HP drain ratio
  recoil?: [number, number];      // Recoil damage ratio
  heal?: [number, number];        // Healing ratio
  desc: string;                   // Move description
  shortDesc: string;              // Brief description
  gen: number;                    // Generation introduced
}
```

### DexTrends Mapping
```sql
-- Supabase table: move_competitive_data
CREATE TABLE move_competitive_data (
  id SERIAL PRIMARY KEY,
  move_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  power INTEGER,
  accuracy INTEGER,
  pp INTEGER,
  priority INTEGER DEFAULT 0,
  category TEXT,
  target TEXT,
  flags JSONB,
  secondary_effect JSONB,
  drain_ratio DECIMAL(3,2),
  recoil_ratio DECIMAL(3,2),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Abilities Data
**File**: `abilities.js`

### Schema Structure
```typescript
interface ShowdownAbility {
  name: string;                   // Ability name
  num: number;                    // Ability ID
  desc: string;                   // Full description
  shortDesc: string;              // Brief description
  rating: number;                 // Competitive rating (0-5)
  flags?: {                       // Ability flags
    breakable?: 1;                // Can be suppressed
  };
  onModifyType?: string;          // Type modification
  onModifyMove?: string;          // Move modification
  gen: number;                    // Generation introduced
}
```

### DexTrends Mapping
```sql
-- Supabase table: ability_ratings
CREATE TABLE ability_ratings (
  id SERIAL PRIMARY KEY,
  ability_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  rating DECIMAL(2,1),
  competitive_desc TEXT,
  flags JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Items Data
**File**: `items.js`

### Schema Structure
```typescript
interface ShowdownItem {
  name: string;                   // Item name
  num: number;                    // Item ID
  gen: number;                    // Generation introduced
  desc: string;                   // Description
  spritenum: number;              // Sprite index
  fling?: {                       // Fling move data
    basePower: number;            // Fling damage
    status?: string;              // Status inflicted
  };
  onTakeItem?: boolean | string;  // Can be taken
  megaStone?: string;             // Mega evolution target
  megaEvolves?: string;           // Pokemon that can use
  naturalGift?: {                 // Natural Gift data
    basePower: number;
    type: string;
  };
  boosts?: Record<string, number>; // Stat boosts
  isNonstandard?: string;         // Availability status
}
```

---

## Type Chart
**File**: `typechart.js`

### Schema Structure
```typescript
interface TypeData {
  damageTaken: {                  // Incoming damage multipliers
    [type: string]: number;       // 0=immune, 1=normal, 2=weak, 3=resist
  };
  HPivs?: Record<string, number>; // Hidden Power IVs
  HPdvs?: Record<string, number>; // Hidden Power DVs
}

// Note: Damage multipliers are encoded as:
// 0 = No damage (immune)
// 1 = Normal damage (1x)
// 2 = Super effective (2x)
// 3 = Not very effective (0.5x)
```

### DexTrends Mapping
```sql
-- Supabase table: type_effectiveness
CREATE TABLE type_effectiveness (
  id SERIAL PRIMARY KEY,
  attacking_type TEXT NOT NULL,
  defending_type TEXT NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  UNIQUE(attacking_type, defending_type)
);

-- Convert Showdown encoding to multipliers:
-- 0 → 0.0
-- 1 → 1.0
-- 2 → 2.0
-- 3 → 0.5
```

---

## Learnsets Data
**Files**: `learnsets.json`, `learnsets.js`

### Schema Structure
```typescript
interface PokemonLearnset {
  [pokemonId: string]: {
    learnset: {
      [moveName: string]: string[]; // Array of learn methods
    }
  }
}

// Learn method format: "{generation}{method}{level?}"
// Examples:
// "8L1" = Gen 8, Level 1
// "8M" = Gen 8, TM/HM
// "8T" = Gen 8, Tutor
// "8E" = Gen 8, Egg Move
// "7V" = Gen 7, Virtual Console
```

### DexTrends Mapping
```sql
-- Supabase table: pokemon_learnsets
CREATE TABLE pokemon_learnsets (
  id SERIAL PRIMARY KEY,
  pokemon_id INTEGER NOT NULL,
  move_name TEXT NOT NULL,
  generation INTEGER NOT NULL,
  learn_method TEXT NOT NULL,
  level INTEGER,
  INDEX idx_pokemon_move (pokemon_id, move_name),
  INDEX idx_generation (generation)
);
```

---

## Competitive Formats
**Files**: `formats.js`, `formats-data.js`

### Formats Schema
```typescript
interface BattleFormat {
  name: string;                   // Format name
  section: string;                // Menu section
  column?: number;                // Display column
  challengeShow?: boolean;        // Show in challenges
  searchShow?: boolean;           // Show in search
  ruleset: string[];              // Applied rules
  banlist: string[];              // Banned elements
  unbanlist?: string[];           // Exceptions to bans
  restricted?: string[];          // Restricted list
  teambuilderFormat?: string;     // Builder format
}
```

### Formats Data Schema
```typescript
interface PokemonFormatsData {
  [pokemonId: string]: {
    tier?: string;                // Singles tier
    doublesTier?: string;         // Doubles tier
  }
}

// Common tiers:
// "Uber", "OU", "UU", "RU", "NU", "PU", "LC"
// Prefixed with () means by technicality
```

### DexTrends Mapping
```sql
-- Supabase table: competitive_tiers
CREATE TABLE competitive_tiers (
  id SERIAL PRIMARY KEY,
  pokemon_name TEXT NOT NULL,
  singles_tier TEXT,
  doubles_tier TEXT,
  national_dex_tier TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pokemon_name)
);
```

---

## Additional Data Files

### Aliases (`aliases.js`)
```typescript
interface Aliases {
  [alias: string]: string;  // alias -> canonical name
}
// Examples: "zard" -> "charizard", "ttar" -> "tyranitar"
```

### Search Index (`search-index.js`)
```typescript
type SearchEntry = [
  term: string,      // Search term
  type: string,      // "pokemon", "move", "ability", etc.
  id: number,        // Resource ID
  relevance: number  // Search relevance score
];
```

### Graphics (`graphics.js`)
- Sprite dimensions and positions
- Animation data for battle effects
- Background collections by generation

### Team Builder Tables (`teambuilder-tables.js`)
- Extensive data for team composition
- Format-specific restrictions
- Stat calculation tables

---

## Data Transformation Notes

1. **Type Effectiveness**: Convert Showdown's 0/1/2/3 encoding to decimal multipliers
2. **Stats**: Showdown uses abbreviated stat names (atk, def, spa, spd, spe)
3. **Generations**: Showdown uses numbers, ensure consistency with PokeAPI
4. **Tiers**: May need mapping between competitive communities' naming
5. **Learn Methods**: Parse generation prefix from learn method strings
6. **Nonstandard**: Track "Past", "CAP", "Future" for filtering

## Next Steps

See `IMPLEMENTATION_GUIDE.md` for code examples on fetching and transforming this data.