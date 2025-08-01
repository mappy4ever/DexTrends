const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Violation types
const ViolationType = {
  ANONYMOUS_EXPORT: 'Anonymous Export',
  MIXED_EXPORTS: 'Mixed Exports',
  NESTED_COMPONENT: 'Nested Component',
  UNNECESSARY_REACT: 'Unnecessary React Import',
  CONDITIONAL_HOOK: 'Conditional Hook'
};

// Files to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'coverage',
  'dist',
  'build',
  '.turbo',
  'fast-refresh-test'
];

class FastRefreshScanner {
  constructor() {
    this.violations = [];
    this.fileCount = 0;
    this.criticalFiles = ['_app.tsx', '_document.tsx', 'Layout.tsx', 'layout.tsx'];
  }

  shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
  }

  isReactFile(content) {
    return content.includes('import React') || 
           content.includes('from \'react\'') || 
           content.includes('from "react"');
  }

  scanFile(filePath) {
    if (this.shouldIgnore(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);
    
    this.fileCount++;

    // Skip non-JS/TS files
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) return;

    const violations = [];

    // Check for anonymous default exports
    const anonymousPatterns = [
      /export\s+default\s+\(\s*\)\s*=>/,
      /export\s+default\s+function\s*\(/,
      /export\s+default\s+async\s+function\s*\(/,
      /export\s+default\s+\(\s*\w+\s*\)\s*=>/
    ];

    anonymousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        violations.push({
          type: ViolationType.ANONYMOUS_EXPORT,
          severity: this.getSeverity(filePath),
          line: this.getLineNumber(content, pattern)
        });
      }
    });

    // Check for mixed exports in React files
    if (this.isReactFile(content) && ext === '.tsx' || ext === '.jsx') {
      const hasDefaultExport = /export\s+default\s+/.test(content);
      const hasNamedExports = /export\s+(?:const|let|var|function|class)\s+(?!default)/.test(content);
      
      if (hasDefaultExport && hasNamedExports) {
        // Check if named exports are non-React (utilities, constants, types)
        const namedExportMatches = content.match(/export\s+(?:const|let|var|function)\s+(\w+)/g) || [];
        const nonReactExports = namedExportMatches.filter(match => {
          return !match.includes('Component') && 
                 !match.includes('Context') && 
                 !match.includes('Provider');
        });

        if (nonReactExports.length > 0) {
          violations.push({
            type: ViolationType.MIXED_EXPORTS,
            severity: this.getSeverity(filePath),
            details: nonReactExports.join(', ')
          });
        }
      }
    }

    // Check for nested component definitions
    const nestedComponentPattern = /function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?(?:function|const)\s+\w+\s*=?\s*(?:\([^)]*\)|function)/;
    if (nestedComponentPattern.test(content)) {
      violations.push({
        type: ViolationType.NESTED_COMPONENT,
        severity: 'high'
      });
    }

    // Check for unnecessary React imports in .ts files
    if (ext === '.ts' && this.isReactFile(content)) {
      violations.push({
        type: ViolationType.UNNECESSARY_REACT,
        severity: 'low'
      });
    }

    // Check for conditional hooks
    const conditionalHookPattern = /if\s*\([^)]*\)\s*{[^}]*use[A-Z]/;
    if (conditionalHookPattern.test(content)) {
      violations.push({
        type: ViolationType.CONDITIONAL_HOOK,
        severity: 'critical'
      });
    }

    if (violations.length > 0) {
      this.violations.push({
        file: filePath,
        violations: violations
      });
    }
  }

  getSeverity(filePath) {
    const fileName = path.basename(filePath);
    
    if (this.criticalFiles.includes(fileName)) return 'critical';
    if (filePath.includes('/pages/')) return 'high';
    if (filePath.includes('/components/') && filePath.includes('Layout')) return 'high';
    if (filePath.includes('/components/')) return 'medium';
    return 'low';
  }

  getLineNumber(content, pattern) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return 0;
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !this.shouldIgnore(filePath)) {
        this.scanDirectory(filePath);
      } else if (stat.isFile()) {
        this.scanFile(filePath);
      }
    });
  }

  generateReport() {
    console.log('\n' + colors.blue + '═══════════════════════════════════════════');
    console.log('       Fast Refresh Violation Report');
    console.log('═══════════════════════════════════════════' + colors.reset);
    
    console.log(`\nTotal files scanned: ${colors.green}${this.fileCount}${colors.reset}`);
    console.log(`Violations found: ${colors.red}${this.violations.length}${colors.reset}\n`);

    // Group by severity
    const critical = this.violations.filter(v => 
      v.violations.some(vio => vio.severity === 'critical')
    );
    const high = this.violations.filter(v => 
      v.violations.some(vio => vio.severity === 'high') &&
      !v.violations.some(vio => vio.severity === 'critical')
    );
    const medium = this.violations.filter(v => 
      v.violations.some(vio => vio.severity === 'medium') &&
      !v.violations.some(vio => ['critical', 'high'].includes(vio.severity))
    );
    const low = this.violations.filter(v => 
      v.violations.every(vio => vio.severity === 'low')
    );

    // Print violations by severity
    if (critical.length > 0) {
      console.log(colors.red + '🚨 CRITICAL (Affects entire app):' + colors.reset);
      critical.forEach(this.printViolation.bind(this));
    }

    if (high.length > 0) {
      console.log(colors.red + '\n⚠️  HIGH PRIORITY (Affects pages/layouts):' + colors.reset);
      high.forEach(this.printViolation.bind(this));
    }

    if (medium.length > 0) {
      console.log(colors.yellow + '\n⚡ MEDIUM PRIORITY (Component files):' + colors.reset);
      medium.forEach(this.printViolation.bind(this));
    }

    if (low.length > 0) {
      console.log(colors.green + '\n📝 LOW PRIORITY (Utility files):' + colors.reset);
      low.forEach(this.printViolation.bind(this));
    }

    // Summary
    console.log('\n' + colors.blue + '═══════════════════════════════════════════' + colors.reset);
    console.log('Summary by violation type:');
    const typeCounts = {};
    this.violations.forEach(file => {
      file.violations.forEach(v => {
        typeCounts[v.type] = (typeCounts[v.type] || 0) + 1;
      });
    });

    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${colors.yellow}${count}${colors.reset}`);
    });

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'fast-refresh-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.violations, null, 2));
    console.log(`\nDetailed report saved to: ${colors.green}${reportPath}${colors.reset}`);
  }

  printViolation(fileViolation) {
    const relativePath = path.relative(process.cwd(), fileViolation.file);
    console.log(`\n  ${colors.blue}${relativePath}${colors.reset}`);
    
    fileViolation.violations.forEach(v => {
      let message = `    - ${v.type}`;
      if (v.line) message += ` (line ${v.line})`;
      if (v.details) message += ` - ${v.details}`;
      console.log(message);
    });
  }

  run() {
    console.log(colors.blue + '🔍 Scanning for Fast Refresh violations...\n' + colors.reset);
    
    const startTime = Date.now();
    this.scanDirectory(process.cwd());
    const endTime = Date.now();
    
    this.generateReport();
    console.log(`\nScan completed in ${endTime - startTime}ms`);
  }
}

// Run the scanner
const scanner = new FastRefreshScanner();
scanner.run();