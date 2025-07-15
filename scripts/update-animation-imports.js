const fs = require('fs');
const path = require('path');

// Files that need animation import updates
const filesToUpdate = [
  'pages/cards/[cardId].js',
  'pages/favorites.js',
  'pages/pocketmode.js',
  'pages/tcgsets.js',
  'pages/tcgsets/[setid].js',
  'pages/pocketmode/[pokemonid].js',
  'pages/pocketmode/expansions.js',
  'pages/pocketmode/deckbuilder.js',
  'pages/pokemon/regions.js',
  'pages/pokemon/games/[game].js',
  'pages/pokemon/starters/[region].js',
  'pages/pokemon/regions/[region].js',
  'pages/pokemon/regions/[region]-components.js',
  'pages/pokemon/abilities.js',
  'pages/pokemon/moves.js',
  'pages/pokemon/items.js',
  'pages/pokemon/starters.js',
  'pages/pokemon/games.js',
  'components/regions/RegionInfo.js',
  'components/regions/SpecialPokemonShowcase.js',
  'components/regions/RegionalVariants.js',
  'components/regions/EvilTeamShowcase.js',
  'components/regions/StarterPokemonShowcase.js',
  'components/regions/LegendaryShowcase.js',
  'components/regions/ProfessorShowcase.js',
  'components/regions/GymLeaderCarousel.js',
  'components/regions/StarterShowcaseEnhanced.js',
  'components/regions/EliteFourGallery.js',
  'components/regions/GameShowcase.js',
  'components/PocketDeckViewer.js',
  'components/pokemon/PokemonMovesTab.tsx',
  'components/pokemon/PokemonAbilitiesTab.tsx',
  'components/pokemon/PokemonOverviewTab.tsx',
  'components/pokemon/PokemonEvolutionTab.tsx',
  'components/pokemon/PokemonStatsTab.tsx',
  'components/pokemon/PokemonHero.tsx'
];

// Update patterns
const updates = [
  {
    // Standard animations import
    pattern: /from ['"]\.\.\/components\/ui\/animations['"]|from ['"]\.\.\/\.\.\/components\/ui\/animations['"]|from ['"]\.\.\/ui\/animations['"]|from ['"]\.\.\/\.\.\/ui\/animations['"]/g,
    replacement: (match) => {
      if (match.includes('../components/ui/animations')) {
        return match.replace('/ui/animations', '/ui/animations/animations');
      } else if (match.includes('../ui/animations')) {
        return match.replace('/ui/animations', '/ui/animations/animations');
      }
      return match;
    }
  }
];

const rootDir = path.join(__dirname, '..');

filesToUpdate.forEach(file => {
  const filePath = path.join(rootDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    updates.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${file}`);
    } else {
      console.log(`⏭️  Skipped: ${file} (no matching imports found)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\nAnimation import updates complete!');