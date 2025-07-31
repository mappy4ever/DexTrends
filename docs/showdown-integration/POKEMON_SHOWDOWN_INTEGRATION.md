# Pokemon Showdown Data Integration

## Overview

This document outlines the integration of Pokemon Showdown data into the DexTrends application. Pokemon Showdown provides competitive battle data under the MIT license, complementing our existing PokeAPI integration with unique competitive insights.

## Project Goals

1. **Enhance Battle Accuracy**: Replace hardcoded type effectiveness with Showdown's precise multipliers
2. **Add Missing Features**: Implement complete learnsets (currently unavailable via PokeAPI)
3. **Competitive Intelligence**: Add tier placements and competitive viability indicators
4. **Improve Search**: Utilize aliases for enhanced search functionality
5. **Enable New Features**: Unlock competitive team building and format validation

## Data Sources Comparison

### Current State (PokeAPI Only)
- ✅ Pokemon sprites, artwork, cries
- ✅ Basic stats and types
- ✅ Evolution chains with methods
- ✅ Location and encounter data
- ✅ Flavor text and lore
- ❌ Complete movepool data
- ❌ Competitive tier information
- ❌ Accurate type effectiveness
- ❌ Ability ratings

### Future State (PokeAPI + Showdown)
- ✅ All current PokeAPI features retained
- ✅ Complete learnsets by generation
- ✅ Competitive tier placements
- ✅ Accurate battle calculations
- ✅ Enhanced move and ability data
- ✅ Format validation capabilities

## Integration Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   PokeAPI       │     │ Pokemon Showdown │     │   DexTrends     │
│   (Media/Lore)  │     │ (Battle/Compete) │     │   Application   │
└────────┬────────┘     └────────┬─────────┘     └────────▲────────┘
         │                       │                          │
         └───────────┬───────────┘                          │
                     │                                      │
              ┌──────▼──────────┐                          │
              │ Data Sync Layer │                          │
              │  (Node.js)      │                          │
              └──────┬──────────┘                          │
                     │                                      │
              ┌──────▼──────────┐      ┌──────────────────┤
              │    Supabase     │◄─────┤ UnifiedCache     │
              │    Database     │      │   Manager        │
              └─────────────────┘      └──────────────────┘
```

## Key Integration Points

### 1. Type Effectiveness System
- **Current**: Hardcoded in `/utils/typeEffectiveness.ts`
- **New**: Dynamic loading from Showdown's `typechart.js`
- **Benefit**: Accurate damage calculations, easier updates

### 2. Pokemon Learnsets
- **Current**: Not available
- **New**: Complete movepool from `learnsets.json`
- **Benefit**: Show all learnable moves, filter by generation

### 3. Competitive Data
- **Current**: No tier information
- **New**: Tier placements from `formats-data.js`
- **Benefit**: Team building guidance, usage insights

### 4. Enhanced Search
- **Current**: Exact name matching only
- **New**: Alias support from `aliases.js`
- **Benefit**: Search "zard" finds Charizard

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up data sync infrastructure
- Create Supabase tables
- Implement type effectiveness replacement
- Add learnset display to Pokemon details

### Phase 2: Competitive Features (Week 2)
- Integrate tier data
- Enhance move and ability pages
- Add competitive indicators to UI
- Implement format validation

### Phase 3: Advanced Features (Week 3)
- Smart search with aliases
- Team builder enhancements
- Battle simulator improvements
- Performance optimizations

## Data Usage Strategy

### Use Showdown For:
- Type effectiveness multipliers
- Complete learnsets
- Competitive tiers
- Ability ratings
- Move battle data
- Item effects
- Search aliases

### Continue Using PokeAPI For:
- Pokemon sprites and artwork
- Audio files (cries)
- Evolution details
- Location data
- Pokedex entries
- Berry information
- Version differences

## Success Metrics

1. **Performance**: Page load times remain under 2 seconds
2. **Accuracy**: Battle calculations match Showdown exactly
3. **Completeness**: 100% of Pokemon have learnset data
4. **Search**: 90% reduction in "no results" searches
5. **Features**: 5+ new competitive features enabled

## Risk Mitigation

1. **Data Size**: Implement progressive loading and caching
2. **Update Frequency**: Automated sync with change detection
3. **Breaking Changes**: Version tracking and rollback capability
4. **License Compliance**: MIT license attribution in footer

## Next Steps

1. Review and approve integration plan
2. Set up development environment
3. Create sync scripts (see IMPLEMENTATION_GUIDE.md)
4. Begin Phase 1 implementation
5. Monitor performance metrics

## References

- Pokemon Showdown GitHub: https://github.com/smogon/pokemon-showdown
- License: MIT (requires attribution)
- Data URL: https://play.pokemonshowdown.com/data/
- Update Frequency: Hourly for some data, weekly for tiers