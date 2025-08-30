#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the files to update and their specific imports
const filesToUpdate = [
  // Pages directory - single level
  { file: 'pages/collections.js', oldImport: "import { useTheme } from '../context/themecontext';", newImport: "import { useTheme } from '../context/UnifiedAppContext';" },
  { file: 'pages/pokeid-enhanced-test.js', oldImport: 'import { useFavorites } from "../context/favoritescontext";', newImport: 'import { useFavorites } from "../context/UnifiedAppContext";' },
  { file: 'pages/pokeid-test.js', oldImport: 'import { useFavorites } from "../context/favoritescontext";', newImport: 'import { useFavorites } from "../context/UnifiedAppContext";' },
  { file: 'pages/fun.js', oldImport: "import { useTheme } from '../context/themecontext';", newImport: "import { useTheme } from '../context/UnifiedAppContext';" },
  { file: 'pages/trending.js', oldImport: "import { useTheme } from '../context/themecontext';", newImport: "import { useTheme } from '../context/UnifiedAppContext';" },
  
  // Pages directory - nested
  { file: 'pages/pokedex/[pokeid].js', oldImport: 'import { useFavorites } from "../../context/favoritescontext";', newImport: 'import { useFavorites } from "../../context/UnifiedAppContext";' },
  { file: 'pages/tcgexpansions/[setid].js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/tcgexpansions/[setid].js', oldImport: 'import { useFavorites } from "../../context/favoritescontext";', newImport: 'import { useFavorites } from "../../context/UnifiedAppContext";' },
  { file: 'pages/tcgexpansions/[setid].js', oldImport: 'import { useViewSettings } from "../../context/viewsettingscontext";', newImport: 'import { useViewSettings } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pocketmode/expansions.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/cards/[cardId].js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/cards/[cardId].js', oldImport: 'import { useFavorites } from "../../context/favoritescontext";', newImport: 'import { useFavorites } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pokemon/games.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pokemon/index.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pokemon/regions.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pokemon/starters.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pokemon/items.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pokemon/games-old.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pokemon/moves.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  { file: 'pages/pokemon/abilities.js', oldImport: 'import { useTheme } from "../../context/themecontext";', newImport: 'import { useTheme } from "../../context/UnifiedAppContext";' },
  
  // _app.minimal-safe.js - special case with multiple imports
  { file: 'pages/_app.minimal-safe.js', oldImport: "import { ThemeProvider } from '../context/themecontext';", newImport: "import { useTheme } from '../context/UnifiedAppContext';" },
  { file: 'pages/_app.minimal-safe.js', oldImport: "import { FavoritesProvider } from '../context/favoritescontext';", newImport: "import { useFavorites } from '../context/UnifiedAppContext';" },
  { file: 'pages/_app.minimal-safe.js', oldImport: "import { ViewSettingsProvider } from '../context/viewsettingscontext';", newImport: "import { useViewSettings } from '../context/UnifiedAppContext';" },
  { file: 'pages/_app.minimal-safe.js', oldImport: "import { ModalProvider } from '../context/modalcontext';", newImport: "import { useModal } from '../context/UnifiedAppContext';" },
  { file: 'pages/_app.minimal-safe.js', oldImport: "import { SortingProvider } from '../context/sortingcontext';", newImport: "import { useSorting } from '../context/UnifiedAppContext';" },
  
  // Components directory
  { file: 'components/GlobalModal.js', oldImport: "import { useModal } from '../context/modalcontext';", newImport: "import { useModal } from '../context/UnifiedAppContext';" },
  { file: 'components/Navbar.js', oldImport: 'import { useTheme } from "../context/themecontext";', newImport: 'import { useTheme } from "../context/UnifiedAppContext";' },
  { file: 'components/Navbar.js', oldImport: 'import { useFavorites } from "../context/favoritescontext";', newImport: 'import { useFavorites } from "../context/UnifiedAppContext";' },
  { file: 'components/TrendingCards.js', oldImport: "import { useTheme } from '../context/ThemeContext';", newImport: "import { useTheme } from '../context/UnifiedAppContext';" },
  
  // Components/qol directory
  { file: 'components/qol/KeyboardShortcuts.js', oldImport: "import { useTheme } from '../../context/themecontext';", newImport: "import { useTheme } from '../../context/UnifiedAppContext';" },
  { file: 'components/qol/KeyboardShortcuts.js', oldImport: "import { useFavorites } from '../../context/favoritescontext';", newImport: "import { useFavorites } from '../../context/UnifiedAppContext';" },
  
  // Components/ui directory
  { file: 'components/ui/CollectionDashboard.js', oldImport: "import { useFavorites } from '../../context/favoritescontext';", newImport: "import { useFavorites } from '../../context/UnifiedAppContext';" },
  { file: 'components/ui/EnhancedCardModal.js', oldImport: "import { useFavorites } from '../../context/favoritescontext';", newImport: "import { useFavorites } from '../../context/UnifiedAppContext';" },
  { file: 'components/ui/AchievementSystem.tsx', oldImport: "import { useFavorites } from '../../context/favoritescontext';", newImport: "import { useFavorites } from '../../context/UnifiedAppContext';" },
  { file: 'components/ui/RegionHeader.js', oldImport: "import { useTheme } from '../../context/themecontext';", newImport: "import { useTheme } from '../../context/UnifiedAppContext';" },
  { file: 'components/ui/RegionSelector.js', oldImport: "import { useTheme } from '../../context/themecontext';", newImport: "import { useTheme } from '../../context/UnifiedAppContext';" },
  { file: 'components/ui/GymLeaderShowcase.js', oldImport: "import { useTheme } from '../../context/themecontext';", newImport: "import { useTheme } from '../../context/UnifiedAppContext';" },
  { file: 'components/ui/EnhancedNavigation.js', oldImport: "import { useFavorites } from '../../context/favoritescontext';", newImport: "import { useFavorites } from '../../context/UnifiedAppContext';" },
  { file: 'components/ui/EnhancedCardInteractions.js', oldImport: "import { useFavorites } from '../../context/favoritescontext';", newImport: "import { useFavorites } from '../../context/UnifiedAppContext';" },
  { file: 'components/ui/PriceHistoryChart.js', oldImport: "import { useTheme } from '../../context/themecontext';", newImport: "import { useTheme } from '../../context/UnifiedAppContext';" },
];

// Function to update a single file
function updateFile(fileInfo) {
  const filePath = path.join(process.cwd(), fileInfo.file);
  
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the import
    if (content.includes(fileInfo.oldImport)) {
      content = content.replace(fileInfo.oldImport, fileInfo.newImport);
      
      // Write the file back
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${fileInfo.file}`);
      return true;
    } else {
      console.log(`⚠️  Import not found in: ${fileInfo.file}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${fileInfo.file}: ${error.message}`);
    return false;
  }
}

// Main execution
console.log('Starting context import updates...\n');

let successCount = 0;
let failCount = 0;

filesToUpdate.forEach(fileInfo => {
  if (updateFile(fileInfo)) {
    successCount++;
  } else {
    failCount++;
  }
});

console.log(`\n✅ Successfully updated: ${successCount} imports`);
console.log(`❌ Failed or not found: ${failCount} imports`);
console.log('\nUpdate complete!');