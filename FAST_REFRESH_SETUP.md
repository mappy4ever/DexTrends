# Fast Refresh Setup Guide

## Installation

To enable the Fast Refresh ESLint rules, install the required plugin:

```bash
npm install --save-dev eslint-plugin-react-refresh
```

## What Was Fixed

### 1. Critical Issue: _app.tsx
✅ **Fixed**: Nested component definition that was causing Fast Refresh failures across the entire app.

**Before:**
```tsx
function MyApp() {
  const appContent = (<>...</>);  // ❌ Nested component
  return <ErrorBoundary>{appContent}</ErrorBoundary>;
}
```

**After:**
```tsx
const AppContent = () => { ... };  // ✅ Module-level component

function MyApp() {
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}
```

### 2. ESLint Rules Added
The following rules will help prevent future Fast Refresh issues:

- **No anonymous exports**: Prevents `export default () => {}`
- **React-only exports**: Warns about mixing React components with utilities
- **No nested components**: Prevents defining components inside components
- **Proper hook usage**: Ensures hooks follow React rules

## Remaining Issues

### High Priority (Manual fixes required):
1. **79 files with mixed exports** - Need to separate React components from utilities
2. **16 files with conditional hooks** - Need to refactor hook usage
3. **61 files with nested components** - Need to extract to module level

See `fast-refresh-manual-fixes.md` for the complete list.

## Verification

After fixing issues, verify Fast Refresh is working:

1. Start dev server: `npm run dev`
2. Edit a component file
3. Check console - should NOT see "Fast Refresh had to perform a full reload"
4. Component should update without losing state

## Next Steps

1. Install the ESLint plugin
2. Run `npm run lint` to see all violations
3. Fix high-priority files first (pages, layouts, providers)
4. Use the scanner periodically: `node scripts/scan-fast-refresh.js`