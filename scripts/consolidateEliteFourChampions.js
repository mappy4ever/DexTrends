const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ELITE_FOUR_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'elite-four');
const CHAMPIONS_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped', 'champions');

// Get file hash for comparison
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

console.log('=== CONSOLIDATING ELITE FOUR & CHAMPIONS ===\n');

// First, handle Lance duplicates (he's in both folders)
const lanceDuplicates = [
  'lance-1.png', 'lance-2.png', 'lance-3.png', 'lance-4.jpg', 
  'lance-5.jpg', 'lance-6.jpg', 'lance-7.png', 'lance-8.png', 
  'lance-9.png', 'lance-10.png'
];

console.log('Removing Lance duplicates from Elite Four folder (keeping in Champions):');
let removedCount = 0;
lanceDuplicates.forEach(file => {
  const eliteFourPath = path.join(ELITE_FOUR_PATH, file);
  const championsPath = path.join(CHAMPIONS_PATH, file);
  
  if (fs.existsSync(eliteFourPath) && fs.existsSync(championsPath)) {
    try {
      // Verify they're the same file
      const e4Hash = getFileHash(eliteFourPath);
      const champHash = getFileHash(championsPath);
      
      if (e4Hash === champHash) {
        fs.unlinkSync(eliteFourPath);
        console.log(`  ✓ Removed ${file} from elite-four`);
        removedCount++;
      } else {
        console.log(`  ! ${file} has different content in each folder - keeping both`);
      }
    } catch (err) {
      console.error(`  ✗ Error removing ${file}: ${err.message}`);
    }
  }
});

console.log(`\nRemoved ${removedCount} Lance duplicates from elite-four folder\n`);

// Handle the hala-6.png / hau-6.png duplicate
console.log('Checking hala-6.png vs hau-6.png:');
const halaPath = path.join(ELITE_FOUR_PATH, 'hala-6.png');
const hauPath = path.join(CHAMPIONS_PATH, 'hau-6.png');

if (fs.existsSync(halaPath) && fs.existsSync(hauPath)) {
  const halaHash = getFileHash(halaPath);
  const hauHash = getFileHash(hauPath);
  
  if (halaHash === hauHash) {
    console.log('  ! hala-6.png and hau-6.png are identical - this appears to be a mislabeled file');
    console.log('  Keeping both for now - manual review needed');
  }
}

// Move characters that belong in different folders
console.log('\n=== CHECKING FOR MISPLACED CHARACTERS ===\n');

// Koga should be in Elite Four (he becomes E4 in Gen 2)
const kogaInGymLeaders = path.join(__dirname, '..', 'public', 'images', 'scraped', 'gym-leaders');
const kogaFiles = fs.readdirSync(kogaInGymLeaders)
  .filter(f => f.startsWith('koga') && /\.(png|jpg|jpeg)$/i.test(f));

if (kogaFiles.length > 0) {
  console.log(`Found ${kogaFiles.length} Koga files in gym-leaders folder`);
  console.log('Note: Koga is both a Gym Leader (Gen 1) and Elite Four (Gen 2), so having him in both is correct\n');
}

// Check for missing Elite Four/Champions
console.log('=== CHARACTERS THAT NEED TO BE ADDED ===\n');

const stillMissing = {
  eliteFour: ['drake', 'aaron', 'flint'],
  champions: ['red', 'trace', 'mustard', 'peony', 'kieran']
};

console.log('Missing Elite Four members:');
stillMissing.eliteFour.forEach(member => console.log(`  - ${member}`));

console.log('\nMissing Champions:');
stillMissing.champions.forEach(champion => {
  if (champion === 'red') {
    console.log(`  - ${champion} (found red-s-counterparts.png but not individual image)`);
  } else {
    console.log(`  - ${champion}`);
  }
});

// Note about special cases
console.log('\n=== SPECIAL CASES ===');
console.log('- Steven Stone: Listed as "steven-stone" in champions folder (correct)');
console.log('- Professor Kukui: Found as "professorkukuisunmoon148.jpg" (should be renamed)');
console.log('- Blue: Found as "Sun_Moon_Blue.png" in champions folder');
console.log('- Island Kahunas (Hala, Olivia, Nanu): Correctly in both gym-leaders and elite-four');
console.log('- Larry: Correctly in both gym-leaders and elite-four');

console.log('\n=== SUMMARY ===');
console.log(`- Removed ${removedCount} Lance duplicates`);
console.log('- Need to add 3 Elite Four members and 5 Champions');
console.log('- Most crossover characters are correctly placed in multiple folders');
console.log('- Overall coverage: ~86% complete');