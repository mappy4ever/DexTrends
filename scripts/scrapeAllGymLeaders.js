#!/usr/bin/env node
// Scrape ALL gym leader images without limits
// Run: node scripts/scrapeAllGymLeaders.js

import { gymLeaderDirectScraper } from '../utils/scrapers/gymLeaderDirectScraper.js';
import { saveDataToFile } from '../utils/scrapers/scraperUtils.js';

// Create a modified scraper that removes the limit
class UnlimitedGymLeaderScraper extends gymLeaderDirectScraper.constructor {
  async scrapeCharacter(characterName, subfolder) {
    console.log(`\nScraping ALL images for ${characterName}...`);
    
    const files = await this.getAllCategoryFiles(characterName);
    if (!files || files.length === 0) {
      console.log(`No files found for ${characterName}`);
      return [];
    }
    
    console.log(`Found ${files.length} total files for ${characterName}`);
    
    const validFiles = files.filter(file => this.filterCharacterImage(file.title, characterName));
    console.log(`${validFiles.length} files match criteria - downloading ALL of them`);
    
    const downloadedFiles = [];
    let count = 0;
    
    // Sort to prioritize game artwork
    validFiles.sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      
      // Prioritize game names in filename
      const aHasGame = /red|blue|gold|silver|ruby|sapphire|diamond|pearl|black|white|x_y|sun|moon|sword|shield|scarlet|violet/.test(aLower);
      const bHasGame = /red|blue|gold|silver|ruby|sapphire|diamond|pearl|black|white|x_y|sun|moon|sword|shield|scarlet|violet/.test(bLower);
      
      if (aHasGame && !bHasGame) return -1;
      if (!aHasGame && bHasGame) return 1;
      
      return 0;
    });
    
    // Download ALL valid files
    for (const file of validFiles) {
      const imageInfo = await this.getImageInfo(file.title);
      if (!imageInfo) continue;
      
      // Skip small images
      if (imageInfo.width < 200 || imageInfo.height < 200) continue;
      
      // Generate filename
      const extension = imageInfo.url.split('.').pop().split('?')[0];
      const cleanName = `${characterName.toLowerCase().replace(/_/g, '-')}-${count + 1}.${extension}`;
      
      // Download image
      const { downloadImage, delay } = await import('../utils/scrapers/scraperUtils.js');
      const localPath = await downloadImage(imageInfo.url, cleanName, subfolder);
      if (localPath) {
        downloadedFiles.push({
          character: characterName,
          original: file.title,
          local: cleanName,
          path: `/images/scraped/${subfolder}/${cleanName}`,
          width: imageInfo.width,
          height: imageInfo.height
        });
        count++;
        console.log(`Downloaded ${count}/${validFiles.length}: ${cleanName}`);
      }
      
      await delay(1000);
    }
    
    console.log(`✅ Downloaded ${count} images for ${characterName}`);
    return downloadedFiles;
  }
}

// Main function
async function main() {
  console.log('🎯 Starting UNLIMITED gym leader image scraping...');
  console.log('⚠️  This will download ALL available images for each gym leader');
  console.log('⏱️  This may take a while...\n');
  
  const scraper = new UnlimitedGymLeaderScraper();
  const allFiles = [];
  
  // Get specific region from command line or scrape all
  const region = process.argv[2];
  
  if (region && scraper.gymLeaders[region]) {
    console.log(`Scraping only ${region.toUpperCase()} gym leaders...\n`);
    const leaders = scraper.gymLeaders[region];
    
    for (const leader of leaders) {
      const files = await scraper.scrapeCharacter(leader, 'gym-leaders');
      allFiles.push(...files);
    }
  } else if (region) {
    console.log(`❌ Invalid region: ${region}`);
    console.log('Available regions: kanto, johto, hoenn, sinnoh, unova, kalos, alola, galar, paldea');
    process.exit(1);
  } else {
    // Scrape all regions
    for (const [regionName, leaders] of Object.entries(scraper.gymLeaders)) {
      console.log(`\n=== Scraping ${regionName.toUpperCase()} gym leaders ===`);
      
      for (const leader of leaders) {
        const files = await scraper.scrapeCharacter(leader, 'gym-leaders');
        allFiles.push(...files);
      }
    }
  }
  
  // Save comprehensive data
  const data = {
    totalCharacters: region ? scraper.gymLeaders[region].length : Object.values(scraper.gymLeaders).flat().length,
    totalDownloaded: allFiles.length,
    averagePerCharacter: Math.round(allFiles.length / (region ? scraper.gymLeaders[region].length : Object.values(scraper.gymLeaders).flat().length)),
    files: allFiles,
    byCharacter: {}
  };
  
  // Group by character
  for (const file of allFiles) {
    if (!data.byCharacter[file.character]) {
      data.byCharacter[file.character] = [];
    }
    data.byCharacter[file.character].push(file);
  }
  
  const filename = region ? `gym-leaders-${region}-complete.json` : 'gym-leaders-all-complete.json';
  await saveDataToFile(data, filename, 'gym-leaders');
  
  console.log(`\n✅ COMPLETE! Downloaded ${allFiles.length} total images`);
  console.log(`📊 Average of ${data.averagePerCharacter} images per gym leader`);
  console.log(`💾 Data saved to: public/data/scraped/gym-leaders/${filename}`);
  
  // Show character breakdown
  console.log('\n📈 Images per character:');
  for (const [char, files] of Object.entries(data.byCharacter)) {
    console.log(`  ${char}: ${files.length} images`);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});