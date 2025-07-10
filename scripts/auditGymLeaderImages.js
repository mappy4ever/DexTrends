#!/usr/bin/env node
// Audit gym leader images and fix issues
// Run: node scripts/auditGymLeaderImages.js

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { gymLeaderDirectScraper } from '../utils/scrapers/gymLeaderDirectScraper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Paths
const organizedDir = path.join(projectRoot, 'public/images/scraped/gym-leaders-organized');
const rejectedDir = path.join(projectRoot, 'public/images/scraped/gym-leaders-rejected');
const originalDir = path.join(projectRoot, 'public/images/scraped/gym-leaders');

// Get all expected gym leaders
function getAllGymLeaders() {
  const scraper = new gymLeaderDirectScraper.constructor();
  const allLeaders = [];
  for (const [region, leaders] of Object.entries(scraper.gymLeaders)) {
    for (const leader of leaders) {
      allLeaders.push({
        name: leader.toLowerCase().replace(/_/g, '-'),
        originalName: leader,
        region
      });
    }
  }
  return allLeaders;
}

// Check if image might be TCG
async function isTCGImage(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const aspectRatio = metadata.width / metadata.height;
    
    // TCG cards typically have specific aspect ratios
    const tcgRatio = 63 / 88; // Standard Pokemon card ratio
    const isTCGAspect = Math.abs(aspectRatio - tcgRatio) < 0.1;
    
    // Also check filename
    const filename = path.basename(imagePath).toLowerCase();
    const hasTCGPattern = /tcg|card|full[-_]?art/i.test(filename);
    
    return isTCGAspect || hasTCGPattern;
  } catch (error) {
    return false;
  }
}

// Analyze background more carefully
async function analyzeBackground(imagePath) {
  try {
    const image = sharp(imagePath);
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Sample multiple points around edges
    const samples = [];
    const sampleSize = 10;
    
    // Top edge
    for (let x = 0; x < info.width; x += Math.floor(info.width / sampleSize)) {
      const idx = x * info.channels;
      samples.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3] || 255]);
    }
    
    // Bottom edge
    for (let x = 0; x < info.width; x += Math.floor(info.width / sampleSize)) {
      const idx = ((info.height - 1) * info.width + x) * info.channels;
      samples.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3] || 255]);
    }
    
    // Check for transparency
    const hasTransparency = samples.some(([r, g, b, a]) => a < 200);
    
    // Check for white/light background
    const isWhiteBg = samples.every(([r, g, b, a]) => 
      (r > 240 && g > 240 && b > 240) || a < 200
    );
    
    // Check for uniform color (not busy)
    const colorVariance = samples.reduce((acc, [r, g, b]) => {
      const avgColor = samples.reduce((sum, [r2, g2, b2]) => 
        sum + Math.abs(r - r2) + Math.abs(g - g2) + Math.abs(b - b2), 0
      ) / samples.length;
      return Math.max(acc, avgColor);
    }, 0);
    
    const isUniformBg = colorVariance < 100;
    
    return {
      hasTransparency,
      isWhiteBg,
      isUniformBg,
      isClean: hasTransparency || (isWhiteBg && isUniformBg)
    };
    
  } catch (error) {
    console.error(`Error analyzing ${imagePath}:`, error.message);
    return { isClean: false };
  }
}

