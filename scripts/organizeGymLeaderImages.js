#!/usr/bin/env node
// Organize gym leader images - keep only game artwork with transparent/white backgrounds
// Run: node scripts/organizeGymLeaderImages.js

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Paths
const gymLeadersDir = path.join(projectRoot, 'public/images/scraped/gym-leaders');
const rejectedDir = path.join(projectRoot, 'public/images/scraped/gym-leaders-rejected');
const organizedDir = path.join(projectRoot, 'public/images/scraped/gym-leaders-organized');

// Patterns to identify unwanted images
const rejectPatterns = {
  anime: [
    /anime/i, /ag\d+/i, /dp\d+/i, /bw\d+/i, /xy\d+/i, /sm\d+/i, /jn\d+/i, /hz\d+/i,
    /_ag_/i, /_dp_/i, /_bw_/i, /_xy_/i, /_sm_/i, /_jn_/i, /_hz_/i,
    /journeys/i, /horizons/i, /adventures/i, /origins/i, /generations/i,
    /twilight_wings/i, /evolutions/i, /episode/i, /ep\d+/i
  ],
  manga: [
    /manga/i, /adventures/i, /pokespe/i, /pocket_monsters/i, /_pg/i
  ],
  tcg: [
    /tcg/i, /card/i, /trading_card/i, /full_art/i
  ],
  promotional: [
    /promo/i, /promotional/i, /poster/i, /calendar/i, /merchandise/i
  ],
  lowQuality: [
    /sprite/i, /spr_/i, /_ow/i, /overworld/i, /icon/i, /face/i, /head/i,
    /menu/i, /mini/i, /small/i, /thumbnail/i, /vs_/i, /vstrainer/i
  ]
};

// Preferred patterns for game artwork
const preferredPatterns = [
  /black_white/i, /black_2_white_2/i, /heartgold_soulsilver/i,
  /sun_moon/i, /ultra_sun_ultra_moon/i, /sword_shield/i,
  /brilliant_diamond_shining_pearl/i, /scarlet_violet/i,
  /lets_go/i, /legends_arceus/i, /omega_ruby_alpha_sapphire/i,
  /x_y/i, /diamond_pearl_platinum/i, /red_blue_yellow/i,
  /gold_silver_crystal/i, /ruby_sapphire_emerald/i,
  /firered_leafgreen/i, /official_art/i, /sugimori/i, /concept_art/i
];

// Check if image has transparent or white background
async function hasCleanBackground(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Check if image has alpha channel (transparency)
    if (metadata.channels === 4 || metadata.hasAlpha) {
      // Sample corners to check for transparency
      const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const corners = [
        0, // top-left
        (info.width - 1) * info.channels, // top-right
        (info.height - 1) * info.width * info.channels, // bottom-left
        ((info.height - 1) * info.width + info.width - 1) * info.channels // bottom-right
      ];
      
      let transparentCorners = 0;
      for (const corner of corners) {
        const alpha = data[corner + 3]; // Alpha channel
        if (alpha < 200) transparentCorners++;
      }
      
      // If at least 3 corners are transparent, likely has transparent background
      return transparentCorners >= 3;
    }
    
    // For non-transparent images, check if background is white
    const { dominant } = await image.stats();
    const avgBrightness = (dominant.r + dominant.g + dominant.b) / 3;
    
    // If average brightness is high, likely white background
    return avgBrightness > 240;
    
  } catch (error) {
    console.error(`Error analyzing ${imagePath}:`, error.message);
    return false;
  }
}

// Check if filename suggests it's unwanted
function isUnwantedByName(filename) {
  const lower = filename.toLowerCase();
  
  // Check all reject patterns
  for (const [category, patterns] of Object.entries(rejectPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        return { rejected: true, reason: category };
      }
    }
  }
  
  return { rejected: false };
}

// Calculate quality score for sorting
function getQualityScore(filename, metadata) {
  let score = 0;
  const lower = filename.toLowerCase();
  
  // Bonus for preferred patterns
  for (const pattern of preferredPatterns) {
    if (pattern.test(lower)) {
      score += 100;
      break;
    }
  }
  
  // Bonus for larger images
  if (metadata) {
    score += Math.min(metadata.width * metadata.height / 10000, 100);
  }
  
  // Penalty for numbered variants (prefer -1 over -10)
  const numberMatch = filename.match(/-(\d+)\./);
  if (numberMatch) {
    score -= parseInt(numberMatch[1]) * 5;
  }
  
  return score;
}

