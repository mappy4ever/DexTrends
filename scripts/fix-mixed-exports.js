#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Script to automatically fix mixed exports by separating hooks into .hooks.ts files
 * This helps maintain Fast Refresh compatibility
 */

// Read the fast refresh report to get files with mixed exports
const reportPath = path.join(__dirname, '../fast-refresh-report.json');
let report;

try {
  report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch (error) {
  console.error('Error reading fast refresh report:', error);
  process.exit(1);
}

// Get files with mixed exports
const mixedExportFiles = [];
report.forEach(item => {
  const hasMixedExports = item.violations.some(v => v.type === 'Mixed Exports');
  if (hasMixedExports) {
    mixedExportFiles.push(item.file);
  }
});

console.log(`Found ${mixedExportFiles.length} files with mixed exports`);

// Patterns to identify hooks and utilities
const hookPattern = /^use[A-Z]/;
const hookExportPattern = /export\s+(?:const|function)\s+(use[A-Z]\w+)/g;
const typeExportPattern = /export\s+(?:type|interface)\s+(\w+)/g;

// Process each file
let processedCount = 0;
let errorCount = 0;

mixedExportFiles.forEach(filePath => {
  try {
    console.log(`\nProcessing: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has a corresponding .hooks.ts file
    const hooksFilePath = filePath.replace(/\.(tsx?)$/, '.hooks.$1');
    if (fs.existsSync(hooksFilePath)) {
      console.log(`  ⏭️  Skipping - hooks file already exists`);
      return;
    }
    
    // Find all hook exports
    const hookExports = [];
    const typeExports = [];
    let match;
    
    // Reset regex
    hookExportPattern.lastIndex = 0;
    while ((match = hookExportPattern.exec(content)) !== null) {
      hookExports.push(match[1]);
    }
    
    // Reset regex
    typeExportPattern.lastIndex = 0;
    while ((match = typeExportPattern.exec(content)) !== null) {
      typeExports.push(match[1]);
    }
    
    if (hookExports.length === 0) {
      console.log(`  ⏭️  No hooks found to extract`);
      return;
    }
    
    console.log(`  📦 Found ${hookExports.length} hooks to extract: ${hookExports.join(', ')}`);
    
    // Create hooks file content
    let hooksFileContent = `import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
`;
    
    // Extract import statements that hooks might need
    const importPattern = /^import\s+(?:type\s+)?(?:{[^}]+}|[^;]+)\s+from\s+['"][^'"]+['"];?\s*$/gm;
    const imports = content.match(importPattern) || [];
    
    // Filter imports to include only necessary ones
    const necessaryImports = imports.filter(imp => {
      // Skip React imports (we already have them)
      if (imp.includes("from 'react'") || imp.includes('from "react"')) return false;
      // Keep type imports
      if (imp.includes('import type')) return true;
      // Keep imports that might be used by hooks
      return true;
    });
    
    if (necessaryImports.length > 0) {
      hooksFileContent += necessaryImports.join('\n') + '\n\n';
    }
    
    // Extract each hook
    hookExports.forEach(hookName => {
      // Find the hook implementation
      const hookRegex = new RegExp(
        `export\\s+(?:const|function)\\s+${hookName}[^{]*{[\\s\\S]*?\\n}(?:\\s*;)?`,
        'g'
      );
      const hookMatch = content.match(hookRegex);
      
      if (hookMatch) {
        hooksFileContent += '\n' + hookMatch[0] + '\n';
      }
    });
    
    // Write hooks file
    fs.writeFileSync(hooksFilePath, hooksFileContent.trim() + '\n');
    console.log(`  ✅ Created ${path.basename(hooksFilePath)}`);
    
    // Update original file
    let updatedContent = content;
    
    // Remove hook exports from original file
    hookExports.forEach(hookName => {
      const hookRegex = new RegExp(
        `export\\s+(?:const|function)\\s+${hookName}[^{]*{[\\s\\S]*?\\n}(?:\\s*;)?\\n?`,
        'g'
      );
      updatedContent = updatedContent.replace(hookRegex, '');
    });
    
    // Add import for hooks at the top of the file (after React imports)
    const reactImportMatch = updatedContent.match(/import\s+React[^;]*;?\s*\n/);
    if (reactImportMatch) {
      const insertPos = reactImportMatch.index + reactImportMatch[0].length;
      const hooksImport = `import { ${hookExports.join(', ')} } from './${path.basename(filePath).replace(/\.(tsx?)$/, '.hooks')}';
`;
      updatedContent = 
        updatedContent.slice(0, insertPos) + 
        hooksImport + 
        updatedContent.slice(insertPos);
    }
    
    // Clean up any double blank lines
    updatedContent = updatedContent.replace(/\n\n\n+/g, '\n\n');
    
    // Write updated file
    fs.writeFileSync(filePath, updatedContent);
    console.log(`  ✅ Updated ${path.basename(filePath)}`);
    
    processedCount++;
    
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✨ Processed ${processedCount} files successfully`);
if (errorCount > 0) {
  console.log(`⚠️  Encountered errors in ${errorCount} files`);
}

console.log('\n🔍 Next steps:');
console.log('1. Review the changes made to ensure correctness');
console.log('2. Run "npm run typecheck" to verify TypeScript compilation');
console.log('3. Run the Fast Refresh health check again to verify improvements');