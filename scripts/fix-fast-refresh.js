const fs = require('fs');
const path = require('path');

// Load the violation report
const reportPath = path.join(process.cwd(), 'fast-refresh-report.json');
const violations = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

class FastRefreshFixer {
  constructor() {
    this.fixedCount = 0;
    this.failedCount = 0;
    this.backupDir = path.join(process.cwd(), '.fast-refresh-backup');
  }

  createBackup(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(this.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copy file to backup
    fs.copyFileSync(filePath, backupPath);
  }

  fixAnonymousExports(filePath, content) {
    console.log(`  Fixing anonymous exports in ${filePath}`);
    
    // Pattern 1: const FixFastRefreshComponent = () => {
export default FixFastRefreshComponent;

    const arrowPattern = /export\s+default\s+\(\s*\)\s*=>\s*{/;
    if (arrowPattern.test(content)) {
      const componentName = this.generateComponentName(filePath);
      content = content.replace(
        arrowPattern,
        `const ${componentName} = () => {\nexport default ${componentName};\n`
      );
      console.log(`    ✅ Fixed arrow function export with name: ${componentName}`);
      return { fixed: true, content };
    }
    
    // Pattern 2: function FixFastRefreshComponent() {
    const funcPattern = /export\s+default\s+function\s*\(/;
    if (funcPattern.test(content)) {
      const componentName = this.generateComponentName(filePath);
      content = content.replace(
        funcPattern,
        `function ${componentName}(`
      );
      content += `\n\nexport default ${componentName};`;
      console.log(`    ✅ Fixed anonymous function export with name: ${componentName}`);
      return { fixed: true, content };
    }
    
    return { fixed: false, content };
  }

  fixUnnecessaryReactImports(filePath, content) {
    const ext = path.extname(filePath);
    if (ext === '.ts' && content.includes('import React')) {
      console.log(`  Removing unnecessary React import from ${filePath}`);
      
      // Remove React imports from pure TypeScript files
      content = content.replace(/import\s+React.*from\s+['"]react['"];?\s*\n?/g, '');
      content = content.replace(/import\s+\*\s+as\s+React.*from\s+['"]react['"];?\s*\n?/g, '');
      
      console.log(`    ✅ Removed React import from .ts file`);
      return { fixed: true, content };
    }
    
    return { fixed: false, content };
  }

  fixNestedComponentsInApp(filePath, content) {
    if (filePath.endsWith('_app.tsx')) {
      console.log(`  Fixing nested component in _app.tsx`);
      
      // Check if appContent is defined inside MyApp
      if (content.includes('const appContent = (')) {
        // Extract the appContent JSX and move it outside
        const appContentMatch = content.match(/const appContent = \(([\s\S]*?)\);\s*\n\s*\/\/ Wrap non-error pages/);
        
        if (appContentMatch) {
          const jsxContent = appContentMatch[1];
          
          // Create a separate component
          const newComponent = `
// Extracted component to fix Fast Refresh
const AppContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    ${jsxContent.trim()}
  );
};
`;
          
          // Insert the new component before MyApp
          const myAppIndex = content.indexOf('function MyApp');
          content = content.slice(0, myAppIndex) + newComponent + '\n' + content.slice(myAppIndex);
          
          // Replace the appContent usage
          content = content.replace(
            /const appContent = \([\s\S]*?\);\s*\n\s*\/\/ Wrap non-error pages[\s\S]*?return <ErrorBoundary>{appContent}<\/ErrorBoundary>;/,
            `// Wrap non-error pages with ErrorBoundary
  return (
    <ErrorBoundary>
      <AppContent>
        <Component {...pageProps} />
      </AppContent>
    </ErrorBoundary>
  );`
          );
          
          console.log(`    ✅ Extracted nested component to AppContent`);
          return { fixed: true, content };
        }
      }
    }
    
    return { fixed: false, content };
  }

  generateComponentName(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    // Convert kebab-case or snake_case to PascalCase
    return fileName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Component';
  }

  processFile(fileViolation) {
    const { file, violations: fileViolations } = fileViolation;
    
    // Skip if file doesn't exist
    if (!fs.existsSync(file)) {
      console.log(`  ⚠️  File not found: ${file}`);
      return;
    }
    
    console.log(`\n${colors.blue}Processing: ${file}${colors.reset}`);
    
    // Create backup
    this.createBackup(file);
    
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    // Process each violation type
    fileViolations.forEach(violation => {
      let result = { fixed: false, content };
      
      switch (violation.type) {
        case 'Anonymous Export':
          result = this.fixAnonymousExports(file, content);
          break;
          
        case 'Unnecessary React Import':
          result = this.fixUnnecessaryReactImports(file, content);
          break;
          
        case 'Nested Component':
          if (file.endsWith('_app.tsx')) {
            result = this.fixNestedComponentsInApp(file, content);
          } else {
            console.log(`  ⚠️  Nested component requires manual fix`);
          }
          break;
          
        case 'Mixed Exports':
          console.log(`  ⚠️  Mixed exports require manual separation into different files`);
          break;
          
        case 'Conditional Hook':
          console.log(`  ⚠️  Conditional hooks require manual refactoring`);
          break;
      }
      
      if (result.fixed) {
        content = result.content;
        hasChanges = true;
      }
    });
    
    // Write changes if any
    if (hasChanges) {
      fs.writeFileSync(file, content);
      this.fixedCount++;
      console.log(`  ${colors.green}✅ File updated${colors.reset}`);
    } else {
      this.failedCount++;
    }
  }

  generateManualFixGuide() {
    const guidePath = path.join(process.cwd(), 'fast-refresh-manual-fixes.md');
    
    let guide = `# Fast Refresh Manual Fix Guide

Generated on: ${new Date().toISOString()}

## Summary
- Automatically fixed: ${this.fixedCount} files
- Require manual fixes: ${this.failedCount} files

## Manual Fixes Required

### 1. Mixed Exports
Files that export both React components and non-React utilities need to be split:

**Before:**
\`\`\`tsx
// BadFile.tsx
export const utility = () => { /* ... */ };
export default function Component() { /* ... */ }
\`\`\`

**After:**
\`\`\`tsx
// utils.ts
export const utility = () => { /* ... */ };

// Component.tsx
import { utility } from './utils';
export default function Component() { /* ... */ }
\`\`\`

### 2. Nested Components
Components defined inside other components break Fast Refresh:

**Before:**
\`\`\`tsx
function Parent() {
  const Child = () => <div>Child</div>;
  return <Child />;
}
\`\`\`

**After:**
\`\`\`tsx
const Child = () => <div>Child</div>;

function Parent() {
  return <Child />;
}
\`\`\`

### 3. Conditional Hooks
Hooks must be called unconditionally:

**Before:**
\`\`\`tsx
if (condition) {
  useEffect(() => {}, []);
}
\`\`\`

**After:**
\`\`\`tsx
useEffect(() => {
  if (condition) {
    // Effect logic here
  }
}, []);
\`\`\`

## Files Requiring Manual Attention

`;

    // Group violations by type
    const manualFixes = {
      'Mixed Exports': [],
      'Nested Component': [],
      'Conditional Hook': []
    };

    violations.forEach(({ file, violations: fileViolations }) => {
      fileViolations.forEach(v => {
        if (['Mixed Exports', 'Nested Component', 'Conditional Hook'].includes(v.type)) {
          if (!manualFixes[v.type].includes(file)) {
            manualFixes[v.type].push(file);
          }
        }
      });
    });

    Object.entries(manualFixes).forEach(([type, files]) => {
      if (files.length > 0) {
        guide += `\n### ${type} (${files.length} files)\n`;
        files.forEach(file => {
          const relativePath = path.relative(process.cwd(), file);
          guide += `- ${relativePath}\n`;
        });
      }
    });

    fs.writeFileSync(guidePath, guide);
    console.log(`\n📝 Manual fix guide saved to: ${colors.green}${guidePath}${colors.reset}`);
  }

  run() {
    console.log(colors.blue + '🔧 Starting Fast Refresh auto-fix...\n' + colors.reset);
    
    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
    
    // Process only safe automatic fixes
    const safeToAutoFix = violations.filter(({ violations: v }) => 
      v.some(violation => 
        violation.type === 'Anonymous Export' || 
        violation.type === 'Unnecessary React Import' ||
        (violation.type === 'Nested Component' && violation.severity === 'critical')
      )
    );
    
    console.log(`Found ${safeToAutoFix.length} files with auto-fixable violations\n`);
    
    safeToAutoFix.forEach(fileViolation => {
      this.processFile(fileViolation);
    });
    
    // Generate manual fix guide
    this.generateManualFixGuide();
    
    // Summary
    console.log('\n' + colors.blue + '═══════════════════════════════════════════' + colors.reset);
    console.log('Auto-fix Summary:');
    console.log(`  Fixed: ${colors.green}${this.fixedCount}${colors.reset} files`);
    console.log(`  Manual fixes needed: ${colors.yellow}${violations.length - this.fixedCount}${colors.reset} files`);
    console.log(`  Backup created at: ${colors.blue}${this.backupDir}${colors.reset}`);
    console.log('\n✨ Done! Check the manual fix guide for remaining issues.');
  }
}

// Run the fixer
const fixer = new FastRefreshFixer();
fixer.run();

export default FixFastRefreshComponent;