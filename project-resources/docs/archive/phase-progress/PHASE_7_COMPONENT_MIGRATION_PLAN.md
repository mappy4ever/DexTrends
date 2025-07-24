# Phase 7: Component Migration Plan

## Current State Analysis (July 13, 2025)

### TypeScript Migration Status
- **Utility Files**: 61/61 (100%) ✅ COMPLETE!
- **Components**: 58/247 (23.5%) - 189 JS files, 58 TSX files
- **Context**: 0/5 (0%) - 5 JS files
- **Pages**: 0/62 (0%) - 62 JS files
- **Overall**: 119/375 TypeScript files (31.7%)

### Component Structure Breakdown

#### Context Files (5 total) - HIGH PRIORITY
1. `UnifiedAppContext.js` - Core state management (used everywhere)
2. `NavigationContext.js` - Navigation state
3. `SearchContext.js` - Search functionality
4. `ThemeContext.js` - Theme management
5. `UserContext.js` - User state

#### Core Components (Root level)
- `CardList.js` - Main card display component
- `TrendingCards.js` - Trending cards display
- `CollectionManager.js` - Collection management
- `PokemonList.js` - Pokemon listing
- `SearchComponent.js` - Search interface

#### UI Components (`/components/ui/`)
- 58 TSX files already converted
- ~130+ JS files remaining
- Key components: modals, navigation, interactions

#### Page Components (`/pages/`)
- 62 JS files including:
  - API routes (`/api/` - 15 files)
  - Main pages (index, favorites, collections)
  - Dynamic routes ([cardId], [pokeid], etc.)

## Migration Strategy

### Phase 7A: Context Migration (Week 1)
**Goal**: Convert all 5 context files to TypeScript

1. **UnifiedAppContext.js** → UnifiedAppContext.tsx
   - Already has type definitions in `/types/unified-app-context.d.ts`
   - Critical for all components
   - Estimated: 500-700 lines

2. **NavigationContext.js** → NavigationContext.tsx
3. **SearchContext.js** → SearchContext.tsx
4. **ThemeContext.js** → ThemeContext.tsx
5. **UserContext.js** → UserContext.tsx

### Phase 7B: Core Components (Week 2)
**Goal**: Convert high-usage components

Priority order:
1. `SearchComponent.js` - Used on every page
2. `CardList.js` - Core functionality
3. `TrendingCards.js` - Homepage component
4. `CollectionManager.js` - User features
5. `PokemonList.js` - Pokedex functionality

### Phase 7C: API Routes (Week 3)
**Goal**: Convert all API routes to TypeScript

- `/pages/api/*.js` (15 files)
- Add proper request/response types
- Ensure type safety for API contracts

### Phase 7D: Page Components (Week 4)
**Goal**: Convert main page components

Priority:
1. Index page
2. Dynamic routes ([cardId], [pokeid])
3. Feature pages (favorites, collections)
4. Secondary pages

### Phase 7E: UI Components (Weeks 5-6)
**Goal**: Complete UI component migration

- Group by functionality
- Convert in batches
- Maintain design system consistency

## Success Metrics

1. **Type Safety**: 100% of components with proper types
2. **Build Success**: No TypeScript errors
3. **Bundle Size**: Maintain or reduce current 867 KB
4. **Performance**: No regression in metrics
5. **Testing**: All tests passing

## Technical Considerations

1. **Use Existing Patterns**:
   - Follow patterns from existing TSX components
   - Reuse type definitions from `/types`
   - Maintain consistent prop interfaces

2. **Gradual Migration**:
   - Convert one file at a time
   - Test after each conversion
   - Maintain backward compatibility

3. **Type Definition Strategy**:
   - Create shared types in `/types`
   - Use strict typing for props
   - Avoid `any` types

4. **Common Patterns to Apply**:
   ```typescript
   // Component props interface
   interface ComponentProps {
     prop1: string;
     prop2?: number;
     children?: React.ReactNode;
   }
   
   // Event handlers
   const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
     // ...
   };
   
   // Ref types
   const ref = useRef<HTMLDivElement>(null);
   ```

## Next Steps

1. Start with UnifiedAppContext.js conversion
2. Create missing type definitions
3. Set up component template for consistency
4. Begin systematic migration

## Estimated Timeline

- **Phase 7 Total**: 6 weeks
- **Daily Target**: 5-10 components
- **Completion Date**: End of August 2025

This migration will bring the codebase to ~50% TypeScript coverage and provide type safety for all critical application components.