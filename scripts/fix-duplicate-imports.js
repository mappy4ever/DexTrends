#!/usr/bin/env node

/**
 * Fix duplicate imports in TypeScript/TSX files
 * Safe cleanup script that removes duplicate import statements
 */

const fs = require('fs');
const path = require('path');

// Read the duplicate imports from our analysis
const customPatterns = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../unused-analysis/custom-patterns.json'), 'utf8')
);

const duplicateImports = customPatterns.duplicateImports || [];

console.log('=========================================');
console.log('Fixing Duplicate Imports');
console.log('=========================================');
console.log('');
console.log(`Found ${duplicateImports.length} duplicate imports to fix`);
console.log('');

let fixedCount = 0;
let skippedCount = 0;
const errors = [];

// Group duplicates by file
const fileGroups = {};
duplicateImports.forEach(dup => {
  if (!fileGroups[dup.file]) {
    fileGroups[dup.file] = [];
  }
  fileGroups[dup.file].push(dup);
});

// Process each file
Object.entries(fileGroups).forEach(([filePath, duplicates]) => {
  try {
    console.log(`Processing: ${path.basename(filePath)}`);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Process each duplicate in this file
    duplicates.forEach(dup => {
      // Check if both imports still exist
      if (content.includes(dup.duplicate) && content.includes(dup.original)) {
        // Extract what's being imported from each line
        const duplicateMatch = dup.duplicate.match(/import (.+) from/);
        const originalMatch = dup.original.match(/import (.+) from/);
        
        if (duplicateMatch && originalMatch) {
          const dupImports = duplicateMatch[1];
          const origImports = originalMatch[1];
          
          // If they're importing different things from the same module, merge them
          if (dupImports !== origImports) {
            // Parse the imports
            const fromModule = dup.duplicate.match(/from ['"](.+)['"]/)?.[1];
            
            if (fromModule) {
              // Combine the imports
              const combined = combineImports(origImports, dupImports, fromModule);
              
              // Replace the original with combined and remove duplicate
              content = content.replace(dup.original, combined);
              content = content.replace(dup.duplicate + '\n', '');
              content = content.replace(dup.duplicate, ''); // In case no newline
              
              console.log(`  ✓ Merged imports from '${fromModule}'`);
              fixedCount++;
            }
          } else {
            // Same imports, just remove the duplicate
            content = content.replace(dup.duplicate + '\n', '');
            content = content.replace(dup.duplicate, ''); // In case no newline
            console.log(`  ✓ Removed duplicate import from '${dup.duplicate.match(/from ['"](.+)['"]/)?.[1]}'`);
            fixedCount++;
          }
        }
      } else {
        console.log(`  ⚠ Skipped - import pattern not found or already fixed`);
        skippedCount++;
      }
    });
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ File updated`);
    } else {
      console.log(`  ℹ No changes needed`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing file: ${error.message}`);
    errors.push({ file: filePath, error: error.message });
  }
  
  console.log('');
});

/**
 * Combine two import statements from the same module
 */
function combineImports(imports1, imports2, fromModule) {
  // Handle different import styles
  const items1 = parseImportItems(imports1);
  const items2 = parseImportItems(imports2);
  
  // Combine all items
  const allItems = new Set([...items1.named, ...items2.named]);
  const allTypes = new Set([...items1.types, ...items2.types]);
  const defaultImport = items1.default || items2.default;
  const namespaceImport = items1.namespace || items2.namespace;
  
  // Build combined import statement
  let combined = 'import ';
  
  if (defaultImport) {
    combined += defaultImport;
    if (allItems.size > 0 || allTypes.size > 0) {
      combined += ', ';
    }
  }
  
  if (namespaceImport) {
    combined += namespaceImport;
    if (allItems.size > 0 || allTypes.size > 0) {
      combined += ', ';
    }
  }
  
  if (allTypes.size > 0) {
    combined += 'type { ' + Array.from(allTypes).join(', ') + ' }';
    if (allItems.size > 0) {
      combined += ', ';
    }
  }
  
  if (allItems.size > 0) {
    combined += '{ ' + Array.from(allItems).join(', ') + ' }';
  }
  
  combined += ` from '${fromModule}';`;
  
  return combined;
}

/**
 * Parse import items from import statement
 */
function parseImportItems(importStr) {
  const result = {
    default: null,
    namespace: null,
    named: [],
    types: []
  };
  
  // Check for default import
  const defaultMatch = importStr.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  if (defaultMatch && !importStr.startsWith('{') && !importStr.startsWith('type')) {
    result.default = defaultMatch[1];
  }
  
  // Check for namespace import
  if (importStr.includes('* as ')) {
    const namespaceMatch = importStr.match(/\* as ([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (namespaceMatch) {
      result.namespace = `* as ${namespaceMatch[1]}`;
    }
  }
  
  // Check for type imports
  if (importStr.includes('type {')) {
    const typeMatch = importStr.match(/type\s*{\s*([^}]+)\s*}/);
    if (typeMatch) {
      result.types = typeMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  
  // Check for named imports
  const namedMatch = importStr.match(/(?<!type\s){\s*([^}]+)\s*}/);
  if (namedMatch) {
    result.named = namedMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  }
  
  return result;
}

// Summary
console.log('=========================================');
console.log('Summary');
console.log('=========================================');
console.log('');
console.log(`✅ Fixed: ${fixedCount} duplicate imports`);
console.log(`⚠️  Skipped: ${skippedCount} (already fixed or not found)`);
if (errors.length > 0) {
  console.log(`❌ Errors: ${errors.length}`);
  errors.forEach(err => {
    console.log(`   - ${path.basename(err.file)}: ${err.error}`);
  });
}
console.log('');
console.log('Next step: Run TypeScript compiler to verify no errors introduced');
console.log('Command: npx tsc --noEmit');