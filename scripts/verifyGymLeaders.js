const fs = require('fs');
const path = require('path');

// Get all files in gym-leaders folder
const GYM_LEADERS_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'gym-leaders');
const files = fs.readdirSync(GYM_LEADERS_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

console.log('=== ALL FILES IN GYM-LEADERS FOLDER ===\n');
console.log(`Total files: ${files.length}\n`);

// Extract unique gym leader names
const gymLeadersByName = new Map();
files.forEach(file => {
  const baseName = file.replace(/\.(png|jpg|jpeg)$/i, '');
  const cleanName = baseName.replace(/-\d+$/, '').replace(/-alt\d*$/, '');
  
  if (!gymLeadersByName.has(cleanName)) {
    gymLeadersByName.set(cleanName, []);
  }
  gymLeadersByName.get(cleanName).push(file);
});

// Sort and display
const sortedNames = Array.from(gymLeadersByName.keys()).sort();
console.log('=== UNIQUE GYM LEADERS (SORTED ALPHABETICALLY) ===\n');
sortedNames.forEach((name, index) => {
  const files = gymLeadersByName.get(name);
  console.log(`${index + 1}. ${name} (${files.length} file${files.length > 1 ? 's' : ''})`);
  files.forEach(file => console.log(`   - ${file}`));
});

console.log(`\nTotal unique gym leaders: ${sortedNames.length}`);

// Check for specific missing gym leaders with variations
console.log('\n=== CHECKING FOR SPECIFIC GYM LEADERS ===\n');

const checkVariations = [
  // Kanto
  ['lt-surge', 'lt surge', 'ltsurge', 'surge', 'lieutenant-surge'],
  ['janine', 'janie'],
  ['blue', 'gary', 'green'],
  
  // Hoenn
  ['liza', 'tate-and-liza', 'tate&liza'],
  ['juan'],
  
  // Kalos
  ['ramos'],
  
  // Alola
  ['ilima'],
  ['hala'],
  ['olivia'],
  ['nanu'],
  ['hapu'],
  
  // Galar
  ['nessa'],
  ['allister', 'alistair'],
  ['bede'],
  ['klara', 'clara'],
  ['avery'],
  
  // Paldea
  ['larry']
];

checkVariations.forEach(variations => {
  const mainName = variations[0];
  let found = false;
  let foundAs = '';
  
  variations.forEach(variant => {
    if (gymLeadersByName.has(variant)) {
      found = true;
      foundAs = variant;
    }
  });
  
  if (found) {
    console.log(`✓ ${mainName} - FOUND as "${foundAs}"`);
  } else {
    console.log(`✗ ${mainName} - NOT FOUND`);
  }
});

// Check for potential Elite Four mixed in
console.log('\n=== CHECKING FOR ELITE FOUR/CHAMPIONS IN GYM LEADERS ===\n');
const eliteFourNames = ['acerola', 'olivia', 'hala', 'nanu', 'hapu'];
eliteFourNames.forEach(name => {
  if (gymLeadersByName.has(name)) {
    console.log(`! ${name} is in gym-leaders folder (might be Elite Four/Kahuna)`);
  }
});

// List all names for manual review
console.log('\n=== ALL GYM LEADER NAMES (FOR MANUAL REVIEW) ===\n');
console.log(sortedNames.join(', '));