#!/usr/bin/env node

/**
 * Validate rename mapping to ensure no functionality is lost
 * This script checks that similar-named files actually have similar functionality
 * before proposing merges or deletions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RENAME_MAPPING = path.join(process.cwd(), 'rename-mapping.json');
const VALIDATION_OUTPUT = path.join(process.cwd(), 'rename-validation.json');

console.log('=========================================');
console.log('Validating Rename Mapping');
console.log('=========================================');
console.log('');

// Load the rename mapping
const renameMap = JSON.parse(fs.readFileSync(RENAME_MAPPING, 'utf8'));

const validation = {
  safeRenames: [],      // Just renaming, no functionality change
  safeMerges: [],       // Actually duplicate code
  dangerousMerges: [],  // Similar names but different functionality
  needsReview: [],      // Requires manual review
  keepSeparate: [],     // Definitely different functionality
  stats: {
    totalChecked: 0,
    safeCount: 0,
    dangerousCount: 0,
    reviewCount: 0
  }
};

// Helper function to get file exports
function getExports(filePath) {
  if (!fs.existsSync(filePath)) return [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const exports = [];
    
    // Find export statements
    const exportMatches = content.matchAll(/export\s+(?:const|function|class|interface|type|enum)\s+(\w+)/g);
    for (const match of exportMatches) {
      exports.push(match[1]);
    }
    
    // Find default export
    if (content.includes('export default')) {
      exports.push('default');
    }
    
    return exports;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return [];
  }
}

// Helper function to check if files have similar functionality
function checkSimilarity(file1, file2) {
  const exports1 = getExports(file1);
  const exports2 = getExports(file2);
  
  // Check export overlap
  const commonExports = exports1.filter(e => exports2.includes(e));
  const similarity = commonExports.length / Math.max(exports1.length, exports2.length, 1);
  
  // Get file sizes for additional check
  const size1 = fs.existsSync(file1) ? fs.statSync(file1).size : 0;
  const size2 = fs.existsSync(file2) ? fs.statSync(file2).size : 0;
  const sizeDiff = Math.abs(size1 - size2) / Math.max(size1, size2, 1);
  
  return {
    exports1,
    exports2,
    commonExports,
    similarity,
    sizeDiff,
    likelyDuplicate: similarity > 0.8 && sizeDiff < 0.3
  };
}

// 1. Validate duplicate components
console.log('Step 1: Validating duplicate components...');
renameMap.duplicates.forEach(dup => {
  validation.stats.totalChecked++;
  
  const similarity = checkSimilarity(dup.duplicate, dup.primary);
  
  if (similarity.likelyDuplicate) {
    validation.safeMerges.push({
      ...dup,
      similarity: similarity.similarity,
      reason: 'High similarity - likely safe to merge'
    });
    validation.stats.safeCount++;
  } else if (similarity.similarity > 0.5) {
    validation.needsReview.push({
      ...dup,
      similarity: similarity.similarity,
      exports: {
        duplicate: similarity.exports1,
        primary: similarity.exports2,
        common: similarity.commonExports
      },
      reason: 'Partial similarity - needs manual review'
    });
    validation.stats.reviewCount++;
  } else {
    validation.keepSeparate.push({
      ...dup,
      similarity: similarity.similarity,
      reason: 'Different functionality - keep separate'
    });
    validation.stats.dangerousCount++;
  }
});

console.log(`  Checked ${renameMap.duplicates.length} duplicates`);
console.log(`  Safe to merge: ${validation.safeMerges.length}`);
console.log(`  Need review: ${validation.needsReview.length}`);
console.log(`  Keep separate: ${validation.keepSeparate.length}`);

// 2. Validate utility merges
console.log('\nStep 2: Validating utility merges...');

// Check animation utilities specifically
const animationUtils = [
  'utils/animation.ts',
  'utils/animations.ts',
  'utils/animationVariants.ts',
  'utils/animationOptimization.ts',
  'utils/animationPerformance.ts'
].filter(f => fs.existsSync(f));

if (animationUtils.length > 0) {
  console.log('  Checking animation utilities...');
  
  // Get all exports from each animation file
  const animationExports = {};
  animationUtils.forEach(file => {
    animationExports[file] = getExports(file);
  });
  
  // Check for overlapping functionality
  const allExports = Object.values(animationExports).flat();
  const uniqueExports = [...new Set(allExports)];
  
  if (allExports.length !== uniqueExports.length) {
    console.log('  ⚠️  Found duplicate exports across animation utilities');
    validation.dangerousMerges.push({
      files: animationUtils,
      exports: animationExports,
      reason: 'Duplicate exports found - need careful merge'
    });
  } else {
    console.log('  ✓ Animation utilities have unique exports');
    validation.keepSeparate.push({
      files: animationUtils,
      reason: 'Each file provides different functionality'
    });
  }
  
  // Detail what each animation file does
  animationUtils.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').slice(0, 10);
    const hasReact = content.includes('import React') || content.includes('from \'react\'');
    const hasFramer = content.includes('framer-motion');
    const hasDOM = content.includes('document.') || content.includes('window.');
    
    console.log(`    ${path.basename(file)}:`);
    console.log(`      - Exports: ${animationExports[file].join(', ')}`);
    console.log(`      - Uses React: ${hasReact}`);
    console.log(`      - Uses Framer: ${hasFramer}`);
    console.log(`      - DOM manipulation: ${hasDOM}`);
  });
}

// 3. Validate component renames (Card → Tile)
console.log('\nStep 3: Validating Card → Tile renames...');
renameMap.components.forEach(comp => {
  if (comp.reason.includes('Card→Tile')) {
    validation.stats.totalChecked++;
    
    // Check if component is actually used as a card (trading card)
    if (fs.existsSync(comp.oldPath)) {
      const content = fs.readFileSync(comp.oldPath, 'utf8');
      
      // Check for TCG-related terms
      const isTCGCard = 
        content.includes('rarity') ||
        content.includes('set_') ||
        content.includes('cardmarket') ||
        content.includes('tcgplayer') ||
        content.includes('flippable') ||
        content.includes('holofoil');
      
      if (isTCGCard) {
        validation.dangerousMerges.push({
          ...comp,
          reason: 'Contains TCG-related code - might be actual card'
        });
        validation.stats.dangerousCount++;
      } else {
        validation.safeRenames.push({
          ...comp,
          reason: 'UI container component - safe to rename'
        });
        validation.stats.safeCount++;
      }
    }
  } else {
    // Other renames are generally safe (just naming)
    validation.safeRenames.push(comp);
    validation.stats.safeCount++;
  }
});

console.log(`  Validated ${validation.safeRenames.length} safe renames`);
console.log(`  Found ${validation.dangerousMerges.length} potentially dangerous changes`);

// 4. Check for usage of components before marking as duplicate
console.log('\nStep 4: Checking component usage...');

validation.needsReview.forEach(item => {
  if (item.duplicate) {
    try {
      // Check how many times each is imported
      const duplicateImports = execSync(
        `grep -r "from.*${path.basename(item.duplicate, '.tsx')}" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l`,
        { encoding: 'utf8' }
      ).trim();
      
      const primaryImports = execSync(
        `grep -r "from.*${path.basename(item.primary, '.tsx')}" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l`,
        { encoding: 'utf8' }
      ).trim();
      
      item.usage = {
        duplicate: parseInt(duplicateImports),
        primary: parseInt(primaryImports)
      };
      
      if (parseInt(duplicateImports) > 0 && parseInt(primaryImports) > 0) {
        item.warning = 'Both versions are actively used - need careful migration';
      }
    } catch (error) {
      // Grep might fail, that's ok
    }
  }
});

// Write validation results
fs.writeFileSync(VALIDATION_OUTPUT, JSON.stringify(validation, null, 2));

// Generate safety report
console.log('');
console.log('=========================================');
console.log('Validation Summary');
console.log('=========================================');
console.log('');
console.log('Safety Analysis:');
console.log(`  ✅ Safe operations: ${validation.stats.safeCount}`);
console.log(`  ⚠️  Need review: ${validation.stats.reviewCount}`);
console.log(`  ❌ Potentially dangerous: ${validation.stats.dangerousCount}`);
console.log('');

if (validation.keepSeparate.length > 0) {
  console.log('Files to KEEP SEPARATE (different functionality):');
  validation.keepSeparate.forEach(item => {
    console.log(`  - ${item.files ? item.files.join(', ') : item.duplicate}`);
    console.log(`    Reason: ${item.reason}`);
  });
  console.log('');
}

if (validation.dangerousMerges.length > 0) {
  console.log('⚠️  DANGEROUS operations detected:');
  validation.dangerousMerges.forEach(item => {
    console.log(`  - ${item.oldName || 'Multiple files'}`);
    console.log(`    Reason: ${item.reason}`);
  });
  console.log('');
}

if (validation.needsReview.length > 0) {
  console.log('Items needing manual review:');
  validation.needsReview.forEach(item => {
    console.log(`  - ${item.name}`);
    if (item.usage) {
      console.log(`    Usage: duplicate(${item.usage.duplicate}), primary(${item.usage.primary})`);
    }
    if (item.warning) {
      console.log(`    ⚠️  ${item.warning}`);
    }
  });
}

console.log('');
console.log('Recommendations:');
console.log('1. Start with safe renames only (no functionality change)');
console.log('2. Review each "needs review" item manually');
console.log('3. DO NOT merge files marked as "keep separate"');
console.log('4. Check usage counts before removing any "duplicate"');
console.log('');
console.log(`Full validation report saved to: ${VALIDATION_OUTPUT}`);