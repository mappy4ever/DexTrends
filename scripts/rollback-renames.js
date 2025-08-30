#!/usr/bin/env node
// Rollback script for rename operations
const changes = [
  {
    "category": "components",
    "old": "components/ui/cards/GymLeaderCard.tsx",
    "new": "components/ui/cards/GymLeaderTile.tsx",
    "timestamp": "2025-08-30T20:31:16.985Z"
  },
  {
    "category": "components",
    "old": "components/ui/cards/CircularGymLeaderCard.tsx",
    "new": "components/ui/cards/GymLeaderAvatar.tsx",
    "timestamp": "2025-08-30T20:31:17.298Z"
  },
  {
    "category": "components",
    "old": "components/ui/cards/CircularPokemonCard.tsx",
    "new": "components/ui/cards/PokemonAvatar.tsx",
    "timestamp": "2025-08-30T20:31:17.536Z"
  },
  {
    "category": "components",
    "old": "components/ui/cards/EliteFourCard.tsx",
    "new": "components/ui/cards/EliteFourTile.tsx",
    "timestamp": "2025-08-30T20:31:17.760Z"
  },
  {
    "category": "components",
    "old": "components/ui/cards/ChampionCard.tsx",
    "new": "components/ui/cards/ChampionTile.tsx",
    "timestamp": "2025-08-30T20:31:17.990Z"
  },
  {
    "category": "components",
    "old": "components/ui/cards/PokemonCardItem.tsx",
    "new": "components/ui/cards/PokemonTile.tsx",
    "timestamp": "2025-08-30T20:31:18.212Z"
  },
  {
    "category": "pages",
    "old": "pages/tcgexpansions.tsx",
    "new": "pages/tcgexpansions.tsx",
    "timestamp": "2025-08-30T20:31:18.434Z"
  },
  {
    "category": "pages",
    "old": "pages/tcgexpansions",
    "new": "pages/tcgexpansions",
    "timestamp": "2025-08-30T20:31:18.678Z"
  }
];
const fs = require('fs');

console.log('Rolling back renames...');
changes.reverse().forEach(change => {
  try {
    fs.renameSync(change.new, change.old);
    console.log(`Rolled back: ${change.new} → ${change.old}`);
  } catch (error) {
    console.error(`Failed to rollback ${change.new}: ${error.message}`);
  }
});
console.log('Rollback complete');
