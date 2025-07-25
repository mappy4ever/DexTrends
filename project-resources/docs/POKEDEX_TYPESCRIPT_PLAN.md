# Pokedex.js TypeScript Conversion Plan

## File Overview
- **File**: `pages/pokedex.js`
- **Lines**: 1,153 lines
- **Complexity**: High - involves API fetching, filtering, sorting, and infinite scroll
- **Dependencies**: React hooks, Next.js router, custom components, utility functions

## Main Data Structures to Define

### 1. Enhanced Pokemon Data Interface
```typescript
interface EnhancedPokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string | null;
  height: number;
  weight: number;
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
  isUltraBeast: boolean;
  stage: number | 'mega' | 'legendary';
  baseStats: number;
  isStarter?: boolean;
  isBaby?: boolean;
}
```

### 2. Filter State Interfaces
```typescript
interface FilterOption {
  value: string;
  label: string;
}

interface SidebarFilter {
  id: string;
  type: 'search' | 'select' | 'types' | 'multiselect';
  label: string;
  placeholder?: string;
  value: string | string[];
  options?: FilterOption[];
}

type SortOption = 'id' | 'name' | 'type' | 'generation' | 'stats' | 'height' | 'weight';
```

### 3. Component State Type
```typescript
interface PokedexState {
  pokemon: EnhancedPokemon[];
  allPokemon: EnhancedPokemon[];
  loading: boolean;
  loadingProgress: number;
  error: string | null;
  searchTerm: string;
  selectedType: string;
  selectedGeneration: string;
  selectedCategory: string;
  selectedStage: string;
  sortBy: SortOption;
  visibleCount: number;
  isLoadingMore: boolean;
  showAdvancedFilters: boolean;
  showSortOptions: boolean;
  pendingSearchTerm: string;
  pendingTypes: string[];
  pendingGeneration: string;
  pendingCategories: string[];
  pendingStages: string[];
  pendingSortBy: SortOption;
}
```

### 4. API Response Handling
```typescript
interface PokemonApiResponse {
  // From PokeAPI
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  types: PokemonType[];
  stats: PokemonStat[];
  species: {
    name: string;
    url: string;
  };
}
```

## Key Conversion Steps

### 1. Import Updates
- Import types from existing type definitions
- Add React.FC type for component
- Import NextPage type from Next.js

### 2. State Management
- Convert all useState hooks to typed versions
- Type the ref for search timeout
- Add proper typing for event handlers

### 3. Helper Functions
- Type all helper function parameters and returns
- Create type guards for Pokemon categories
- Type the enhanced Pokemon data function

### 4. API Calls
- Type fetchData responses
- Handle error types properly
- Type Promise arrays in batch fetching

### 5. Memoized Values
- Type useMemo returns for filtered/sorted Pokemon
- Type the filter predicates

### 6. Event Handlers
- Type onClick handlers
- Type onChange handlers for inputs
- Type the router.push navigation

### 7. Component Props
- Add proper typing for page component
- Type the fullBleed property

## Type Imports Needed
```typescript
import type { NextPage } from 'next';
import type { Pokemon, PokemonSpecies } from '../types/api/pokemon';
```

## Potential Challenges

1. **Dynamic Type Classes**: The component uses dynamic Tailwind classes like `from-poke-${type}` which TypeScript won't validate
2. **API Error Handling**: Need to properly type error responses from PokeAPI
3. **Ref Typing**: The searchTimeoutRef needs proper typing
4. **Complex Filtering Logic**: The multi-select filter logic needs careful typing
5. **Infinite Scroll**: Window event listeners need proper typing

## Benefits After Conversion

1. **Type Safety**: All Pokemon data will be type-checked
2. **Better IntelliSense**: IDE will provide better autocomplete
3. **Easier Refactoring**: Changes to data structures will be caught at compile time
4. **Documentation**: Types serve as inline documentation
5. **Bug Prevention**: Many runtime errors will be caught during development

## Testing Strategy

1. Verify all filters work correctly
2. Test infinite scroll functionality
3. Ensure sorting works for all options
4. Check that Pokemon navigation works
5. Verify loading states display properly
6. Test error handling for failed API calls