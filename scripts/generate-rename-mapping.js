#!/usr/bin/env node

/**
 * Generate rename mapping for the naming standardization project
 * This script analyzes the codebase and creates a mapping of proposed renames
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_FILE = path.join(process.cwd(), 'rename-mapping.json');

console.log('=========================================');
console.log('Generating Rename Mapping');
console.log('=========================================');
console.log('');

const renameMap = {
  components: [],
  pages: [],
  utilities: [],
  duplicates: [],
  summary: {
    totalRenames: 0,
    cardToTileRenames: 0,
    prefixStandardizations: 0,
    duplicateConsolidations: 0,
    utilityMerges: 0
  }
};

// 1. Find all Card components that should be renamed
console.log('Step 1: Analyzing Card components...');
const cardComponents = execSync(
  'find components -name "*Card*.tsx" -o -name "*Card*.ts" 2>/dev/null || true',
  { encoding: 'utf8' }
).split('\n').filter(Boolean);

cardComponents.forEach(file => {
  const basename = path.basename(file, path.extname(file));
  const dir = path.dirname(file);
  
  // Skip actual TCG card components
  if (basename.includes('TCG') || basename.includes('Flippable') || 
      file.includes('/tcg/') || file.includes('/cards/')) {
    return;
  }
  
  // Determine new name based on pattern
  let newName = basename;
  if (basename.includes('Circular') && basename.includes('Pokemon')) {
    newName = basename.replace('Card', 'Avatar');
  } else if (basename.includes('GymLeader') || basename.includes('Pokemon') || 
             basename.includes('Champion') || basename.includes('EliteFour')) {
    newName = basename.replace('Card', 'Tile');
  } else if (basename.includes('Enhanced') || basename.includes('Detailed')) {
    newName = basename.replace('Card', 'Display');
  }
  
  if (newName !== basename) {
    renameMap.components.push({
      oldPath: file,
      newPath: path.join(dir, newName + path.extname(file)),
      oldName: basename,
      newName: newName,
      reason: 'Card→Tile/Display clarification'
    });
    renameMap.summary.cardToTileRenames++;
  }
});

console.log(`  Found ${renameMap.summary.cardToTileRenames} Card→Tile/Display renames`);

// 2. Find components with inconsistent prefixes
console.log('Step 2: Analyzing component prefixes...');
const prefixPatterns = ['Enhanced', 'Advanced', 'Unified', 'Simple'];
const prefixComponents = [];

prefixPatterns.forEach(prefix => {
  const files = execSync(
    `find components -name "${prefix}*.tsx" -o -name "${prefix}*.ts" 2>/dev/null || true`,
    { encoding: 'utf8' }
  ).split('\n').filter(Boolean);
  
  files.forEach(file => {
    const basename = path.basename(file, path.extname(file));
    const dir = path.dirname(file);
    let newName = basename;
    
    // Apply new prefix conventions
    if (prefix === 'Enhanced' && basename.includes('Modal')) {
      newName = basename.replace('Enhanced', 'Smart');
    } else if (prefix === 'Simple' && basename.includes('Pokemon')) {
      newName = basename.replace('Simple', 'Base');
    } else if (prefix === 'Unified' && !basename.includes('App')) {
      // Keep Unified for app-level contexts, remove for others
      newName = basename.replace('Unified', '');
    } else if (prefix === 'Advanced' && !basename.includes('Search')) {
      newName = basename.replace('Advanced', 'Smart');
    }
    
    if (newName !== basename) {
      renameMap.components.push({
        oldPath: file,
        newPath: path.join(dir, newName + path.extname(file)),
        oldName: basename,
        newName: newName,
        reason: 'Prefix standardization'
      });
      renameMap.summary.prefixStandardizations++;
    }
  });
});

console.log(`  Found ${renameMap.summary.prefixStandardizations} prefix standardizations`);

// 3. Find duplicate components
console.log('Step 3: Finding duplicate components...');
const allComponents = execSync(
  'find components -name "*.tsx" 2>/dev/null || true',
  { encoding: 'utf8' }
).split('\n').filter(Boolean);

const componentMap = {};
allComponents.forEach(file => {
  const basename = path.basename(file, path.extname(file));
  if (!componentMap[basename]) {
    componentMap[basename] = [];
  }
  componentMap[basename].push(file);
});

Object.entries(componentMap).forEach(([name, files]) => {
  if (files.length > 1) {
    // Determine which one to keep (prefer ui/ or root components/)
    const primary = files.find(f => f.includes('/ui/')) || 
                   files.find(f => !f.includes('/_archive/')) ||
                   files[0];
    
    files.forEach(file => {
      if (file !== primary) {
        renameMap.duplicates.push({
          duplicate: file,
          primary: primary,
          name: name,
          action: 'consolidate',
          reason: 'Duplicate component'
        });
        renameMap.summary.duplicateConsolidations++;
      }
    });
  }
});

console.log(`  Found ${renameMap.summary.duplicateConsolidations} duplicate components`);

// 4. Find duplicate/similar pages
console.log('Step 4: Analyzing pages...');
const pages = execSync(
  'find pages -name "*.tsx" -not -path "*/api/*" 2>/dev/null || true',
  { encoding: 'utf8' }
).split('\n').filter(Boolean);

pages.forEach(file => {
  const basename = path.basename(file, '.tsx');
  
  // Check for duplicate patterns
  if (basename.includes('-new') || basename.includes('-unified') || 
      basename.includes('-old') || basename.includes('-legacy')) {
    renameMap.pages.push({
      oldPath: file,
      basename: basename,
      action: 'review-for-removal',
      reason: 'Duplicate/legacy page variant'
    });
  }
  
  // Check for naming issues
  if (basename === 'tcgexpansions') {
    renameMap.pages.push({
      oldPath: file,
      newPath: file.replace('tcgexpansions', 'tcgexpansions'),
      oldName: basename,
      newName: 'tcgexpansions',
      reason: 'Kebab-case convention'
    });
  }
});

console.log(`  Found ${renameMap.pages.length} page issues`);

// 5. Analyze utilities
console.log('Step 5: Analyzing utilities...');
const utilities = execSync(
  'find utils -name "*.ts" -o -name "*.tsx" 2>/dev/null || true',
  { encoding: 'utf8' }
).split('\n').filter(Boolean);

// Find animation utilities to merge
const animationUtils = utilities.filter(f => f.includes('animation'));
if (animationUtils.length > 2) {
  animationUtils.slice(2).forEach(file => {
    renameMap.utilities.push({
      oldPath: file,
      action: 'merge',
      mergeInto: 'utils/animationUtils.ts',
      reason: 'Consolidate animation utilities'
    });
    renameMap.summary.utilityMerges++;
  });
}

// Fix naming inconsistencies
utilities.forEach(file => {
  const basename = path.basename(file, path.extname(file));
  const dir = path.dirname(file);
  let newName = basename;
  
  // Apply naming conventions
  if (basename === 'apiutils') {
    newName = 'apiUtils';
  } else if (basename === 'unifiedFetch') {
    newName = 'fetchService';
  } else if (basename.endsWith('Optimizer') || basename.endsWith('Engine')) {
    newName = basename.replace(/Optimizer$/, 'Utils').replace(/Engine$/, 'Service');
  }
  
  if (newName !== basename) {
    renameMap.utilities.push({
      oldPath: file,
      newPath: path.join(dir, newName + path.extname(file)),
      oldName: basename,
      newName: newName,
      reason: 'Naming convention'
    });
  }
});

console.log(`  Found ${renameMap.utilities.length} utility renames`);

// Calculate totals
renameMap.summary.totalRenames = 
  renameMap.components.length + 
  renameMap.pages.filter(p => p.newPath).length + 
  renameMap.utilities.filter(u => u.newPath).length;

// 6. Generate priority list
console.log('Step 6: Generating priority list...');
const priorities = {
  high: [],
  medium: [],
  low: []
};

// High priority: Card→Tile renames (most confusing)
renameMap.components.forEach(c => {
  if (c.reason.includes('Card→Tile')) {
    priorities.high.push(c);
  } else if (c.reason.includes('Prefix')) {
    priorities.medium.push(c);
  } else {
    priorities.low.push(c);
  }
});

// High priority: Duplicate consolidations
renameMap.duplicates.forEach(d => {
  priorities.high.push(d);
});

renameMap.priorities = priorities;

// Write the mapping file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(renameMap, null, 2));

// Generate summary report
console.log('');
console.log('=========================================');
console.log('Rename Mapping Summary');
console.log('=========================================');
console.log('');
console.log('Components:');
console.log(`  Card→Tile/Display renames: ${renameMap.summary.cardToTileRenames}`);
console.log(`  Prefix standardizations: ${renameMap.summary.prefixStandardizations}`);
console.log(`  Duplicate consolidations: ${renameMap.summary.duplicateConsolidations}`);
console.log('');
console.log('Pages:');
console.log(`  Issues found: ${renameMap.pages.length}`);
console.log('');
console.log('Utilities:');
console.log(`  Renames needed: ${renameMap.utilities.filter(u => u.newPath).length}`);
console.log(`  Merges needed: ${renameMap.summary.utilityMerges}`);
console.log('');
console.log(`Total renames required: ${renameMap.summary.totalRenames}`);
console.log('');
console.log('Priority Breakdown:');
console.log(`  High priority: ${priorities.high.length} items`);
console.log(`  Medium priority: ${priorities.medium.length} items`);
console.log(`  Low priority: ${priorities.low.length} items`);
console.log('');
console.log(`Output saved to: ${OUTPUT_FILE}`);
console.log('');
console.log('Next steps:');
console.log('1. Review rename-mapping.json');
console.log('2. Run validation script to check dependencies');
console.log('3. Execute renames in priority order');
console.log('4. Update all imports automatically');