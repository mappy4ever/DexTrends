export const FAST_REFRESH_PATTERNS = {
  ANONYMOUS_EXPORT: /export\s+default\s+\(\s*\)\s*=>/,
  MIXED_EXPORTS: /export\s+(const|let|var|function)\s+(?!default)/,
  NESTED_COMPONENT: /const.*=.*\(\)\s*=>\s*{[\s\S]*const.*=.*\(\)\s*=>\s*{/,
  CONDITIONAL_HOOK: /if\s*\([^)]*\)\s*{[^}]*use[A-Z]/,
  HOOK_IN_LOOP: /for\s*\([^)]*\)\s*{[^}]*use[A-Z]/,
};

export const FAST_REFRESH_MESSAGES = {
  FULL_RELOAD: '⚠ Fast Refresh had to perform a full reload',
  HOOK_ERROR: 'Rendered fewer hooks than expected',
  BOUNDARY_ERROR: 'Error caught by error boundary',
  MODULE_ERROR: 'Failed to accept module update',
};

export const COMPONENT_PATTERNS = {
  VALID_NAMES: /^[A-Z][a-zA-Z0-9]*$/,
  REACT_COMPONENT: /(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g,
  JSX_RETURN: /return\s*\(/,
};

export const TEST_SCENARIOS = [
  {
    id: 'anonymous',
    name: 'Anonymous Exports',
    description: 'Tests how anonymous default exports affect Fast Refresh',
    severity: 'error',
  },
  {
    id: 'mixed',
    name: 'Mixed Exports',
    description: 'Tests files with both React and non-React exports',
    severity: 'warning',
  },
  {
    id: 'nested',
    name: 'Nested Components',
    description: 'Tests components defined inside other components',
    severity: 'error',
  },
  {
    id: 'hooks',
    name: 'Conditional Hooks',
    description: 'Tests violations of the Rules of Hooks',
    severity: 'error',
  },
  {
    id: 'dynamic',
    name: 'Dynamic Imports',
    description: 'Tests lazy loading and code splitting effects',
    severity: 'info',
  },
  {
    id: 'state',
    name: 'State Preservation',
    description: 'Tests which state types persist through Fast Refresh',
    severity: 'info',
  },
];

export const REFRESH_INDICATORS = {
  FAST_REFRESH: {
    icon: '⚡',
    color: '#0f0',
    label: 'Fast Refresh',
  },
  FULL_RELOAD: {
    icon: '🔄',
    color: '#f00',
    label: 'Full Reload',
  },
  NO_UPDATE: {
    icon: '⏸️',
    color: '#888',
    label: 'No Update',
  },
};

export const HMR_STATUS = {
  idle: 'Waiting for changes',
  check: 'Checking for updates',
  prepare: 'Preparing update',
  ready: 'Update ready',
  dispose: 'Disposing old modules',
  apply: 'Applying update',
  abort: 'Update aborted',
  fail: 'Update failed',
};