const fs = require('fs');
const path = require('path');

// Comprehensive list of all Gym Leaders and equivalents by region
const ALL_GYM_LEADERS = {
  // Kanto (Gen 1 - Red/Blue/Yellow, FireRed/LeafGreen, Let's Go)
  kanto: [
    'brock',      // Pewter City - Rock
    'misty',      // Cerulean City - Water
    'lt-surge',   // Vermilion City - Electric
    'erika',      // Celadon City - Grass
    'koga',       // Fuchsia City - Poison (becomes Elite Four)
    'janine',     // Fuchsia City - Poison (replaces Koga in Gen 2/4)
    'sabrina',    // Saffron City - Psychic
    'blaine',     // Cinnabar Island - Fire
    'giovanni',   // Viridian City - Ground
    'blue'        // Viridian City - Various (in Gen 2/4)
  ],
  
  // Johto (Gen 2 - Gold/Silver/Crystal, HeartGold/SoulSilver)
  johto: [
    'falkner',    // Violet City - Flying
    'bugsy',      // Azalea Town - Bug
    'whitney',    // Goldenrod City - Normal
    'morty',      // Ecruteak City - Ghost
    'chuck',      // Cianwood City - Fighting
    'jasmine',    // Olivine City - Steel
    'pryce',      // Mahogany Town - Ice
    'clair'       // Blackthorn City - Dragon
  ],
  
  // Hoenn (Gen 3 - Ruby/Sapphire/Emerald, Omega Ruby/Alpha Sapphire)
  hoenn: [
    'roxanne',     // Rustboro City - Rock
    'brawly',      // Dewford Town - Fighting
    'wattson',     // Mauville City - Electric
    'flannery',    // Lavaridge Town - Fire
    'norman',      // Petalburg City - Normal
    'winona',      // Fortree City - Flying
    'tate-and-liza', // Mossdeep City - Psychic (double battle)
    'tate',        // Part of Tate & Liza
    'liza',        // Part of Tate & Liza
    'wallace',     // Sootopolis City - Water (becomes Champion)
    'juan'         // Sootopolis City - Water (replaces Wallace in Emerald)
  ],
  
  // Sinnoh (Gen 4 - Diamond/Pearl/Platinum, Brilliant Diamond/Shining Pearl)
  sinnoh: [
    'roark',       // Oreburgh City - Rock
    'gardenia',    // Eterna City - Grass
    'maylene',     // Veilstone City - Fighting
    'crasher-wake', // Pastoria City - Water
    'fantina',     // Hearthome City - Ghost
    'byron',       // Canalave City - Steel
    'candice',     // Snowpoint City - Ice
    'volkner'      // Sunyshore City - Electric
  ],
  
  // Unova (Gen 5 - Black/White, Black 2/White 2)
  unova: [
    // Black/White
    'cilan',       // Striaton City - Grass (one of triplets)
    'chili',       // Striaton City - Fire (one of triplets)
    'cress',       // Striaton City - Water (one of triplets)
    'lenora',      // Nacrene City - Normal
    'burgh',       // Castelia City - Bug
    'elesa',       // Nimbasa City - Electric
    'clay',        // Driftveil City - Ground
    'skyla',       // Mistralton City - Flying
    'brycen',      // Icirrus City - Ice
    'drayden',     // Opelucid City - Dragon
    'iris',        // Opelucid City - Dragon (White version)
    
    // Black 2/White 2 additions
    'cheren',      // Aspertia City - Normal
    'roxie',       // Virbank City - Poison
    'marlon'       // Humilau City - Water
  ],
  
  // Kalos (Gen 6 - X/Y)
  kalos: [
    'viola',       // Santalune City - Bug
    'grant',       // Cyllage City - Rock
    'korrina',     // Shalour City - Fighting
    'ramos',       // Coumarine City - Grass
    'clemont',     // Lumiose City - Electric
    'valerie',     // Laverre City - Fairy
    'olympia',     // Anistar City - Psychic
    'wulfric'      // Snowbelle City - Ice
  ],
  
  // Alola (Gen 7 - Sun/Moon, Ultra Sun/Ultra Moon)
  // Note: Uses Trial Captains and Kahunas instead of Gym Leaders
  alola: [
    // Trial Captains
    'ilima',       // Normal-type Trial Captain
    'lana',        // Water-type Trial Captain
    'kiawe',       // Fire-type Trial Captain
    'mallow',      // Grass-type Trial Captain
    'sophocles',   // Electric-type Trial Captain
    'acerola',     // Ghost-type Trial Captain (also Elite Four)
    'mina',        // Fairy-type Trial Captain
    
    // Island Kahunas
    'hala',        // Melemele Island - Fighting
    'olivia',      // Akala Island - Rock
    'nanu',        // Ula'ula Island - Dark
    'hapu'         // Poni Island - Ground
  ],
  
  // Galar (Gen 8 - Sword/Shield)
  galar: [
    'milo',        // Turffield - Grass
    'nessa',       // Hulbury - Water
    'kabu',        // Motostoke - Fire
    'bea',         // Stow-on-Side - Fighting (Sword)
    'allister',    // Stow-on-Side - Ghost (Shield)
    'opal',        // Ballonlea - Fairy
    'bede',        // Ballonlea - Fairy (post-game)
    'gordie',      // Circhester - Rock (Sword)
    'melony',      // Circhester - Ice (Shield)
    'piers',       // Spikemuth - Dark
    'raihan',      // Hammerlocke - Dragon
    
    // Isle of Armor
    'klara',       // Poison (Sword)
    'avery'        // Psychic (Shield)
  ],
  
  // Paldea (Gen 9 - Scarlet/Violet)
  paldea: [
    // Victory Road Gym Leaders
    'katy',        // Cortondo - Bug
    'brassius',    // Artazon - Grass
    'iono',        // Levincia - Electric
    'kofu',        // Cascarrafa - Water
    'larry',       // Medali - Normal (also Elite Four)
    'ryme',        // Montenevera - Ghost
    'tulip',       // Alfornada - Psychic
    'grusha',      // Glaseado - Ice
    
    // Note: Larry also appears as Elite Four member
  ]
};

