const fs = require('fs');
const path = require('path');

// Comprehensive list of all gym badges by region
const ALL_GYM_BADGES = {
  // Kanto (8 badges)
  kanto: [
    { name: 'boulder-badge', gym: 'Pewter City', leader: 'Brock', type: 'Rock' },
    { name: 'cascade-badge', gym: 'Cerulean City', leader: 'Misty', type: 'Water' },
    { name: 'thunder-badge', gym: 'Vermilion City', leader: 'Lt. Surge', type: 'Electric' },
    { name: 'rainbow-badge', gym: 'Celadon City', leader: 'Erika', type: 'Grass' },
    { name: 'soul-badge', gym: 'Fuchsia City', leader: 'Koga/Janine', type: 'Poison' },
    { name: 'marsh-badge', gym: 'Saffron City', leader: 'Sabrina', type: 'Psychic' },
    { name: 'volcano-badge', gym: 'Cinnabar Island', leader: 'Blaine', type: 'Fire' },
    { name: 'earth-badge', gym: 'Viridian City', leader: 'Giovanni/Blue', type: 'Ground' }
  ],
  
  // Johto (8 badges)
  johto: [
    { name: 'zephyr-badge', gym: 'Violet City', leader: 'Falkner', type: 'Flying' },
    { name: 'hive-badge', gym: 'Azalea Town', leader: 'Bugsy', type: 'Bug' },
    { name: 'plain-badge', gym: 'Goldenrod City', leader: 'Whitney', type: 'Normal' },
    { name: 'fog-badge', gym: 'Ecruteak City', leader: 'Morty', type: 'Ghost' },
    { name: 'storm-badge', gym: 'Cianwood City', leader: 'Chuck', type: 'Fighting' },
    { name: 'mineral-badge', gym: 'Olivine City', leader: 'Jasmine', type: 'Steel' },
    { name: 'glacier-badge', gym: 'Mahogany Town', leader: 'Pryce', type: 'Ice' },
    { name: 'rising-badge', gym: 'Blackthorn City', leader: 'Clair', type: 'Dragon' }
  ],
  
  // Hoenn (8 badges)
  hoenn: [
    { name: 'stone-badge', gym: 'Rustboro City', leader: 'Roxanne', type: 'Rock' },
    { name: 'knuckle-badge', gym: 'Dewford Town', leader: 'Brawly', type: 'Fighting' },
    { name: 'dynamo-badge', gym: 'Mauville City', leader: 'Wattson', type: 'Electric' },
    { name: 'heat-badge', gym: 'Lavaridge Town', leader: 'Flannery', type: 'Fire' },
    { name: 'balance-badge', gym: 'Petalburg City', leader: 'Norman', type: 'Normal' },
    { name: 'feather-badge', gym: 'Fortree City', leader: 'Winona', type: 'Flying' },
    { name: 'mind-badge', gym: 'Mossdeep City', leader: 'Tate & Liza', type: 'Psychic' },
    { name: 'rain-badge', gym: 'Sootopolis City', leader: 'Wallace/Juan', type: 'Water' }
  ],
  
  // Sinnoh (8 badges)
  sinnoh: [
    { name: 'coal-badge', gym: 'Oreburgh City', leader: 'Roark', type: 'Rock' },
    { name: 'forest-badge', gym: 'Eterna City', leader: 'Gardenia', type: 'Grass' },
    { name: 'cobble-badge', gym: 'Veilstone City', leader: 'Maylene', type: 'Fighting' },
    { name: 'fen-badge', gym: 'Pastoria City', leader: 'Crasher Wake', type: 'Water' },
    { name: 'relic-badge', gym: 'Hearthome City', leader: 'Fantina', type: 'Ghost' },
    { name: 'mine-badge', gym: 'Canalave City', leader: 'Byron', type: 'Steel' },
    { name: 'icicle-badge', gym: 'Snowpoint City', leader: 'Candice', type: 'Ice' },
    { name: 'beacon-badge', gym: 'Sunyshore City', leader: 'Volkner', type: 'Electric' }
  ],
  
  // Unova (8 badges)
  unova: [
    { name: 'trio-badge', gym: 'Striaton City', leader: 'Cilan/Chili/Cress', type: 'Grass/Fire/Water' },
    { name: 'basic-badge', gym: 'Nacrene City', leader: 'Lenora', type: 'Normal' },
    { name: 'insect-badge', gym: 'Castelia City', leader: 'Burgh', type: 'Bug' },
    { name: 'bolt-badge', gym: 'Nimbasa City', leader: 'Elesa', type: 'Electric' },
    { name: 'quake-badge', gym: 'Driftveil City', leader: 'Clay', type: 'Ground' },
    { name: 'jet-badge', gym: 'Mistralton City', leader: 'Skyla', type: 'Flying' },
    { name: 'freeze-badge', gym: 'Icirrus City', leader: 'Brycen', type: 'Ice' },
    { name: 'legend-badge', gym: 'Opelucid City', leader: 'Drayden/Iris', type: 'Dragon' },
    // Black 2/White 2 additions
    { name: 'toxic-badge', gym: 'Virbank City', leader: 'Roxie', type: 'Poison' },
    { name: 'wave-badge', gym: 'Humilau City', leader: 'Marlon', type: 'Water' }
  ],
  
  // Kalos (8 badges)
  kalos: [
    { name: 'bug-badge', gym: 'Santalune City', leader: 'Viola', type: 'Bug' },
    { name: 'cliff-badge', gym: 'Cyllage City', leader: 'Grant', type: 'Rock' },
    { name: 'rumble-badge', gym: 'Shalour City', leader: 'Korrina', type: 'Fighting' },
    { name: 'plant-badge', gym: 'Coumarine City', leader: 'Ramos', type: 'Grass' },
    { name: 'voltage-badge', gym: 'Lumiose City', leader: 'Clemont', type: 'Electric' },
    { name: 'fairy-badge', gym: 'Laverre City', leader: 'Valerie', type: 'Fairy' },
    { name: 'psychic-badge', gym: 'Anistar City', leader: 'Olympia', type: 'Psychic' },
    { name: 'iceberg-badge', gym: 'Snowbelle City', leader: 'Wulfric', type: 'Ice' }
  ],
  
  // Galar (8 badges)
  galar: [
    { name: 'grass-badge', gym: 'Turffield', leader: 'Milo', type: 'Grass' },
    { name: 'water-badge', gym: 'Hulbury', leader: 'Nessa', type: 'Water' },
    { name: 'fire-badge', gym: 'Motostoke', leader: 'Kabu', type: 'Fire' },
    { name: 'fighting-badge', gym: 'Stow-on-Side', leader: 'Bea', type: 'Fighting' },
    { name: 'ghost-badge', gym: 'Stow-on-Side', leader: 'Allister', type: 'Ghost' },
    { name: 'fairy-badge', gym: 'Ballonlea', leader: 'Opal', type: 'Fairy', altName: 'galarfairy-badge' },
    { name: 'rock-badge', gym: 'Circhester', leader: 'Gordie', type: 'Rock' },
    { name: 'ice-badge', gym: 'Circhester', leader: 'Melony', type: 'Ice' },
    { name: 'dark-badge', gym: 'Spikemuth', leader: 'Piers', type: 'Dark' },
    { name: 'dragon-badge', gym: 'Hammerlocke', leader: 'Raihan', type: 'Dragon' }
  ],
  
  // Paldea (8 badges + Path of Legends + Starfall Street)
  paldea: {
    victoryRoad: [
      { name: 'bug-badge', gym: 'Cortondo', leader: 'Katy', type: 'Bug', altName: 'svbadge-victoryroad-bug' },
      { name: 'grass-badge', gym: 'Artazon', leader: 'Brassius', type: 'Grass', altName: 'svbadge-victoryroad-grass' },
      { name: 'electric-badge', gym: 'Levincia', leader: 'Iono', type: 'Electric', altName: 'svbadge-victoryroad-electric' },
      { name: 'water-badge', gym: 'Cascarrafa', leader: 'Kofu', type: 'Water', altName: 'svbadge-victoryroad-water' },
      { name: 'normal-badge', gym: 'Medali', leader: 'Larry', type: 'Normal', altName: 'svbadge-victoryroad-normal' },
      { name: 'ghost-badge', gym: 'Montenevera', leader: 'Ryme', type: 'Ghost', altName: 'svbadge-victoryroad-ghost' },
      { name: 'psychic-badge', gym: 'Alfornada', leader: 'Tulip', type: 'Psychic', altName: 'svbadge-victoryroad-psychic' },
      { name: 'ice-badge', gym: 'Glaseado', leader: 'Grusha', type: 'Ice', altName: 'svbadge-victoryroad-ice' }
    ],
    pathOfLegends: [
      { name: 'rock-titan', altName: 'svbadge-pathoflegends-rock' },
      { name: 'flying-titan', altName: 'svbadge-pathoflegends-flying' },
      { name: 'steel-titan', altName: 'svbadge-pathoflegends-steel' },
      { name: 'dragon-titan', altName: 'svbadge-pathoflegends-dragon' },
      { name: 'ground-titan', altName: 'svbadge-pathoflegends-ground' }
    ],
    starfallStreet: [
      { name: 'dark-crew', altName: 'svbadge-starfallstreet-dark' },
      { name: 'fire-crew', altName: 'svbadge-starfallstreet-fire' },
      { name: 'poison-crew', altName: 'svbadge-starfallstreet-poison' },
      { name: 'fairy-crew', altName: 'svbadge-starfallstreet-fairy' },
      { name: 'fighting-crew', altName: 'svbadge-starfallstreet-fighting' }
    ]
  },
  
  // Orange Islands (Anime only - 4 badges)
  orangeIslands: [
    { name: 'coral-eye-badge', gym: 'Mikan Island', leader: 'Cissy', altName: 'cissy-badge' },
    { name: 'sea-ruby-badge', gym: 'Navel Island', leader: 'Danny' },
    { name: 'spike-shell-badge', gym: 'Trovita Island', leader: 'Rudy' },
    { name: 'jade-star-badge', gym: 'Kumquat Island', leader: 'Luana' }
  ]
};

