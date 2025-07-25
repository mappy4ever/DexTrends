const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Import fixes mapping
const importFixes = [
  // Loading screens
  { from: /from ['"]\.\.\/components\/ui\/UnifiedLoadingScreen['"]/g, to: 'from "../components/ui/loading/UnifiedLoadingScreen"' },
  { from: /from ['"]\.\.\/\.\.\/components\/ui\/UnifiedLoadingScreen['"]/g, to: 'from "../../components/ui/loading/UnifiedLoadingScreen"' },
  { from: /from ['"]\.\.\/ui\/UnifiedLoadingScreen['"]/g, to: 'from "../ui/loading/UnifiedLoadingScreen"' },
  
  // PokemonLoadingScreen
  { from: /from ['"]\.\.\/components\/ui\/PokemonLoadingScreen['"]/g, to: 'from "../components/ui/loading/PokemonLoadingScreen"' },
  { from: /from ['"]\.\.\/\.\.\/components\/ui\/PokemonLoadingScreen['"]/g, to: 'from "../../components/ui/loading/PokemonLoadingScreen"' },
  
  // CollectionDashboard
  { from: /from ['"]\.\.\/components\/ui\/CollectionDashboard['"]/g, to: 'from "../components/ui/layout/CollectionDashboard"' },
  { from: /from ['"]\.\.\/\.\.\/components\/ui\/CollectionDashboard['"]/g, to: 'from "../../components/ui/layout/CollectionDashboard"' },
  
  // VisualSearchFilters
  { from: /from ['"]\.\.\/components\/ui\/VisualSearchFilters['"]/g, to: 'from "../components/ui/forms/VisualSearchFilters"' },
  { from: /from ['"]\.\.\/\.\.\/components\/ui\/VisualSearchFilters['"]/g, to: 'from "../../components/ui/forms/VisualSearchFilters"' },
  
  // animations.js (special case - already has .js extension in some places)
  { from: /from ['"]\.\.\/ui\/animations\.js['"]/g, to: 'from "../ui/animations/animations"' },
  { from: /from ['"]\.\.\/ui\/animations['"]/g, to: 'from "../ui/animations/animations"' },
];

// Files to check
const filesToCheck = [
  'pages/index.js',
  'pages/favorites.js',
  'pages/trending.js',
  'pages/tcgsets.js',
  'pages/tcgsets/[setid].js',
  'components/regions/SpecialPokemonShowcase.js',
  'pages/pokemon/regions/[region].js',
  'pages/pocketmode/expansions.js',
  'components/ui/EnhancedEvolutionDisplay.js',
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