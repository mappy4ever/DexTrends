# Extended Decision Report

Change map lines 278
Deleted files 76
Renamed summary lines 118

Localhost SSR hits 103
Red flag comments 922
Archive mentions 1050

Docs promise entries 685
Code feature hits 6155
Docs promised but not found in code (sample up to 20)
- # DexTrends AI Assistant Context - MASTER DOCUMENT
- This is the SINGLE SOURCE OF TRUTH for the DexTrends project.
- DexTrends is a Pokemon TCG and Pokedex application.
- | Loading | `Skeleton.tsx` | SkeletonSystem, LoadingStates, DexTrendsLoading |
- *Purpose: Single source of truth for DexTrends development*
- - **Deck Builder**: Build and manage TCG decks
- - **Pokemon TCG Pocket**: Dedicated mode for mobile TCG
- - **Deck Builder**: Build decks for Pocket format
- # DexTrends Mobile-First Rebuild Tracking Document
- - [x] PullToRefresh - Pull to refresh with Pokeball animation
- - [x] Pull-to-refresh integration
- - [ ] Vertical layouts for showcases
- # 🚀 DexTrends Advanced Features Guide
- DexTrends has been enhanced with sophisticated features that transform it from a simple Pokemon card browser into a comprehensive collection management and market analysis platform. This guide covers all the advanced features implemented.
- ### 1. Real-Time Price History System
- - **Multi-Parameter Filtering**: Name, set, type, rarity, price range, HP, artist, year
- - ✅ Rarity filtering with comprehensive rarity list
- ### 3. Market Analytics Dashboard
- - **Multiple Collections**: Create and manage separate collections
- - 📚 Unlimited collections per user

Unreferenced components summary
No unreferenced list created

Broken relative imports summary
No broken import list created

Route health summary
# Route health

- placeholder = contains coming soon, placeholder, stub, todo
- staticOnly = grid without data fetching

- pages/404.tsx  placeholder=false  staticOnly=false
- pages/500.tsx  placeholder=false  staticOnly=false
- pages/_app.tsx  placeholder=false  staticOnly=false
- pages/_document.tsx  placeholder=false  staticOnly=false
- pages/_error.tsx  placeholder=false  staticOnly=false
- pages/_experimental/index-unified.tsx  placeholder=false  staticOnly=true
- pages/_experimental/pokedex-new.tsx  placeholder=true  staticOnly=false
- pages/_experimental/pokedex-unified.tsx  placeholder=true  staticOnly=false
- pages/_experimental/tcgsets-unified.tsx  placeholder=true  staticOnly=false
- pages/_experimental/type-effectiveness-unified.tsx  placeholder=false  staticOnly=false
- pages/analytics.tsx  placeholder=false  staticOnly=true
- pages/api/admin/cache-stats.ts  placeholder=false  staticOnly=false
- pages/api/admin/cache-status.ts  placeholder=false  staticOnly=false
- pages/api/admin/redis-reset.ts  placeholder=false  staticOnly=false
- pages/api/admin/startup-warming.ts  placeholder=false  staticOnly=false
- pages/api/admin/warm-cache.ts  placeholder=false  staticOnly=false
- pages/api/admin/warm-sets-list-simple.ts  placeholder=false  staticOnly=false
- pages/api/admin/warm-sets-list.ts  placeholder=false  staticOnly=false
- pages/api/advanced-search.ts  placeholder=false  staticOnly=false
- pages/api/analytics.ts  placeholder=false  staticOnly=false
- pages/api/b

Env usage keys seen 174

Recommendation
1, If localhost hits > 0, schedule a small SSR base URL fix first.
2, If docs promise features that code lacks, plan targeted restores for those features.
3, Address broken imports and unreferenced components to reduce dead weight.
4, For routes marked placeholder or staticOnly, confirm intended behavior and restore data flows.