// Main organization function
async function organizeGymLeaderImages() {
  console.log('🧹 Starting gym leader image organization...\n');
  
  // Create directories
  await fs.mkdir(rejectedDir, { recursive: true });
  await fs.mkdir(organizedDir, { recursive: true });
  
  // Get all images
  const files = await fs.readdir(gymLeadersDir);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  console.log(`Found ${imageFiles.length} images to process\n`);
  
  const kept = [];
  const rejected = [];
  const stats = {
    total: imageFiles.length,
    kept: 0,
    rejected: 0,
    byReason: {}
  };
  
  // Process each image
  for (const file of imageFiles) {
    const sourcePath = path.join(gymLeadersDir, file);
    
    // First check: filename patterns
    const nameCheck = isUnwantedByName(file);
    if (nameCheck.rejected) {
      console.log(`❌ ${file} - Rejected: ${nameCheck.reason}`);
      const destPath = path.join(rejectedDir, file);
      await fs.rename(sourcePath, destPath);
      rejected.push({ file, reason: nameCheck.reason });
      stats.rejected++;
      stats.byReason[nameCheck.reason] = (stats.byReason[nameCheck.reason] || 0) + 1;
      continue;
    }
    
    // Second check: image properties and background
    try {
      const metadata = await sharp(sourcePath).metadata();
      
      // Skip small images
      if (metadata.width < 200 || metadata.height < 200) {
        console.log(`❌ ${file} - Rejected: too small (${metadata.width}x${metadata.height})`);
        const destPath = path.join(rejectedDir, file);
        await fs.rename(sourcePath, destPath);
        rejected.push({ file, reason: 'too_small' });
        stats.rejected++;
        stats.byReason['too_small'] = (stats.byReason['too_small'] || 0) + 1;
        continue;
      }
      
      // Check background
      const hasCleanBg = await hasCleanBackground(sourcePath);
      if (!hasCleanBg) {
        console.log(`❌ ${file} - Rejected: busy background`);
        const destPath = path.join(rejectedDir, file);
        await fs.rename(sourcePath, destPath);
        rejected.push({ file, reason: 'busy_background' });
        stats.rejected++;
        stats.byReason['busy_background'] = (stats.byReason['busy_background'] || 0) + 1;
        continue;
      }
      
      // Image passed all checks
      console.log(`✅ ${file} - Kept`);
      kept.push({
        file,
        metadata,
        score: getQualityScore(file, metadata)
      });
      stats.kept++;
      
    } catch (error) {
      console.log(`⚠️  ${file} - Error processing: ${error.message}`);
      // Move problematic files to rejected
      const destPath = path.join(rejectedDir, file);
      await fs.rename(sourcePath, destPath);
      rejected.push({ file, reason: 'error' });
      stats.rejected++;
      stats.byReason['error'] = (stats.byReason['error'] || 0) + 1;
    }
  }
  
  console.log('\n📊 Organization Summary:');
  console.log(`Total images: ${stats.total}`);
  console.log(`Kept: ${stats.kept}`);
  console.log(`Rejected: ${stats.rejected}`);
  console.log('\nRejection reasons:');
  for (const [reason, count] of Object.entries(stats.byReason)) {
    console.log(`  ${reason}: ${count}`);
  }
  
  // Now organize kept images by character and select best ones
  console.log('\n🎯 Selecting best image per character...');
  
  const byCharacter = {};
  for (const item of kept) {
    const charName = item.file.split('-')[0];
    if (!byCharacter[charName]) {
      byCharacter[charName] = [];
    }
    byCharacter[charName].push(item);
  }
  
  // Select best image(s) per character
  for (const [charName, images] of Object.entries(byCharacter)) {
    // Sort by quality score
    images.sort((a, b) => b.score - a.score);
    
    // Keep top 3 images per character
    const toKeep = images.slice(0, 3);
    const toReject = images.slice(3);
    
    // Move best images to organized folder with consistent naming
    for (let i = 0; i < toKeep.length; i++) {
      const item = toKeep[i];
      const ext = path.extname(item.file);
      const newName = i === 0 ? `${charName}${ext}` : `${charName}-alt${i}${ext}`;
      
      const sourcePath = path.join(gymLeadersDir, item.file);
      const destPath = path.join(organizedDir, newName);
      
      await fs.rename(sourcePath, destPath);
      console.log(`  ${charName}: ${item.file} → ${newName} (score: ${item.score})`);
    }
    
    // Move excess images to rejected
    for (const item of toReject) {
      const sourcePath = path.join(gymLeadersDir, item.file);
      const destPath = path.join(rejectedDir, item.file);
      await fs.rename(sourcePath, destPath);
    }
  }
  
  // Final summary
  const organizedFiles = await fs.readdir(organizedDir);
  console.log(`\n✅ Organization complete!`);
  console.log(`📁 Organized images: ${organizedFiles.length} in ${organizedDir}`);
  console.log(`🗑️  Rejected images: ${stats.rejected} in ${rejectedDir}`);
  
  // Create summary JSON
  const summary = {
    stats,
    organized: organizedFiles,
    rejected: rejected.map(r => r.file),
    byCharacter: {}
  };
  
  for (const file of organizedFiles) {
    const charName = file.replace(/-alt\d+/, '').replace(/\.\w+$/, '');
    if (!summary.byCharacter[charName]) {
      summary.byCharacter[charName] = [];
    }
    summary.byCharacter[charName].push(file);
  }
  
  await fs.writeFile(
    path.join(organizedDir, 'organization-summary.json'),
    JSON.stringify(summary, null, 2)
  );
}

// Install sharp if needed
async function checkDependencies() {
  try {
    await import('sharp');
  } catch {
    console.log('📦 Installing required dependency: sharp...');
    const { execSync } = await import('child_process');
    execSync('npm install sharp', { stdio: 'inherit' });
  }
}

// Main execution
async function main() {
  await checkDependencies();
  await organizeGymLeaderImages();
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});