#!/usr/bin/env node

/**
 * Safe Rename Script - ONLY renames files for clarity
 * NO merging, NO deletion, NO functionality changes
 * 
 * Based on validation: Very little actual duplication exists
 * Focus: Clear naming conventions only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=========================================');
console.log('Safe Rename Script - Clarity Only');
console.log('=========================================');
console.log('');
console.log('This script ONLY renames for clarity.');
console.log('NO files will be merged or deleted.');
console.log('');

// Define ONLY the safest renames
const SAFE_RENAMES = {
  // Utility casing fixes
  utilities: [
    {
      old: 'utils/apiutils.ts',
      new: 'utils/apiUtils.ts',
      reason: 'Fix camelCase convention'
    }
  ],
  
  // Card → Tile renames (UI containers only, NOT TCG cards)
  components: [
    {
      old: 'components/ui/cards/GymLeaderCard.tsx',
      new: 'components/ui/cards/GymLeaderTile.tsx',
      reason: 'UI container, not a trading card'
    },
    {
      old: 'components/ui/cards/CircularGymLeaderCard.tsx', 
      new: 'components/ui/cards/GymLeaderAvatar.tsx',
      reason: 'Avatar/profile image, not a card'
    },
    {
      old: 'components/ui/cards/CircularPokemonCard.tsx',
      new: 'components/ui/cards/PokemonAvatar.tsx',
      reason: 'Avatar/profile image, not a card'
    },
    {
      old: 'components/ui/cards/EliteFourCard.tsx',
      new: 'components/ui/cards/EliteFourTile.tsx',
      reason: 'UI container, not a trading card'
    },
    {
      old: 'components/ui/cards/ChampionCard.tsx',
      new: 'components/ui/cards/ChampionTile.tsx',
      reason: 'UI container, not a trading card'
    },
    {
      old: 'components/ui/cards/PokemonCardItem.tsx',
      new: 'components/ui/cards/PokemonTile.tsx',
      reason: 'List item display, not a trading card'
    }
  ],
  
  // Page route standardization
  pages: [
    {
      old: 'pages/tcgexpansions.tsx',
      new: 'pages/tcgexpansions.tsx',
      reason: 'Kebab-case route convention'
    },
    {
      old: 'pages/tcgexpansions',
      new: 'pages/tcgexpansions',
      reason: 'Kebab-case route convention',
      isDirectory: true
    }
  ]
};

// Track changes for rollback
const changes = [];
const errors = [];

// Helper to update imports in a file
function updateImportsInFile(filePath, oldName, newName) {
  if (!fs.existsSync(filePath)) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Update various import patterns
    const patterns = [
      // Direct imports
      new RegExp(`from ['"].*/${oldName}['"]`, 'g'),
      new RegExp(`from ['"].*/${oldName}.tsx['"]`, 'g'),
      new RegExp(`from ['"].*/${oldName}.ts['"]`, 'g'),
      
      // Named imports
      new RegExp(`\\b${oldName}\\b`, 'g')
    ];
    
    // Get the base names without extension
    const oldBase = path.basename(oldName, path.extname(oldName));
    const newBase = path.basename(newName, path.extname(newName));
    
    // Replace import paths
    content = content.replace(
      new RegExp(`(['"])([^'"]*/)${oldBase}(\.tsx?)?(['"])`, 'g'),
      `$1$2${newBase}$3$4`
    );
    
    // Replace component references (but be careful)
    if (oldBase !== newBase && !oldBase.includes('utils')) {
      // Only replace component names, not utility function names
      content = content.replace(
        new RegExp(`<${oldBase}([\\s/>])`, 'g'),
        `<${newBase}$1`
      );
      content = content.replace(
        new RegExp(`</${oldBase}>`, 'g'),
        `</${newBase}>`
      );
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (error) {
    console.error(`Error updating imports in ${filePath}: ${error.message}`);
  }
  
  return false;
}

