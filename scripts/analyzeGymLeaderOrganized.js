const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCRAPED_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped');
const GYM_LEADERS_PATH = path.join(SCRAPED_PATH, 'gym-leaders');
const GYM_LEADERS_ORGANIZED_PATH = path.join(SCRAPED_PATH, 'gym-leaders-organized');

// Function to get file hash for comparison
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

// Function to extract gym leader name from filename
function getGymLeaderName(filename) {
  // Remove extension
  const base = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  // Remove -alt and number suffixes
  return base.replace(/-alt\d*$/, '').replace(/-\d+$/, '').toLowerCase();
}

// Analyze duplicates
function analyzeDuplicates() {
  console.log('Analyzing gym leader images from organized folder...\n');
  
  // Get all files from each directory
  const mainFiles = fs.readdirSync(GYM_LEADERS_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  const organizedFiles = fs.readdirSync(GYM_LEADERS_ORGANIZED_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  console.log(`Main gym-leaders folder: ${mainFiles.length} files`);
  console.log(`Organized folder: ${organizedFiles.length} files\n`);
  
  // Build hash maps for main directory
  const mainHashes = new Map();
  const mainByName = new Map();
  
  // Process main folder
  mainFiles.forEach(file => {
    const filePath = path.join(GYM_LEADERS_PATH, file);
    const hash = getFileHash(filePath);
    const name = getGymLeaderName(file);
    
    mainHashes.set(hash, file);
    
    if (!mainByName.has(name)) {
      mainByName.set(name, []);
    }
    mainByName.get(name).push(file);
  });
  
  // Analyze organized folder
  const duplicates = [];
  const uniqueInOrganized = [];
  const gymLeaderCounts = new Map();
  
  organizedFiles.forEach(file => {
    const filePath = path.join(GYM_LEADERS_ORGANIZED_PATH, file);
    const hash = getFileHash(filePath);
    const name = getGymLeaderName(file);
    
    // Count occurrences
    gymLeaderCounts.set(name, (gymLeaderCounts.get(name) || 0) + 1);
    
    if (mainHashes.has(hash)) {
      duplicates.push({
        organized: file,
        main: mainHashes.get(hash),
        hash: hash
      });
    } else {
      uniqueInOrganized.push({
        file: file,
        name: name,
        existsInMain: mainByName.has(name)
      });
    }
  });
  
  // Report findings
  console.log('=== DUPLICATE FILES (Same content in both folders) ===');
  if (duplicates.length === 0) {
    console.log('No exact duplicates found!');
  } else {
    duplicates.forEach(dup => {
      console.log(`${dup.organized} <-> ${dup.main}`);
    });
  }
  
  console.log(`\nTotal exact duplicates: ${duplicates.length}\n`);
  
  console.log('=== UNIQUE FILES IN ORGANIZED FOLDER ===');
  const uniqueByGymLeader = new Map();
  
  uniqueInOrganized.forEach(item => {
    if (!uniqueByGymLeader.has(item.name)) {
      uniqueByGymLeader.set(item.name, []);
    }
    uniqueByGymLeader.get(item.name).push(item.file);
  });
  
  // Sort by gym leader name
  const sortedGymLeaders = Array.from(uniqueByGymLeader.keys()).sort();
  
  sortedGymLeaders.forEach(name => {
    const files = uniqueByGymLeader.get(name);
    const inMain = mainByName.has(name);
    console.log(`\n${name} (${inMain ? 'has images in main' : 'NOT in main'}):`);
    files.forEach(file => console.log(`  - ${file}`));
  });
  
  console.log(`\nTotal unique files in organized: ${uniqueInOrganized.length}`);
  
  // Summary statistics
  console.log('\n=== SUMMARY ===');
  console.log(`Gym leaders in main folder: ${mainByName.size}`);
  console.log(`Gym leaders in organized folder: ${gymLeaderCounts.size}`);
  console.log(`Gym leaders only in organized: ${Array.from(uniqueByGymLeader.keys()).filter(name => !mainByName.has(name)).length}`);
  
  // List gym leaders only in organized
  const onlyInOrganized = Array.from(uniqueByGymLeader.keys()).filter(name => !mainByName.has(name));
  if (onlyInOrganized.length > 0) {
    console.log('\nGym leaders ONLY in organized folder:');
    onlyInOrganized.forEach(name => {
      console.log(`  - ${name}: ${uniqueByGymLeader.get(name).join(', ')}`);
    });
  }
  
  return {
    duplicates,
    uniqueInOrganized,
    uniqueByGymLeader,
    mainByName,
    onlyInOrganized
  };
}

// Move unique files to main folder
function moveUniqueFiles(analysis) {
  console.log('\n\n=== MOVING UNIQUE FILES TO MAIN FOLDER ===\n');
  
  const { onlyInOrganized, uniqueByGymLeader } = analysis;
  let movedCount = 0;
  
  onlyInOrganized.forEach(name => {
    const files = uniqueByGymLeader.get(name);
    console.log(`\nMoving ${name} images:`);
    
    files.forEach(file => {
      const sourcePath = path.join(GYM_LEADERS_ORGANIZED_PATH, file);
      const destPath = path.join(GYM_LEADERS_PATH, file);
      
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✓ Moved ${file}`);
        movedCount++;
      } catch (err) {
        console.error(`  ✗ Error moving ${file}: ${err.message}`);
      }
    });
  });
  
  console.log(`\nTotal files moved: ${movedCount}`);
  
  // Note about duplicates
  if (analysis.duplicates.length > 0) {
    console.log('\n=== NOTE ON DUPLICATES ===');
    console.log(`${analysis.duplicates.length} files in organized folder are exact duplicates of files in main folder.`);
    console.log('These were not moved as they already exist in the main folder.');
  }
}

// Run the analysis
const analysis = analyzeDuplicates();

// Ask for confirmation before moving files
console.log('\n\nDo you want to move unique gym leaders to the main folder?');
console.log('Run this script with --move flag to proceed with moving files.');

if (process.argv.includes('--move')) {
  moveUniqueFiles(analysis);
} else {
  console.log('\nTo move files, run: node scripts/analyzeGymLeaderOrganized.js --move');
}