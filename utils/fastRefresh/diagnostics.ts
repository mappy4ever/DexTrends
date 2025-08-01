export interface DiagnosticIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  solution?: string;
  codeExample?: string;
}

export class FastRefreshDiagnostics {
  static analyzeComponent(componentCode: string): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    // Check for anonymous default export
    if (/export\s+default\s+\(\s*\)\s*=>/m.test(componentCode) ||
        /export\s+default\s+function\s*\(/m.test(componentCode)) {
      issues.push({
        type: 'error',
        category: 'Anonymous Export',
        message: 'Component is exported as anonymous function',
        solution: 'Use named function or add displayName',
        codeExample: 'const MyComponent = () => { ... };\nexport default MyComponent;'
      });
    }

    // Check for mixed exports
    const hasReactImport = /import\s+.*React.*from\s+['"]react['"]/m.test(componentCode);
    const hasNonReactExport = /export\s+(const|let|var|function)\s+(?!default)/m.test(componentCode);
    if (hasReactImport && hasNonReactExport) {
      issues.push({
        type: 'warning',
        category: 'Mixed Exports',
        message: 'File contains both React and non-React exports',
        solution: 'Move non-React exports to separate file',
      });
    }

    // Check for nested component definitions
    if (/const.*=.*\(\)\s*=>\s*{[\s\S]*const.*=.*\(\)\s*=>\s*{/m.test(componentCode)) {
      issues.push({
        type: 'error',
        category: 'Nested Components',
        message: 'Component defined inside another component',
        solution: 'Move nested component to module level',
      });
    }

    // Check for conditional hooks
    if (/if\s*\([^)]*\)\s*{[^}]*use[A-Z]/m.test(componentCode)) {
      issues.push({
        type: 'error',
        category: 'Conditional Hooks',
        message: 'Hook called conditionally',
        solution: 'Move hook to top level, use condition inside hook',
      });
    }

    return issues;
  }

  static checkEnvironment(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    // Check if HMR is available
    if (typeof window !== 'undefined' && !(module as any).hot) {
      issues.push({
        type: 'error',
        category: 'Environment',
        message: 'Hot Module Replacement not available',
        solution: 'Ensure development mode and webpack HMR enabled',
      });
    }

    // Check React version
    try {
      const React = require('react');
      const version = React.version;
      const major = parseInt(version.split('.')[0]);
      if (major < 16) {
        issues.push({
          type: 'error',
          category: 'React Version',
          message: `React ${version} doesn't support Fast Refresh`,
          solution: 'Upgrade to React 16.9.0 or higher',
        });
      }
    } catch (e) {
      issues.push({
        type: 'error',
        category: 'React',
        message: 'Could not detect React version',
      });
    }

    return issues;
  }

  static generateReport(componentCode?: string): {
    issues: DiagnosticIssue[];
    summary: string;
    canUseFastRefresh: boolean;
  } {
    const environmentIssues = this.checkEnvironment();
    const codeIssues = componentCode ? this.analyzeComponent(componentCode) : [];
    const allIssues = [...environmentIssues, ...codeIssues];

    const errorCount = allIssues.filter(i => i.type === 'error').length;
    const warningCount = allIssues.filter(i => i.type === 'warning').length;

    return {
      issues: allIssues,
      summary: `Found ${errorCount} errors and ${warningCount} warnings`,
      canUseFastRefresh: errorCount === 0
    };
  }
}