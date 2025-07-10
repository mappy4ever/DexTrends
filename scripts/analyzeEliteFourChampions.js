const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Comprehensive list of all Elite Four members and Champions by region
const ALL_ELITE_FOUR_CHAMPIONS = {
  // Kanto Elite Four & Champions
  kanto: {
    eliteFour: ['lorelei', 'bruno', 'agatha', 'lance'],
    champions: ['blue', 'red', 'trace'] // Trace in Let's Go
  },
  
  // Johto Elite Four & Champions
  johto: {
    eliteFour: ['will', 'koga', 'bruno', 'karen'],
    champions: ['lance']
  },
  
  // Hoenn Elite Four & Champions
  hoenn: {
    eliteFour: ['sidney', 'phoebe', 'glacia', 'drake'],
    champions: ['steven', 'wallace'] // Wallace becomes champion in Emerald
  },
  
  // Sinnoh Elite Four & Champions
  sinnoh: {
    eliteFour: ['aaron', 'bertha', 'flint', 'lucian'],
    champions: ['cynthia']
  },
  
  // Unova Elite Four & Champions
  unova: {
    eliteFour: ['shauntal', 'grimsley', 'caitlin', 'marshal'],
    champions: ['alder', 'iris'] // Iris becomes champion in B2W2
  },
  
  // Kalos Elite Four & Champions
  kalos: {
    eliteFour: ['malva', 'siebold', 'wikstrom', 'drasna'],
    champions: ['diantha']
  },
  
  // Alola Elite Four & Champions (Trial Captains/Kahunas can be E4)
  alola: {
    eliteFour: ['molayne', 'olivia', 'acerola', 'kahili', 'hala'], // Varies by game
    champions: ['kukui', 'hau'] // Player becomes champion, these are final battles
  },
  
  // Galar (Tournament format, no traditional E4)
  galar: {
    eliteFour: [], // No traditional Elite Four
    champions: ['leon', 'mustard', 'peony'] // Mustard and Peony are former champions
  },
  
  // Paldea Elite Four & Champions
  paldea: {
    eliteFour: ['rika', 'poppy', 'larry', 'hassel'],
    champions: ['geeta', 'nemona', 'kieran'] // Kieran in DLC
  }
};

