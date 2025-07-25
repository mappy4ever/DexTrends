const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Import fixes mapping
const importFixes = [
  // PriceHistoryChart
  { from: /from ['"]\.\.\/ui\/PriceHistoryChart['"]/g, to: 'from "../ui/charts/PriceHistoryChart"' },
  
  // CardComparisonTool
  { from: /from ['"]\.\.\/components\/ui\/CardComparisonTool['"]/g, to: 'from "../components/ui/cards/CardComparisonTool"' },
  
  // TypeFilter
  { from: /from ['"]\.\.\/components\/ui\/TypeFilter['"]/g, to: 'from "../components/ui/forms/TypeFilter"' },
  
  // PokemonEmptyState
  { from: /from ['"]\.\.\/components\/ui\/PokemonEmptyState['"]/g, to: 'from "../components/ui/loading/PokemonEmptyState"' },
  
  // AnimationSystem
  { from: /from ['"]\.\.\/\.\.\/components\/ui\/AnimationSystem['"]/g, to: 'from "../../components/ui/animations/AnimationSystem"' },
];

// Files to check
const filesToCheck = [
  'components/dynamic/DynamicComponents.js',
  'pages/index.js',
  'pages/pocketmode.js',
  'pages/pocketmode/decks.js',
];

// Process files
filesToCheck.forEach(file => {
  const filePath = path.join(rootDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    importFixes.forEach(({ from, to }) => {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${file}`);
    } else {
      console.log(`⏭️  Skipped: ${file} (no changes needed)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\nImport fixes complete!');