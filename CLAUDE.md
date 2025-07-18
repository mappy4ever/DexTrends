# CLAUDE.md - DexTrends Project Context

## Project Overview
DexTrends is a Pokemon TCG and Pokedex application with advanced features for tracking cards, prices, and Pokemon data.

## Technical Stack
- **Framework**: Next.js 15.3.5 with TypeScript (100% coverage)
- **State Management**: UnifiedAppContext (React Context)
- **Caching**: UnifiedCacheManager (3-tier: Memory → LocalStorage → Supabase)
- **Bundle Size**: 722 KB (First Load JS)
- **CSS**: 52.6 KB

## Key Commands
```bash
# Development
npm run dev          # Start development server (port 3001)
npm run build        # Production build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks

# Testing
npm test             # Run tests
npm run test:iphone  # iPhone-specific tests
```

## Current Project Status (July 18, 2025)

### ✅ TypeScript Migration: 100% Complete!
- All production code converted to TypeScript
- Zero JavaScript files remaining in production directories
- Bundle size maintained under target
- Full type safety across the codebase

### ✅ Recent Fixes (Session 29)
1. **Pokemon Form/Variant Selection** - Working correctly
2. **Modal/Zoom Functionality** - Fixed and operational
3. **Collections/Favorites CRUD** - Verified working
4. **Pocket Mode Card Clicks** - Navigation fixed
5. **Design Language** - Fully implemented

### 🚧 Known Issues & Bugs
See `/project-resources/docs/POST_MIGRATION_FIXES.md` for comprehensive list

## Core QA Testing Conditions
**IMPORTANT**: All QA testing must follow these conditions:

1. **Physical Testing Required**
   - Actually visit and interact with every page in the browser
   - Do not assume anything works without verification
   - Test all interactive elements (buttons, forms, modals, etc.)

2. **Comprehensive Bug Tracking**
   - Log ALL bugs found, regardless of cause (new, migration-related, or pre-existing)
   - Include clear reproduction steps
   - Assign priority levels (P0/P1/P2)
   - Separate "Active Functionality Bugs" from migration issues

3. **Feature Comparison**
   - Compare TypeScript version with original JavaScript version
   - Note any missing features or behavioral differences
   - Document visual/UX differences

4. **Documentation Requirements**
   - Update `/project-resources/docs/POST_MIGRATION_FIXES.md`
   - Group issues by page/feature for clarity
   - Include expected vs actual behavior

## Project Structure
```
/components     - React components (100% TypeScript)
/context       - React Context providers
/pages         - Next.js pages (100% TypeScript)
/public        - Static assets
/styles        - CSS/styling
/utils         - Utility functions (100% TypeScript)
/types         - TypeScript type definitions
/project-resources - Documentation and non-code files
```

## Important Development Notes

### TypeScript Best Practices
- Always check for nullable properties before use
- Use `override` modifier for class methods extending base classes
- Handle Next.js query params: `Array.isArray(param) ? param[0] : String(param)`
- Add type guards before accessing nested properties

### Common Patterns
```typescript
// Pokemon name sanitization for API calls
const sanitizePokemonName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[':.\s]/g, '-')
    .replace(/--+/g, '-')
    .replace(/-$/, '');
};

// Navigation pattern
import { useRouter } from 'next/router';
const router = useRouter();
router.push('/path'); // NOT window.location.href

// Error handling pattern
try {
  const data = await fetchData(url);
  return data || [];
} catch (error) {
  console.error('Error:', error);
  return []; // Return empty array, don't throw
}
```

### Build & Module Notes
- Do NOT add `"type": "module"` to package.json - breaks Next.js
- Always run lint and typecheck before committing
- Avoid module-level SDK configurations
- Use dynamic imports for heavy components

## Next Priority Tasks

### Immediate (P0)
1. Fix all Critical Issues in POST_MIGRATION_FIXES.md
2. Add comprehensive test coverage
3. Performance optimization (target < 700KB bundle)

### Short-term (P1)
1. Implement missing features from bug reports
2. Add proper error boundaries throughout
3. Improve loading and error states
4. Complete mobile gesture handling

### Long-term (P2)
1. Enable TypeScript strict mode
2. Implement advanced caching strategies
3. Add E2E testing with Playwright
4. Performance monitoring and analytics
5. Progressive Web App features

## Quick Test URLs
```
http://localhost:3001/pokedex/83        # Farfetch'd (special character)
http://localhost:3001/pokedex/386       # Deoxys (forms)
http://localhost:3001/battle-simulator  # Complex interactions
http://localhost:3001/pocketmode        # Pocket TCG features
http://localhost:3001/collections       # CRUD operations
```

## Git Workflow
```bash
# Current branch
git checkout optimization-branch-progress

# Before making changes
git pull origin optimization-branch-progress

# After changes
git add -A
git commit -m "fix: [description]"
git push origin optimization-branch-progress

# Create PR to main when ready
```

## Performance Targets
- First Load JS: < 700KB (currently 722KB)
- CSS Bundle: < 50KB (currently 52.6KB)
- Build Time: < 5 minutes
- Lighthouse Score: > 90

## Contact & Support
- Report issues: https://github.com/anthropics/claude-code/issues
- Main branch: `main`
- Working branch: `optimization-branch-progress`