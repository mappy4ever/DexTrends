# CLAUDE.md - DexTrends AI Assistant Context

## Project Overview
DexTrends is a Pokemon TCG and Pokedex application built with Next.js 15.3.5 and TypeScript.

## CRITICAL: Prevent Duplicates
Before creating ANY new file or function:
1. **ALWAYS search first** - Use Grep/LS to check if functionality exists
2. **Reuse over recreate** - Extend existing code instead of creating new files
3. Common locations: `/utils/`, `/components/ui/`, `/hooks/`, `/types/`

## Key Commands
```bash
npm run dev       # Dev server (port 3001)
npm run build     # Production build  
npm run lint      # ESLint
npm run typecheck # TypeScript check
npm test          # Playwright tests
```

## Essential Patterns
- **API calls**: Use `fetchData` from `/utils/apiutils`
- **Navigation**: Use Next.js router, NOT window.location
- **Loading**: Use components from `/utils/unifiedLoading`
- **State**: React Context via UnifiedAppContext

## Testing
- Tests in `/tests/` directory
- Use `data-testid` attributes
- All external APIs are mocked

## Branch Info
- Current: `optimization-branch-progress`
- Main: `main` (for PRs)

## Documentation
For detailed information see:
- Developer Guide: `/project-resources/docs/DEVELOPER_GUIDE.md`
- Project Structure: `/project-resources/docs/PROJECT_STRUCTURE.md`
- Testing Guide: `/TESTING_PROTOCOL.md`