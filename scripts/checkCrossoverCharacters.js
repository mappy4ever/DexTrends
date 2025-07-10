const fs = require('fs');
const path = require('path');

// Characters that serve multiple roles
const CROSSOVER_CHARACTERS = {
  'koga': 'Gym Leader (Gen 1) → Elite Four (Gen 2)',
  'wallace': 'Gym Leader → Champion (Emerald)',
  'iris': 'Gym Leader → Champion (B2W2)',
  'blue': 'Rival → Gym Leader (Gen 2) → Champion',
  'lance': 'Elite Four (Gen 1) → Champion (Gen 2)',
  'larry': 'Gym Leader → Elite Four (Paldea)',
  'hapu': 'Island Kahuna (similar to Gym Leader)',
  'hala': 'Island Kahuna → Elite Four',
  'olivia': 'Island Kahuna → Elite Four',
  'nanu': 'Island Kahuna → Elite Four',
  'acerola': 'Trial Captain → Elite Four',
  'steven': 'Champion (also appears as steven-stone)'
};

// Get files from all three folders
const GYM_LEADERS_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'gym-leaders');
const ELITE_FOUR_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'elite-four');
const CHAMPIONS_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'champions');

const gymLeaderFiles = fs.readdirSync(GYM_LEADERS_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
const eliteFourFiles = fs.readdirSync(ELITE_FOUR_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
const championsFiles = fs.readdirSync(CHAMPIONS_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

// Extract character names
function getCharacterName(filename) {
  const base = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  const cleanName = base.replace(/^(Sun_Moon_|FireRed_LeafGreen_|HeartGold_SoulSilver_|Omega_Ruby_Alpha_Sapphire_|Scarlet_Violet_|Sword_Shield_|XY_|Emerald_)/, '');
  return cleanName.replace(/-\d+$/, '').replace(/-alt\d*$/, '').toLowerCase();
}

// Build character sets
const gymLeaderChars = new Set();
const eliteFourChars = new Set();
const championsChars = new Set();

gymLeaderFiles.forEach(f => gymLeaderChars.add(getCharacterName(f)));
eliteFourFiles.forEach(f => eliteFourChars.add(getCharacterName(f)));
championsFiles.forEach(f => championsChars.add(getCharacterName(f)));

console.log('=== CROSSOVER CHARACTERS ANALYSIS ===\n');

Object.entries(CROSSOVER_CHARACTERS).forEach(([character, description]) => {
  const locations = [];
  if (gymLeaderChars.has(character)) locations.push('Gym Leaders');
  if (eliteFourChars.has(character)) locations.push('Elite Four');
  if (championsChars.has(character)) locations.push('Champions');
  
  console.log(`${character.toUpperCase()} - ${description}`);
  console.log(`  Found in: ${locations.length > 0 ? locations.join(', ') : 'NOT FOUND'}`);
  console.log();
});

// Check for unexpected crossovers
console.log('=== OTHER CHARACTERS IN MULTIPLE FOLDERS ===\n');

const allChars = new Set([...gymLeaderChars, ...eliteFourChars, ...championsChars]);
allChars.forEach(char => {
  const locations = [];
  if (gymLeaderChars.has(char)) locations.push('Gym Leaders');
  if (eliteFourChars.has(char)) locations.push('Elite Four');
  if (championsChars.has(char)) locations.push('Champions');
  
  if (locations.length > 1 && !CROSSOVER_CHARACTERS[char]) {
    console.log(`${char}: ${locations.join(', ')}`);
  }
});

// Check for missing characters referenced earlier
console.log('\n=== CHECKING FOR MISSING CHARACTERS ===\n');

const missingChars = ['red', 'trace', 'drake', 'aaron', 'flint', 'kukui', 'mustard', 'peony', 'kieran'];
missingChars.forEach(char => {
  // Check with various prefixes
  const found = [];
  
  // Check in all files with full names
  const allFiles = [...gymLeaderFiles, ...eliteFourFiles, ...championsFiles];
  allFiles.forEach(file => {
    if (file.toLowerCase().includes(char)) {
      found.push(file);
    }
  });
  
  if (found.length > 0) {
    console.log(`${char}: FOUND as ${found.join(', ')}`);
  } else {
    console.log(`${char}: NOT FOUND`);
  }
});