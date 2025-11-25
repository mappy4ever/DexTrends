# Claude AI Instructions

## Quick Start

Read these files first:
1. `CLAUDE.md` - Developer context
2. `CURRENT_WORK.md` - Active work

## Essential Commands

```bash
npm run dev          # Start dev server
npx tsc --noEmit     # TypeScript check (must pass)
npm run build        # Production build
npm test             # E2E tests
```

## Project Structure

```
/components/ui       # Reusable components (Button, Modal, Container)
/pages               # Next.js pages and API routes
/utils               # Utilities (logger, cn, fetchJSON)
/docs/guides         # Developer guides
```

## Component Usage

| Need | Use |
|------|-----|
| Button | `components/ui/Button.tsx` |
| Modal | `components/ui/Modal.tsx` |
| Container/Card | `components/ui/Container.tsx` |
| Skeleton | `components/ui/Skeleton.tsx` |

## Rules

- Use existing components from `/components/ui/`
- Use responsive Tailwind classes
- Use `logger` instead of `console.log`
- Maintain 0 TypeScript errors
- Don't create duplicate components
