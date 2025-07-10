const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCRAPED_PATH = path.join(__dirname, '..', 'public', 'images', 'scraped');
const GYM_LEADERS_PATH = path.join(SCRAPED_PATH, 'gym-leaders');
const GYM_LEADERS_REJECTED_PATH = path.join(SCRAPED_PATH, 'gym-leaders-rejected');

// Function to get file hash for comparison
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

// Function to extract gym leader name from filename
function getGymLeaderName(filename) {
  // Remove number suffix and extension
  const base = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  const parts = base.split('-');
  
  // Remove trailing numbers and 'alt' suffixes
  while (parts.length > 0 && (parts[parts.length - 1].match(/^\d+$/) || parts[parts.length - 1].match(/^alt\d*$/))) {
    parts.pop();
  }
  
  return parts.join('-').toLowerCase();
}

// Analyze duplicates
function analyzeDuplicates() {
  console.log('Analyzing gym leader images for duplicates...\n');
  
  // Get all files from each directory
  const mainFiles = fs.readdirSync(GYM_LEADERS_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  const rejectedFiles = fs.readdirSync(GYM_LEADERS_REJECTED_PATH).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  console.log(`Main gym-leaders folder: ${mainFiles.length} files`);
  console.log(`Rejected folder: ${rejectedFiles.length} files\n`);
  
  // Build hash maps for each directory
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
  
  // Analyze rejected folder
  const duplicates = [];
  const uniqueInRejected = [];
  const gymLeaderCounts = new Map();
  
  rejectedFiles.forEach(file => {
    const filePath = path.join(GYM_LEADERS_REJECTED_PATH, file);
    const hash = getFileHash(filePath);
    const name = getGymLeaderName(file);
    
    // Count occurrences
    gymLeaderCounts.set(name, (gymLeaderCounts.get(name) || 0) + 1);
    
    if (mainHashes.has(hash)) {
      duplicates.push({
        rejected: file,
        main: mainHashes.get(hash),
        hash: hash
      });
    } else {
      uniqueInRejected.push({
        file: file,
        name: name,
        existsInMain: mainByName.has(name)
      });
    }
  });
  
  // Report findings
  console.log('=== DUPLICATE FILES (Same content in both folders) ===');
  duplicates.forEach(dup => {
    console.log(`${dup.rejected} <-> ${dup.main}`);
  });
  
  console.log(`\nTotal exact duplicates: ${duplicates.length}\n`);
  
  console.log('=== UNIQUE FILES IN REJECTED FOLDER ===');
  const uniqueByGymLeader = new Map();
  
  uniqueInRejected.forEach(item => {
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
  
  console.log(`\nTotal unique files in rejected: ${uniqueInRejected.length}`);
  
  // Summary statistics
  console.log('\n=== SUMMARY ===');
  console.log(`Gym leaders in main folder: ${mainByName.size}`);
  console.log(`Gym leaders in rejected folder: ${gymLeaderCounts.size}`);
  console.log(`Gym leaders only in rejected: ${Array.from(uniqueByGymLeader.keys()).filter(name => !mainByName.has(name)).length}`);
  
  // List gym leaders only in rejected
  const onlyInRejected = Array.from(uniqueByGymLeader.keys()).filter(name => !mainByName.has(name));
  if (onlyInRejected.length > 0) {
    console.log('\nGym leaders ONLY in rejected folder:');
    onlyInRejected.forEach(name => {
      console.log(`  - ${name}: ${uniqueByGymLeader.get(name).join(', ')}`);
    });
  }
  
  return {
    duplicates,
    uniqueInRejected,
    uniqueByGymLeader,
    mainByName,
    onlyInRejected
  };
}

// Move unique files to main folder
function moveUniqueFiles(analysis) {
  console.log('\n\n=== MOVING UNIQUE FILES TO MAIN FOLDER ===\n');
  
  const { onlyInRejected, uniqueByGymLeader } = analysis;
  let movedCount = 0;
  
  onlyInRejected.forEach(name => {
    const files = uniqueByGymLeader.get(name);
    console.log(`\nMoving ${name} images:`);
    
    files.forEach(file => {
      const sourcePath = path.join(GYM_LEADERS_REJECTED_PATH, file);
      const destPath = path.join(GYM_LEADERS_PATH, file);
      
      try {
        fs.copyFileSync(sourcePath, destPath);
        fs.unlinkSync(sourcePath);
        console.log(`  ✓ Moved ${file}`);
        movedCount++;
      } catch (err) {
        console.error(`  ✗ Error moving ${file}: ${err.message}`);
      }
    });
  });
  
  console.log(`\nTotal files moved: ${movedCount}`);
  
  // Remove exact duplicates from rejected folder
  console.log('\n=== REMOVING DUPLICATES FROM REJECTED FOLDER ===\n');
  let removedCount = 0;
  
  analysis.duplicates.forEach(dup => {
    const filePath = path.join(GYM_LEADERS_REJECTED_PATH, dup.rejected);
    try {
      fs.unlinkSync(filePath);
      console.log(`✓ Removed duplicate: ${dup.rejected}`);
      removedCount++;
    } catch (err) {
      console.error(`✗ Error removing ${dup.rejected}: ${err.message}`);
    }
  });
  
  console.log(`\nTotal duplicates removed: ${removedCount}`);
}

// Run the analysis
const analysis = analyzeDuplicates();

// Ask for confirmation before moving files
console.log('\n\nDo you want to move unique gym leaders to the main folder? (This will also remove duplicates)');
console.log('Run this script with --move flag to proceed with moving files.');

if (process.argv.includes('--move')) {
  moveUniqueFiles(analysis);
} else {
  console.log('\nTo move files, run: node scripts/analyzeGymLeaderDuplicates.js --move');
}