// Get current gym leaders from folder
function getCurrentGymLeaders() {
  const GYM_LEADERS_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'gym-leaders');
  const files = fs.readdirSync(GYM_LEADERS_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  // Extract unique gym leader names
  const gymLeaders = new Set();
  files.forEach(file => {
    const name = file.replace(/\.(png|jpg|jpeg)$/i, '')
                     .replace(/-\d+$/, '')
                     .replace(/-alt\d*$/, '')
                     .toLowerCase();
    gymLeaders.add(name);
  });
  
  return gymLeaders;
}

// Analyze missing gym leaders
function analyzeMissing() {
  const currentGymLeaders = getCurrentGymLeaders();
  console.log(`Current gym leaders in folder: ${currentGymLeaders.size}\n`);
  
  const missing = {
    kanto: [],
    johto: [],
    hoenn: [],
    sinnoh: [],
    unova: [],
    kalos: [],
    alola: [],
    galar: [],
    paldea: []
  };
  
  const found = {
    kanto: [],
    johto: [],
    hoenn: [],
    sinnoh: [],
    unova: [],
    kalos: [],
    alola: [],
    galar: [],
    paldea: []
  };
  
  // Check each region
  Object.entries(ALL_GYM_LEADERS).forEach(([region, leaders]) => {
    leaders.forEach(leader => {
      // Handle special cases
      if (leader === 'crasher-wake' && currentGymLeaders.has('crasher')) {
        found[region].push(leader);
      } else if (leader === 'tate-and-liza' && (currentGymLeaders.has('tate') || currentGymLeaders.has('liza'))) {
        found[region].push(leader);
      } else if (currentGymLeaders.has(leader)) {
        found[region].push(leader);
      } else {
        missing[region].push(leader);
      }
    });
  });
  
  // Print results
  console.log('=== MISSING GYM LEADERS BY REGION ===\n');
  
  Object.entries(missing).forEach(([region, leaders]) => {
    if (leaders.length > 0) {
      console.log(`${region.toUpperCase()} (Missing ${leaders.length}/${ALL_GYM_LEADERS[region].length}):`);
      leaders.forEach(leader => {
        console.log(`  - ${leader}`);
      });
      console.log();
    }
  });
  
  console.log('=== FOUND GYM LEADERS BY REGION ===\n');
  
  Object.entries(found).forEach(([region, leaders]) => {
    console.log(`${region.toUpperCase()} (Found ${leaders.length}/${ALL_GYM_LEADERS[region].length}):`);
    if (leaders.length === ALL_GYM_LEADERS[region].length) {
      console.log('  ✓ All gym leaders present!');
    } else {
      console.log(`  Found: ${leaders.join(', ')}`);
    }
    console.log();
  });
  
  // Summary statistics
  const totalExpected = Object.values(ALL_GYM_LEADERS).reduce((sum, leaders) => sum + leaders.length, 0);
  const totalFound = Object.values(found).reduce((sum, leaders) => sum + leaders.length, 0);
  const totalMissing = Object.values(missing).reduce((sum, leaders) => sum + leaders.length, 0);
  
  console.log('=== SUMMARY ===');
  console.log(`Total expected gym leaders/equivalents: ${totalExpected}`);
  console.log(`Total found: ${totalFound}`);
  console.log(`Total missing: ${totalMissing}`);
  console.log(`Coverage: ${((totalFound / totalExpected) * 100).toFixed(1)}%`);
  
  return { missing, found, currentGymLeaders };
}

// Run analysis
analyzeMissing();