// Execute renames
function executeRename(item, category) {
  const { old: oldPath, new: newPath, reason, isDirectory } = item;
  
  // Check if source exists
  if (!fs.existsSync(oldPath)) {
    console.log(`  ⚠️  Skipped: ${oldPath} (not found)`);
    return false;
  }
  
  // Check if target already exists
  if (fs.existsSync(newPath)) {
    console.log(`  ⚠️  Skipped: ${newPath} (already exists)`);
    return false;
  }
  
  try {
    // Perform the rename
    if (isDirectory) {
      execSync(`mv "${oldPath}" "${newPath}"`);
    } else {
      fs.renameSync(oldPath, newPath);
    }
    
    console.log(`  ✅ Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
    console.log(`     Reason: ${reason}`);
    
    // Track the change
    changes.push({
      category,
      old: oldPath,
      new: newPath,
      timestamp: new Date().toISOString()
    });
    
    // Update imports across the codebase
    const oldBase = path.basename(oldPath, path.extname(oldPath));
    const newBase = path.basename(newPath, path.extname(newPath));
    
    if (oldBase !== newBase) {
      console.log(`     Updating imports...`);
      
      // Find all files that might import this
      const files = execSync(
        'find . -type f \\( -name "*.ts" -o -name "*.tsx" \\) -not -path "./node_modules/*" -not -path "./.next/*" 2>/dev/null',
        { encoding: 'utf8' }
      ).split('\n').filter(Boolean);
      
      let updatedCount = 0;
      files.forEach(file => {
        if (updateImportsInFile(file, oldBase, newBase)) {
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        console.log(`     Updated ${updatedCount} import references`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    errors.push({
      file: oldPath,
      error: error.message
    });
    return false;
  }
}

// Main execution
console.log('Phase 1: Utility Renames');
console.log('-------------------------');
SAFE_RENAMES.utilities.forEach(item => executeRename(item, 'utilities'));

console.log('');
console.log('Phase 2: Component Renames (Card → Tile/Avatar)');
console.log('-----------------------------------------------');
SAFE_RENAMES.components.forEach(item => executeRename(item, 'components'));

console.log('');
console.log('Phase 3: Page Route Standardization');
console.log('-----------------------------------');
SAFE_RENAMES.pages.forEach(item => executeRename(item, 'pages'));

// Save change log
const changeLog = {
  timestamp: new Date().toISOString(),
  changes,
  errors,
  summary: {
    total: changes.length,
    utilities: changes.filter(c => c.category === 'utilities').length,
    components: changes.filter(c => c.category === 'components').length,
    pages: changes.filter(c => c.category === 'pages').length
  }
};

fs.writeFileSync(
  path.join(process.cwd(), 'rename-changelog.json'),
  JSON.stringify(changeLog, null, 2)
);

// Generate summary
console.log('');
console.log('=========================================');
console.log('Rename Summary');
console.log('=========================================');
console.log('');
console.log(`✅ Successfully renamed: ${changes.length} files`);
if (errors.length > 0) {
  console.log(`❌ Errors encountered: ${errors.length}`);
}
console.log('');
console.log('Changes by category:');
console.log(`  Utilities: ${changeLog.summary.utilities}`);
console.log(`  Components: ${changeLog.summary.components}`);
console.log(`  Pages: ${changeLog.summary.pages}`);
console.log('');
console.log('What we did NOT do:');
console.log('  ✓ No files were merged');
console.log('  ✓ No files were deleted');
console.log('  ✓ No functionality was changed');
console.log('  ✓ All TCG Card components kept their names');
console.log('');
console.log('Next steps:');
console.log('1. Run TypeScript check: npx tsc --noEmit');
console.log('2. Run tests: npm test');
console.log('3. Check all pages load correctly');
console.log('4. Commit changes if everything works');
console.log('');
console.log(`Change log saved to: rename-changelog.json`);

// Create rollback script
const rollbackScript = `#!/usr/bin/env node
// Rollback script for rename operations
const changes = ${JSON.stringify(changes, null, 2)};
const fs = require('fs');

console.log('Rolling back renames...');
changes.reverse().forEach(change => {
  try {
    fs.renameSync(change.new, change.old);
    console.log(\`Rolled back: \${change.new} → \${change.old}\`);
  } catch (error) {
    console.error(\`Failed to rollback \${change.new}: \${error.message}\`);
  }
});
console.log('Rollback complete');
`;

fs.writeFileSync(
  path.join(process.cwd(), 'scripts/rollback-renames.js'),
  rollbackScript
);
console.log('Rollback script created: scripts/rollback-renames.js');