const fs = require('fs');
const path = require('path');

// Files that need UnifiedLoadingScreen import updates
const unifiedLoadingScreenFiles = [
  'pages/favorites.js',
  'pages/trending.js',
  'pages/tcgsets.js',
  'pages/tcgsets/[setid].js',
  'pages/pocketmode/expansions.js'
];

// Files that need PriceHistoryChart import updates
const priceHistoryChartFiles = [
  'components/dynamic/DynamicComponents.js'
];

const rootDir = path.join(__dirname, '..');

// Update UnifiedLoadingScreen imports
console.log('Updating UnifiedLoadingScreen imports...');
unifiedLoadingScreenFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update the import path
    const oldPattern = /from ['"]\.\.\/\.\.\/components\/ui\/UnifiedLoadingScreen['"]/g;
    const newImport = 'from "../../components/ui/loading/UnifiedLoadingScreen"';
    
    const newContent = content.replace(oldPattern, newImport);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated: ${file}`);
    } else {
      console.log(`⏭️  Skipped: ${file} (already updated or pattern not found)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

// Update PriceHistoryChart imports in DynamicComponents.js
console.log('\nUpdating PriceHistoryChart imports...');
const dynamicComponentsPath = path.join(rootDir, 'components/dynamic/DynamicComponents.js');

try {
  let content = fs.readFileSync(dynamicComponentsPath, 'utf8');
  
  // Update both occurrences
  content = content.replace(
    /from '\.\.\/ui\/PriceHistoryChart'/g,
    "from '../ui/charts/PriceHistoryChart'"
  );
  
  fs.writeFileSync(dynamicComponentsPath, content);
  console.log(`✅ Updated: components/dynamic/DynamicComponents.js`);
} catch (error) {
  console.error(`❌ Error processing DynamicComponents.js:`, error.message);
}

console.log('\nImport updates complete!');