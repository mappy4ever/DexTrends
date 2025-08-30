# Production Routes Documentation
**Last Updated**: 2025-08-30
**Status**: CRITICAL - This documents the ONLY production routes

## ✅ Active Production Routes

These are the ONLY routes accessible to users and linked from navigation:

| Route | File | Description | Status |
|-------|------|-------------|--------|
| `/` | `pages/index.tsx` | Homepage | ✅ Production |
| `/pokedex` | `pages/pokedex.tsx` | Pokédex (uses unified components) | ✅ Production |
| `/tcgexpansions` | `pages/tcgexpansions.tsx` | TCG Sets Collection | ✅ Production |
| `/type-effectiveness` | `pages/type-effectiveness.tsx` | Type Chart | ✅ Production |
| `/battle-simulator` | `pages/battle-simulator.tsx` | Battle Simulator | ✅ Production |
| `/pocketmode` | `pages/pocketmode/index.tsx` | Pocket Mode | ✅ Production |
| `/pokemon/regions` | `pages/pokemon/regions/index.tsx` | Regions | ✅ Production |
| `/pokemon/starters` | `pages/pokemon/starters.tsx` | Starters | ✅ Production |
| `/team-builder` | `pages/team-builder/index.tsx` | Team Builder | ✅ Production |
| `/trending` | `pages/trending.tsx` | Price Tracker | ✅ Production |
| `/favorites` | `pages/favorites.tsx` | Favorites | ✅ Production |
| `/fun` | `pages/fun.tsx` | Fun Features | ✅ Production |

## 🚫 Experimental Pages (MOVED TO _experimental)

These pages were publicly accessible but have been moved to prevent user access:

| Original Route | File | Reason | Current Location |
|----------------|------|--------|------------------|
| `/index-unified` | `index-unified.tsx` | Experimental unified version | `pages/_experimental/` |
| `/pokedex-unified` | `pokedex-unified.tsx` | Older unified demo | `pages/_experimental/` |
| `/pokedex-new` | `pokedex-new.tsx` | Exact duplicate of pokedex.tsx | `pages/_experimental/` |
| `/tcgsets-unified` | `tcgsets-unified.tsx` | Simplified unified version | `pages/_experimental/` |
| `/type-effectiveness-unified` | `type-effectiveness-unified.tsx` | Experimental version | `pages/_experimental/` |

## Architecture Notes

### Mixed Architecture Reality
- **Production pages ARE using unified components** despite not having "unified" in their names
- Example: `pokedex.tsx` imports from `/components/unified/`
- The architecture is already mixed - this is intentional

### Component Usage
Production pages use these unified components:
- `UnifiedGrid` - Virtual scrolling grid
- `AdaptiveModal` - Responsive modal system
- `PokemonCardRenderer` - Card rendering
- `unifiedFetch` - API fetching utility

### Navigation Links
All navigation in `components/Navbar.tsx` points to production routes only.

## Emergency Fix Log

### 2025-08-30 - Critical Security Fix
**Problem**: All duplicate page versions were publicly accessible via Next.js automatic routing
**Solution**: Moved experimental pages to `pages/_experimental/` folder
**Result**: Experimental routes now return 404, production routes unaffected

### Verification
```bash
# Production routes (should return 200)
curl -I http://localhost:3000/
curl -I http://localhost:3000/pokedex
curl -I http://localhost:3000/tcgexpansions

# Experimental routes (should return 404)
curl -I http://localhost:3000/pokedex-unified
curl -I http://localhost:3000/index-unified
```

## Guidelines

1. **DO NOT** create new pages with -unified, -new, -v2 suffixes in `/pages`
2. **DO NOT** duplicate pages for experimentation in `/pages`
3. **USE** feature flags or environment variables for A/B testing
4. **USE** `_experimental` folder for experimental pages
5. **ALWAYS** check this document before creating new routes

## Route Naming Conventions

- Use kebab-case for multi-word routes (e.g., `/tcg-expansions`)
- Keep routes short and descriptive
- Match the route name to the page component name when possible
- Avoid versioning in route names

## SEO Considerations

Having duplicate pages accessible was causing:
- Duplicate content penalties
- Confused search indexing
- Split page authority

This has been resolved by the emergency fix.

## Next Steps

1. Review experimental pages for useful features
2. Migrate valuable features to production pages
3. Delete or archive experimental pages after review
4. Implement proper feature flagging system

---

**This document is the single source of truth for production routes.**