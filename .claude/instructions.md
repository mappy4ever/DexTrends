# Claude AI Assistant Instructions - AUTO-LOADED

## IMMEDIATE ACTION: Read Documentation
**STOP!** Before doing ANYTHING, read these files in order:
1. `/CLAUDE.md` - Master context (component crisis details)
2. `/CURRENT_WORK.md` - Active tasks and progress
3. `/COMPONENT_INVENTORY.md` - Component truth (names lie!)

## Critical Context
- **COMPONENT EXPLOSION**: ~300 components, 66% are duplicates
- **NAMING CONFUSION**: "Card" means 3 different things
- **MOBILE VIOLATION**: `/components/mobile/` shouldn't exist

## Session Workflow

### Starting Work
```bash
# First commands to run:
git status                    # Check branch and changes
cat CURRENT_WORK.md           # See what's in progress
grep -r "TODO" --include="*.tsx" --include="*.ts" | head -10  # Find TODOs
```

### Before Creating ANYTHING
```bash
# ALWAYS check for duplicates first:
grep -r "ComponentName" components/
ls -la components/ui/*Similar*
cat COMPONENT_INVENTORY.md | grep "ComponentType"
```

### Testing Requirements
```bash
# Run these before ANY commit:
npx tsc --noEmit              # TypeScript check (MUST be 0 errors)
npm run lint                  # Linting
npm test                      # E2E tests
```

## Documentation Updates

### When to Update Each File

| File | Update When | What to Add |
|------|------------|-------------|
| CURRENT_WORK.md | Every task completion | Progress, discoveries, blockers |
| COMPONENT_INVENTORY.md | Found duplicate/misleading component | Actual purpose, verdict |
| QUICK_START.md | Discovered new pitfall | Warning, correct approach |
| CLEANUP_PLAN.md | Completed consolidation | Metrics, next steps |
| CLAUDE.md | Major pattern change | New rules, violations |

### Session End Checklist
- [ ] Update CURRENT_WORK.md with progress
- [ ] Run `npx tsc --noEmit` (must be 0 errors)
- [ ] Update metrics if components added/removed
- [ ] Note any new duplicates found
- [ ] Commit with descriptive message

## Component Rules

### NEVER Do
- Create component without checking duplicates
- Use `any` type in TypeScript
- Create separate mobile/desktop components
- Add emojis to code
- Trust component names (they lie!)

### ALWAYS Do
- Check COMPONENT_INVENTORY.md first
- Use existing components from `/components/ui/`
- Test at 320px viewport width
- Use Tailwind responsive classes
- Run type check before commits

## Quick Reference

### Component Truth
- **Modal**: Use `/components/ui/Modal.tsx` (NOT ModalV2, V3, Enhanced, etc.)
- **Card Container**: Use `/components/ui/Card.tsx`
- **TCG Card**: Use `/components/tcg/TCGCard.tsx`
- **Skeleton**: Use `/components/ui/Skeleton.tsx` with shape prop

### Current Priorities
1. Component consolidation (300 → 80-100)
2. Delete `/components/mobile/` directory
3. Fix naming confusion
4. Remove all `isMobileView` patterns

---
*This file is auto-loaded by Claude. Last updated: 2025-09-01*