// Get current files from folders
function getCurrentFiles() {
  const ELITE_FOUR_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'elite-four');
  const CHAMPIONS_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'champions');
  
  const eliteFourFiles = fs.readdirSync(ELITE_FOUR_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  const championsFiles = fs.readdirSync(CHAMPIONS_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  return { eliteFourFiles, championsFiles };
}

// Extract character name from filename
function getCharacterName(filename) {
  const base = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  // Handle special cases like "Sun_Moon_Blue"
  const cleanName = base.replace(/^(Sun_Moon_|FireRed_LeafGreen_|HeartGold_SoulSilver_|Omega_Ruby_Alpha_Sapphire_|Scarlet_Violet_|Sword_Shield_|XY_)/, '');
  return cleanName.replace(/-\d+$/, '').replace(/-alt\d*$/, '').toLowerCase();
}

// Get file hash for comparison
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

// Analyze Elite Four and Champions
function analyzeEliteFourChampions() {
  const { eliteFourFiles, championsFiles } = getCurrentFiles();
  
  console.log('=== FILE COUNTS ===');
  console.log(`Elite Four folder: ${eliteFourFiles.length} files`);
  console.log(`Champions folder: ${championsFiles.length} files\n`);
  
  // Extract unique characters
  const eliteFourCharacters = new Set();
  const championsCharacters = new Set();
  
  eliteFourFiles.forEach(file => {
    eliteFourCharacters.add(getCharacterName(file));
  });
  
  championsFiles.forEach(file => {
    championsCharacters.add(getCharacterName(file));
  });
  
  console.log('=== UNIQUE CHARACTERS ===');
  console.log(`Elite Four: ${eliteFourCharacters.size} unique characters`);
  console.log(`Champions: ${championsCharacters.size} unique characters\n`);
  
  // Check for characters in wrong folders
  console.log('=== CHECKING FOR MISPLACED CHARACTERS ===\n');
  
  // Elite Four members that might be in champions folder
  const allEliteFour = new Set();
  Object.values(ALL_ELITE_FOUR_CHAMPIONS).forEach(region => {
    region.eliteFour.forEach(member => allEliteFour.add(member));
  });
  
  // Champions that might be in elite four folder
  const allChampions = new Set();
  Object.values(ALL_ELITE_FOUR_CHAMPIONS).forEach(region => {
    region.champions.forEach(champion => allChampions.add(champion));
  });
  
  // Check for champions in elite four folder
  console.log('Champions found in Elite Four folder:');
  let misplacedCount = 0;
  eliteFourCharacters.forEach(char => {
    if (allChampions.has(char)) {
      console.log(`  - ${char}`);
      misplacedCount++;
    }
  });
  if (misplacedCount === 0) console.log('  None');
  
  console.log('\nElite Four found in Champions folder:');
  misplacedCount = 0;
  championsCharacters.forEach(char => {
    if (allEliteFour.has(char)) {
      console.log(`  - ${char}`);
      misplacedCount++;
    }
  });
  if (misplacedCount === 0) console.log('  None');
  
  // Check for duplicates between folders
  console.log('\n=== CHECKING FOR DUPLICATES BETWEEN FOLDERS ===\n');
  const ELITE_FOUR_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'elite-four');
  const CHAMPIONS_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'champions');
  
  const eliteFourHashes = new Map();
  eliteFourFiles.forEach(file => {
    const hash = getFileHash(path.join(ELITE_FOUR_PATH, file));
    if (!eliteFourHashes.has(hash)) {
      eliteFourHashes.set(hash, []);
    }
    eliteFourHashes.get(hash).push({ file, folder: 'elite-four' });
  });
  
  const duplicates = [];
  championsFiles.forEach(file => {
    const hash = getFileHash(path.join(CHAMPIONS_PATH, file));
    if (eliteFourHashes.has(hash)) {
      duplicates.push({
        champions: file,
        eliteFour: eliteFourHashes.get(hash)[0].file,
        hash
      });
    }
  });
  
  if (duplicates.length > 0) {
    console.log('Exact duplicate files found:');
    duplicates.forEach(dup => {
      console.log(`  ${dup.eliteFour} (elite-four) <-> ${dup.champions} (champions)`);
    });
  } else {
    console.log('No exact duplicates found between folders.');
  }
  
  // Check for missing characters
  console.log('\n=== MISSING CHARACTERS BY REGION ===\n');
  
  const currentCharacters = new Set([...eliteFourCharacters, ...championsCharacters]);
  
  Object.entries(ALL_ELITE_FOUR_CHAMPIONS).forEach(([region, { eliteFour, champions }]) => {
    const missingE4 = eliteFour.filter(member => !currentCharacters.has(member));
    const missingChamps = champions.filter(champ => !currentCharacters.has(champ));
    
    if (missingE4.length > 0 || missingChamps.length > 0) {
      console.log(`${region.toUpperCase()}:`);
      if (missingE4.length > 0) {
        console.log(`  Missing Elite Four: ${missingE4.join(', ')}`);
      }
      if (missingChamps.length > 0) {
        console.log(`  Missing Champions: ${missingChamps.join(', ')}`);
      }
      console.log();
    }
  });
  
  // Special characters in files
  console.log('=== SPECIAL/UNEXPECTED CHARACTERS ===');
  const expectedCharacters = new Set([...allEliteFour, ...allChampions]);
  const unexpected = [...currentCharacters].filter(char => 
    !expectedCharacters.has(char) && 
    !char.includes('professor') &&
    !char.includes('counterpart')
  );
  
  if (unexpected.length > 0) {
    console.log('Characters not in standard lists:');
    unexpected.forEach(char => console.log(`  - ${char}`));
  }
  
  // Summary
  const totalExpectedE4 = Object.values(ALL_ELITE_FOUR_CHAMPIONS)
    .reduce((sum, region) => sum + region.eliteFour.length, 0);
  const totalExpectedChamps = Object.values(ALL_ELITE_FOUR_CHAMPIONS)
    .reduce((sum, region) => sum + region.champions.length, 0);
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total expected Elite Four members: ${totalExpectedE4}`);
  console.log(`Total expected Champions: ${totalExpectedChamps}`);
  console.log(`Total expected characters: ${totalExpectedE4 + totalExpectedChamps}`);
  console.log(`Total found characters: ${currentCharacters.size}`);
  console.log(`Coverage: ${((currentCharacters.size / (totalExpectedE4 + totalExpectedChamps)) * 100).toFixed(1)}%`);
  
  return { eliteFourCharacters, championsCharacters, duplicates, currentCharacters };
}

// Run analysis
analyzeEliteFourChampions();