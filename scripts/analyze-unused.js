#!/usr/bin/env node

/**
 * DexTrends Unused Code Analysis Script
 * Uses TypeScript compiler API and ESLint for more accurate analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(process.cwd(), 'unused-analysis');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('=========================================');
console.log('DexTrends Unused Code Analysis');
console.log('=========================================');
console.log('');

// Step 1: Run TypeScript compiler with noUnusedLocals and noUnusedParameters
console.log('Step 1: Running TypeScript compiler analysis...');
console.log('');

try {
  // Create a temporary tsconfig for analysis
  const analysisTsConfig = {
    extends: './tsconfig.json',
    compilerOptions: {
      noUnusedLocals: true,
      noUnusedParameters: true,
      noEmit: true,
      skipLibCheck: true
    },
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'build',
      'coverage',
      'scripts',
      'tests',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx'
    ]
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'tsconfig.analysis.json'),
    JSON.stringify(analysisTsConfig, null, 2)
  );

  // Run TypeScript compiler and capture output
  let tsOutput = '';
  try {
    execSync('npx tsc --project tsconfig.analysis.json', { encoding: 'utf8' });
    console.log('No unused code found by TypeScript compiler!');
  } catch (error) {
    tsOutput = error.stdout || error.output?.toString() || '';
  }

  // Parse TypeScript compiler output
  const tsWarnings = tsOutput.split('\n').filter(line => line.includes('is declared but'));
  
  // Categorize TypeScript warnings
  const unusedImports = [];
  const unusedVariables = [];
  const unusedParameters = [];
  
  tsWarnings.forEach(warning => {
    if (warning.includes('is declared but its value is never read')) {
      // Extract file path and variable name
      const match = warning.match(/(.+?)\((\d+),(\d+)\): error TS\d+: '(.+?)' is declared but/);
      if (match) {
        const [, file, line, col, name] = match;
        if (warning.includes('import')) {
          unusedImports.push({ file, line, col, name });
        } else {
          unusedVariables.push({ file, line, col, name });
        }
      }
    } else if (warning.includes('is declared but never used')) {
      const match = warning.match(/(.+?)\((\d+),(\d+)\): error TS\d+: '(.+?)' is declared but never used/);
      if (match) {
        const [, file, line, col, name] = match;
        unusedParameters.push({ file, line, col, name });
      }
    }
  });

  // Write categorized results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'typescript-analysis.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      unusedImports,
      unusedVariables,
      unusedParameters,
      totalWarnings: tsWarnings.length
    }, null, 2)
  );

  console.log(`Found ${tsWarnings.length} TypeScript warnings`);
  console.log(`  - Unused imports: ${unusedImports.length}`);
  console.log(`  - Unused variables: ${unusedVariables.length}`);
  console.log(`  - Unused parameters: ${unusedParameters.length}`);
  console.log('');

  // Clean up temporary tsconfig
  fs.unlinkSync(path.join(process.cwd(), 'tsconfig.analysis.json'));

} catch (error) {
  console.error('Error running TypeScript analysis:', error.message);
}

// Step 2: Run ESLint with unused rules
console.log('Step 2: Running ESLint analysis...');
console.log('');

try {
  // Create temporary .eslintrc for analysis
  const eslintConfig = {
    extends: ['./.eslintrc.json'],
    rules: {
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true 
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }]
    }
  };

  fs.writeFileSync(
    path.join(process.cwd(), '.eslintrc.analysis.json'),
    JSON.stringify(eslintConfig, null, 2)
  );

  // Run ESLint and capture output
  let eslintOutput = '';
  try {
    eslintOutput = execSync(
      'npx eslint . --ext .ts,.tsx --config .eslintrc.analysis.json --format json --no-eslintrc',
      { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }
    );
  } catch (error) {
    eslintOutput = error.stdout || error.output?.toString() || '[]';
  }

  const eslintResults = JSON.parse(eslintOutput || '[]');
  const unusedWarnings = [];

  eslintResults.forEach(file => {
    if (file.messages) {
      file.messages.forEach(message => {
        if (message.ruleId && message.ruleId.includes('unused')) {
          unusedWarnings.push({
            file: file.filePath,
            line: message.line,
            column: message.column,
            message: message.message,
            ruleId: message.ruleId
          });
        }
      });
    }
  });

  // Write ESLint results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'eslint-analysis.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      warnings: unusedWarnings,
      totalWarnings: unusedWarnings.length
    }, null, 2)
  );

  console.log(`Found ${unusedWarnings.length} ESLint warnings`);
  console.log('');

  // Clean up temporary eslintrc
  fs.unlinkSync(path.join(process.cwd(), '.eslintrc.analysis.json'));

} catch (error) {
  console.error('Error running ESLint analysis:', error.message);
}

// Step 3: Custom pattern analysis for specific cases
console.log('Step 3: Running custom pattern analysis...');
console.log('');

const customPatterns = {
  unimplementedFeatures: [],
  duplicateImports: [],
  commentedCode: [],
  todoComments: [],
  debugCode: []
};

// Find all TypeScript/TSX files
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
};

const allFiles = getAllFiles(process.cwd());

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Find TODO comments
    if (line.includes('TODO:') || line.includes('FIXME:') || line.includes('XXX:')) {
      customPatterns.todoComments.push({
        file,
        line: index + 1,
        content: line.trim()
      });
    }
    
    // Find commented code (simple heuristic)
    if (line.trim().startsWith('//') && 
        (line.includes('import ') || line.includes('const ') || line.includes('function '))) {
      customPatterns.commentedCode.push({
        file,
        line: index + 1,
        content: line.trim()
      });
    }
    
    // Find debug code
    if (line.includes('console.') || line.includes('debugger')) {
      customPatterns.debugCode.push({
        file,
        line: index + 1,
        content: line.trim()
      });
    }
  });
  
  // Find duplicate imports
  const imports = content.match(/^import .+ from .+$/gm) || [];
  const importMap = new Map();
  
  imports.forEach(imp => {
    const fromMatch = imp.match(/from ['"](.+)['"]/);
    if (fromMatch) {
      const from = fromMatch[1];
      if (importMap.has(from)) {
        customPatterns.duplicateImports.push({
          file,
          duplicate: imp,
          original: importMap.get(from)
        });
      } else {
        importMap.set(from, imp);
      }
    }
  });
});

// Write custom pattern results
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'custom-patterns.json'),
  JSON.stringify(customPatterns, null, 2)
);

console.log(`Custom patterns found:`);
console.log(`  - TODO comments: ${customPatterns.todoComments.length}`);
console.log(`  - Commented code: ${customPatterns.commentedCode.length}`);
console.log(`  - Debug code: ${customPatterns.debugCode.length}`);
console.log(`  - Duplicate imports: ${customPatterns.duplicateImports.length}`);
console.log('');

// Step 4: Generate summary report
console.log('Step 4: Generating summary report...');
console.log('');

const summary = {
  timestamp: new Date().toISOString(),
  totalFiles: allFiles.length,
  categories: {
    todoComments: customPatterns.todoComments.length,
    commentedCode: customPatterns.commentedCode.length,
    debugCode: customPatterns.debugCode.length,
    duplicateImports: customPatterns.duplicateImports.length
  },
  recommendations: []
};

// Add recommendations based on findings
if (customPatterns.debugCode.length > 0) {
  summary.recommendations.push('Remove debug code (console.log, debugger statements)');
}

if (customPatterns.commentedCode.length > 10) {
  summary.recommendations.push('Clean up commented code - either remove or document why it\'s kept');
}

if (customPatterns.todoComments.length > 20) {
  summary.recommendations.push('Review and prioritize TODO comments');
}

if (customPatterns.duplicateImports.length > 0) {
  summary.recommendations.push('Remove duplicate import statements');
}

// Write summary
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'summary.json'),
  JSON.stringify(summary, null, 2)
);

// Create markdown report
const markdownReport = `# Unused Code Analysis Report

Generated: ${new Date().toISOString()}

## Summary
- Total files analyzed: ${allFiles.length}
- TODO comments: ${customPatterns.todoComments.length}
- Commented code: ${customPatterns.commentedCode.length}
- Debug code: ${customPatterns.debugCode.length}
- Duplicate imports: ${customPatterns.duplicateImports.length}

## Recommendations
${summary.recommendations.map(r => `- ${r}`).join('\n')}

## Next Steps
1. Review the detailed JSON files in the \`unused-analysis\` directory
2. Start with safe cleanups (duplicate imports, debug code)
3. Document unimplemented features found in TODO comments
4. Create action items for addressing each category

## Files Generated
- \`typescript-analysis.json\` - TypeScript compiler warnings
- \`eslint-analysis.json\` - ESLint unused variable warnings
- \`custom-patterns.json\` - Custom pattern matches
- \`summary.json\` - Analysis summary
`;

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'REPORT.md'),
  markdownReport
);

console.log('=========================================');
console.log('Analysis Complete!');
console.log('=========================================');
console.log('');
console.log(`Results saved to: ${OUTPUT_DIR}/`);
console.log('');
console.log('Key files:');
console.log(`  - ${OUTPUT_DIR}/REPORT.md (Human-readable report)`);
console.log(`  - ${OUTPUT_DIR}/summary.json (Summary data)`);
console.log(`  - ${OUTPUT_DIR}/custom-patterns.json (Pattern matches)`);
console.log('');
console.log('Next steps:');
console.log('1. Review REPORT.md for overview');
console.log('2. Check custom-patterns.json for specific issues');
console.log('3. Start with safe cleanups (duplicate imports, debug code)');
console.log('4. Document unimplemented features from TODO comments');