// Main audit function
async function auditGymLeaderImages() {
  console.log('🔍 Auditing gym leader images...\n');
  
  // Get all expected leaders
  const expectedLeaders = getAllGymLeaders();
  console.log(`Expected ${expectedLeaders.length} gym leaders\n`);
  
  // Get current organized images
  const organizedFiles = await fs.readdir(organizedDir);
  const imageFiles = organizedFiles.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  // Group by character
  const currentLeaders = new Set();
  const imagesByLeader = {};
  
  for (const file of imageFiles) {
    const leaderName = file.replace(/-alt\d+/, '').replace(/\.[^.]*$/, '');
    currentLeaders.add(leaderName);
    
    if (!imagesByLeader[leaderName]) {
      imagesByLeader[leaderName] = [];
    }
    imagesByLeader[leaderName].push(file);
  }
  
  // Find missing leaders
  const missingLeaders = expectedLeaders.filter(leader => 
    !currentLeaders.has(leader.name) && leader.name !== 'lt.-surge'
  );
  
  // Check for Lt. Surge naming issue
  if (currentLeaders.has('lt') || currentLeaders.has('lt.')) {
    console.log('⚠️  Found Lt. Surge with incorrect naming\n');
  }
  
  console.log(`📊 Current Status:`);
  console.log(`- Have images for: ${currentLeaders.size} leaders`);
  console.log(`- Missing: ${missingLeaders.length} leaders\n`);
  
  if (missingLeaders.length > 0) {
    console.log('❌ Missing gym leaders:');
    for (const leader of missingLeaders) {
      console.log(`  - ${leader.originalName} (${leader.region})`);
    }
    console.log('');
  }
  
  // Check for TCG images and analyze backgrounds
  console.log('🎴 Checking for TCG images and re-analyzing backgrounds...\n');
  
  const tcgImages = [];
  const backgroundRecheck = [];
  
  for (const [leader, files] of Object.entries(imagesByLeader)) {
    for (const file of files) {
      const imagePath = path.join(organizedDir, file);
      
      // Check if TCG
      if (await isTCGImage(imagePath)) {
        tcgImages.push(file);
        console.log(`  TCG detected: ${file}`);
      }
      
      // Re-analyze background
      const bgAnalysis = await analyzeBackground(imagePath);
      if (!bgAnalysis.isClean) {
        backgroundRecheck.push({ file, analysis: bgAnalysis });
      }
    }
  }
  
  // Look for missing leaders in rejected folder
  console.log('\n🔍 Checking rejected folder for missing leaders...\n');
  
  const rejectedFiles = await fs.readdir(rejectedDir);
  const recoverable = [];
  
  for (const leader of missingLeaders) {
    const leaderFiles = rejectedFiles.filter(f => 
      f.toLowerCase().startsWith(leader.name + '-') && /\.(png|jpg|jpeg)$/i.test(f)
    );
    
    if (leaderFiles.length > 0) {
      console.log(`Found ${leaderFiles.length} images for missing leader: ${leader.originalName}`);
      
      // Re-analyze these with less strict criteria
      for (const file of leaderFiles) {
        const imagePath = path.join(rejectedDir, file);
        const metadata = await sharp(imagePath).metadata();
        
        // Less strict criteria for game artwork
        if (metadata.width >= 200 && metadata.height >= 200) {
          const bgAnalysis = await analyzeBackground(imagePath);
          
          // Accept if it has any uniform background or is large enough
          if (bgAnalysis.isUniformBg || (metadata.width >= 400 && metadata.height >= 400)) {
            recoverable.push({
              leader: leader.name,
              file,
              reason: bgAnalysis.isUniformBg ? 'uniform_bg' : 'large_artwork'
            });
          }
        }
      }
    }
  }
  
  // Fix Lt. Surge naming
  const ltSurgeFiles = imageFiles.filter(f => f.startsWith('lt.') || f.startsWith('lt-'));
  if (ltSurgeFiles.length > 0) {
    console.log('\n🔧 Fixing Lt. Surge naming...');
    for (const file of ltSurgeFiles) {
      const newName = file.replace(/^lt\.?-?/, 'lt-surge');
      const oldPath = path.join(organizedDir, file);
      const newPath = path.join(organizedDir, newName);
      await fs.rename(oldPath, newPath);
      console.log(`  Renamed: ${file} → ${newName}`);
    }
  }
  
  // Remove TCG images
  if (tcgImages.length > 0) {
    console.log('\n🗑️  Moving TCG images to rejected...');
    for (const file of tcgImages) {
      const srcPath = path.join(organizedDir, file);
      const destPath = path.join(rejectedDir, file);
      await fs.rename(srcPath, destPath);
      console.log(`  Moved: ${file}`);
    }
  }
  
  // Recover missing leaders
  if (recoverable.length > 0) {
    console.log('\n♻️  Recovering images for missing leaders...');
    
    const byLeader = {};
    for (const item of recoverable) {
      if (!byLeader[item.leader]) {
        byLeader[item.leader] = [];
      }
      byLeader[item.leader].push(item);
    }
    
    for (const [leader, items] of Object.entries(byLeader)) {
      // Take best 3
      const toRecover = items.slice(0, 3);
      
      for (let i = 0; i < toRecover.length; i++) {
        const item = toRecover[i];
        const ext = path.extname(item.file);
        const newName = i === 0 ? `${leader}${ext}` : `${leader}-alt${i}${ext}`;
        
        const srcPath = path.join(rejectedDir, item.file);
        const destPath = path.join(organizedDir, newName);
        
        await fs.rename(srcPath, destPath);
        console.log(`  Recovered: ${item.file} → ${newName} (${item.reason})`);
      }
    }
  }
  
  // Final summary
  const finalFiles = await fs.readdir(organizedDir);
  const finalImages = finalFiles.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  const finalLeaders = new Set(
    finalImages.map(f => f.replace(/-alt\d+/, '').replace(/\.[^.]*$/, ''))
  );
  
  console.log('\n✅ Audit Complete!');
  console.log(`📊 Final Status:`);
  console.log(`- Total gym leaders with images: ${finalLeaders.size}/${expectedLeaders.length}`);
  console.log(`- Total images: ${finalImages.length}`);
  console.log(`- TCG images removed: ${tcgImages.length}`);
  console.log(`- Images recovered: ${recoverable.length}`);
  
  // List any still missing
  const stillMissing = expectedLeaders.filter(leader => 
    !finalLeaders.has(leader.name) && leader.name !== 'lt.-surge'
  );
  
  if (stillMissing.length > 0) {
    console.log('\n⚠️  Still missing:');
    for (const leader of stillMissing) {
      console.log(`  - ${leader.originalName} (${leader.region})`);
    }
  }
}

// Run the audit
auditGymLeaderImages().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});