// Get current badge files
function getCurrentBadges() {
  const BADGES_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'badges');
  const files = fs.readdirSync(BADGES_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  // Extract badge names from filenames
  const badges = new Set();
  files.forEach(file => {
    const name = file.replace(/\.(png|jpg|jpeg)$/i, '').toLowerCase();
    badges.add(name);
  });
  
  return { files, badges };
}

// Analyze badges
function analyzeBadges() {
  const { files, badges } = getCurrentBadges();
  
  console.log('=== BADGE COLLECTION ANALYSIS ===\n');
  console.log(`Total badge files: ${files.length}\n`);
  
  // Check each region
  const results = {
    found: {},
    missing: {},
    special: []
  };
  
  // Check main regions
  Object.entries(ALL_GYM_BADGES).forEach(([region, regionBadges]) => {
    if (region === 'paldea') {
      // Handle Paldea separately due to its structure
      results.found[region] = { victoryRoad: [], pathOfLegends: [], starfallStreet: [] };
      results.missing[region] = { victoryRoad: [], pathOfLegends: [], starfallStreet: [] };
      
      Object.entries(regionBadges).forEach(([path, pathBadges]) => {
        pathBadges.forEach(badge => {
          const found = badges.has(badge.name) || 
                       badges.has(badge.altName) || 
                       badges.has(`badges-of-paldea-${badge.name}`);
          
          if (found) {
            results.found[region][path].push(badge);
          } else {
            results.missing[region][path].push(badge);
          }
        });
      });
    } else {
      results.found[region] = [];
      results.missing[region] = [];
      
      regionBadges.forEach(badge => {
        const found = badges.has(badge.name) || badges.has(badge.altName);
        
        if (found) {
          results.found[region].push(badge);
        } else {
          results.missing[region].push(badge);
        }
      });
    }
  });
  
  // Print results by region
  console.log('=== BADGES BY REGION ===\n');
  
  Object.entries(results.found).forEach(([region, foundBadges]) => {
    console.log(`${region.toUpperCase()}:`);
    
    if (region === 'paldea') {
      const vr = foundBadges.victoryRoad.length;
      const pol = foundBadges.pathOfLegends.length;
      const sf = foundBadges.starfallStreet.length;
      console.log(`  Victory Road: ${vr}/8 badges`);
      console.log(`  Path of Legends: ${pol}/5 badges`);
      console.log(`  Starfall Street: ${sf}/5 badges`);
      
      if (results.missing[region].victoryRoad.length > 0) {
        console.log(`  Missing Victory Road: ${results.missing[region].victoryRoad.map(b => b.name).join(', ')}`);
      }
    } else {
      const total = ALL_GYM_BADGES[region].length;
      const found = foundBadges.length;
      console.log(`  Found: ${found}/${total} badges`);
      
      if (results.missing[region].length > 0) {
        console.log(`  Missing: ${results.missing[region].map(b => b.name).join(', ')}`);
      }
    }
    console.log();
  });
  
  // Check for special/unknown badges
  console.log('=== SPECIAL/UNIDENTIFIED BADGES ===\n');
  const knownBadges = new Set();
  
  Object.values(ALL_GYM_BADGES).forEach(regionBadges => {
    if (Array.isArray(regionBadges)) {
      regionBadges.forEach(badge => {
        knownBadges.add(badge.name);
        if (badge.altName) knownBadges.add(badge.altName);
      });
    } else {
      // Paldea
      Object.values(regionBadges).forEach(pathBadges => {
        pathBadges.forEach(badge => {
          knownBadges.add(badge.name);
          if (badge.altName) knownBadges.add(badge.altName);
        });
      });
    }
  });
  
  const specialBadges = [];
  badges.forEach(badge => {
    if (!knownBadges.has(badge) && 
        !badge.includes('tcg-league') && 
        !badge.includes('elementalbadge') &&
        !badge.includes('ribbonbadge') &&
        !badge.includes('snowleafbadge') &&
        !badge.includes('moonsunbadge') &&
        !badge.includes('cameron') &&
        !badge.includes('gary') &&
        !badge.includes('red') &&
        !badge.includes('sakura') &&
        !badge.includes('trip') &&
        !badge.includes('sawyer') &&
        !badge.includes('nando') &&
        !badge.includes('early') &&
        !badge.includes('svbadge-') &&
        !badge.includes('badges-of-paldea') &&
        !badge.includes('masters-') &&
        !badge.includes('stadium') &&
        !badge.includes('puzzle-league') &&
        !badge.includes('black-gym') &&
        !badge.includes('otoshi') &&
        !badge.includes('the-final-badge') &&
        !badge.includes('unknown') &&
        !badge.includes('many-') &&
        !badge.includes('dreambadges') &&
        !badge.includes('katharine') &&
        !badge.includes('morrison') &&
        !badge.includes('pok-mon-puzzle-league') &&
        !badge.includes('silver-wing')) {
      specialBadges.push(badge);
    }
  });
  
  if (specialBadges.length > 0) {
    console.log('Potential unidentified official badges:');
    specialBadges.forEach(badge => console.log(`  - ${badge}`));
  } else {
    console.log('No unidentified badges found.');
  }
  
  // Summary
  console.log('\n=== SUMMARY ===');
  let totalExpected = 0;
  let totalFound = 0;
  
  Object.entries(ALL_GYM_BADGES).forEach(([region, badges]) => {
    if (region === 'paldea') {
      totalExpected += 8 + 5 + 5; // Victory Road + Path + Starfall
      totalFound += results.found[region].victoryRoad.length + 
                   results.found[region].pathOfLegends.length + 
                   results.found[region].starfallStreet.length;
    } else {
      totalExpected += badges.length;
      totalFound += results.found[region].length;
    }
  });
  
  console.log(`Total official gym badges expected: ${totalExpected}`);
  console.log(`Total found: ${totalFound}`);
  console.log(`Coverage: ${((totalFound / totalExpected) * 100).toFixed(1)}%`);
  console.log(`\nAdditional badges in collection: ${files.length - totalFound} (TCG, anime-exclusive, etc.)`);
}

// Run analysis
analyzeBadges();