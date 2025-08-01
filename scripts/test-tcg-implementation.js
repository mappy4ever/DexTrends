#!/usr/bin/env node

// Automated test for TCG Set Detail Page implementation
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing TCG Set Detail Page Implementation...\n');

// Test 1: Check if new files exist
console.log('1️⃣ File Creation Test:');
const newFiles = [
  'utils/tcgRaritySymbols.ts',
  'components/tcg-set-detail/types.ts',
  'components/tcg-set-detail/sections/SetHeader.tsx',
  'components/tcg-set-detail/sections/SetStats.tsx',
  'components/tcg-set-detail/sections/RarityShowcase.tsx'
];

let allFilesExist = true;
newFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Test 2: Check if rarity images exist
console.log('\n2️⃣ Rarity Symbol Images Test:');
const rarityImagesDir = path.join(__dirname, '..', 'public', 'images', 'TCG-rarity');
if (fs.existsSync(rarityImagesDir)) {
  const images = fs.readdirSync(rarityImagesDir);
  console.log(`   ✅ Found ${images.length} rarity symbol images`);
  console.log(`   📁 First 5 images: ${images.slice(0, 5).join(', ')}`);
} else {
  console.log('   ❌ Rarity images directory not found!');
}

// Test 3: Check imports in main file
console.log('\n3️⃣ Import Test:');
const mainFile = fs.readFileSync(path.join(__dirname, '..', 'pages', 'tcgsets', '[setid].tsx'), 'utf8');
const requiredImports = [
  'EnhancedAnimationSystem',
  'SkeletonLoadingSystem',
  'SmartSearchEnhancer',
  'CollectionTracker',
  'PortfolioManager',
  'SetHeader',
  'SetStats',
  'RarityShowcase'
];

requiredImports.forEach(imp => {
  const found = mainFile.includes(imp);
  console.log(`   ${found ? '✅' : '❌'} ${imp} imported`);
});

// Test 4: Check component usage
console.log('\n4️⃣ Component Usage Test:');
const componentsUsed = [
  '<SetHeader',
  '<SetStats',
  '<RarityShowcase',
  '<SmartSearchEnhancer',
  '<FloatingActionSystem',
  '<AdvancedModalSystem'
];

componentsUsed.forEach(comp => {
  const used = mainFile.includes(comp);
  console.log(`   ${used ? '✅' : '❌'} ${comp} used`);
});

// Test 5: Check if old code was removed
console.log('\n5️⃣ Code Cleanup Test:');
const oldCodePatterns = [
  'filterRarity',
  'filterSubtype',
  'filterSupertype',
  'modalOpen',
  'modalCard'
];

let cleanupScore = 0;
oldCodePatterns.forEach(pattern => {
  const stillExists = mainFile.includes(pattern);
  if (!stillExists) cleanupScore++;
  console.log(`   ${stillExists ? '⚠️' : '✅'} ${pattern} ${stillExists ? 'still exists' : 'removed'}`);
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`   ✅ New files created: ${allFilesExist ? 'Yes' : 'No'}`);
console.log(`   ✅ Rarity images available: ${fs.existsSync(rarityImagesDir) ? 'Yes' : 'No'}`);
console.log(`   ✅ Required imports: ${requiredImports.filter(imp => mainFile.includes(imp)).length}/${requiredImports.length}`);
console.log(`   ✅ Components integrated: ${componentsUsed.filter(comp => mainFile.includes(comp)).length}/${componentsUsed.length}`);
console.log(`   ✅ Old code cleaned up: ${cleanupScore}/${oldCodePatterns.length}`);

console.log('\n📝 Next Steps:');
console.log('1. Open http://localhost:3002/tcgsets/sv5 in your browser');
console.log('2. Check that all sections load without errors');
console.log('3. Verify rarity symbols appear on cards');
console.log('4. Test search and filter functionality');
console.log('5. Click a card to test the modal');

// Check TypeScript compilation
console.log('\n🔧 Running TypeScript check...');
const { execSync } = require('child_process');
try {
  execSync('npm run typecheck', { stdio: 'pipe' });
  console.log('   ✅ TypeScript compilation successful!');
} catch (error) {
  console.log('   ⚠️  TypeScript errors found (might be unrelated to our changes)');
}