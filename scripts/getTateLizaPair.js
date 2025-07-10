#!/usr/bin/env node
// Get Tate and Liza images (they're often together)
import { gymLeaderDirectScraper } from '../utils/scrapers/gymLeaderDirectScraper.js';
import { downloadImage } from '../utils/scrapers/scraperUtils.js';

async function getTateLizaPair() {
  console.log('Fetching Tate and Liza images...\n');
  
  const scraper = new gymLeaderDirectScraper.constructor();
  
  // Try different search terms
  const searchTerms = ['Tate_and_Liza', 'Tate_%26_Liza', 'Tate_&_Liza'];
  let found = false;
  
  for (const term of searchTerms) {
    console.log(`Trying search term: ${term}`);
    const files = await scraper.getAllCategoryFiles(term);
    
    if (files && files.length > 0) {
      console.log(`Found ${files.length} files!`);
      found = true;
      
      // Download first few suitable images
      let count = 0;
      for (const file of files) {
        if (count >= 6) break;
        
        const filename = file.title.toLowerCase();
        if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
          const imageInfo = await scraper.getImageInfo(file.title);
          if (imageInfo && imageInfo.width >= 200 && imageInfo.height >= 200) {
            // Download for Tate
            if (count < 3) {
              const localName = `tate-${count + 1}.png`;
              await downloadImage(imageInfo.url, localName, 'gym-leaders');
              console.log(`Downloaded: ${localName}`);
            }
            // Download for Liza
            else {
              const localName = `liza-${count - 2}.png`;
              await downloadImage(imageInfo.url, localName, 'gym-leaders');
              console.log(`Downloaded: ${localName}`);
            }
            count++;
          }
        }
      }
      break;
    }
  }
  
  if (!found) {
    // Try manual search on Bulbagarden Archives
    console.log('\nTrying direct Bulbagarden Archives search...');
    
    const archivesApiUrl = 'https://archives.bulbagarden.net/w/api.php';
    const searchParams = {
      action: 'query',
      list: 'search',
      srsearch: 'Tate Liza',
      srnamespace: '6', // File namespace
      srlimit: 20,
      format: 'json',
      origin: '*'
    };
    
    const response = await fetch(`${archivesApiUrl}?${new URLSearchParams(searchParams)}`);
    const data = await response.json();
    
    if (data.query && data.query.search) {
      console.log(`Found ${data.query.search.length} search results`);
      
      let tateCount = 0;
      let lizaCount = 0;
      
      for (const result of data.query.search) {
        if (tateCount >= 3 && lizaCount >= 3) break;
        
        const title = result.title;
        const imageInfo = await scraper.getImageInfo(title);
        
        if (imageInfo && imageInfo.width >= 200 && imageInfo.height >= 200) {
          if (title.toLowerCase().includes('omega_ruby') || 
              title.toLowerCase().includes('alpha_sapphire') ||
              title.toLowerCase().includes('ruby_sapphire') ||
              title.toLowerCase().includes('emerald')) {
            
            if (tateCount < 3) {
              const localName = `tate-${tateCount + 1}.png`;
              await downloadImage(imageInfo.url, localName, 'gym-leaders');
              console.log(`Downloaded Tate image: ${localName}`);
              tateCount++;
            }
            
            if (lizaCount < 3) {
              const localName = `liza-${lizaCount + 1}.png`;
              await downloadImage(imageInfo.url, localName, 'gym-leaders');
              console.log(`Downloaded Liza image: ${localName}`);
              lizaCount++;
            }
          }
        }
      }
    }
  }
  
  // Now organize them
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const gymLeadersDir = '/Users/moazzam/Documents/GitHub/Mappy/DexTrends/public/images/scraped/gym-leaders';
  const organizedDir = '/Users/moazzam/Documents/GitHub/Mappy/DexTrends/public/images/scraped/gym-leaders-organized';
  
  // Move images to organized folder
  const files = await fs.readdir(gymLeadersDir);
  
  // Move Tate images
  const tateFiles = files.filter(f => f.startsWith('tate-'));
  for (let i = 0; i < tateFiles.length && i < 3; i++) {
    const src = path.join(gymLeadersDir, tateFiles[i]);
    const dest = path.join(organizedDir, i === 0 ? 'tate.png' : `tate-alt${i}.png`);
    await fs.rename(src, dest);
    console.log(`Moved ${tateFiles[i]} to organized folder`);
  }
  
  // Move Liza images
  const lizaFiles = files.filter(f => f.startsWith('liza-'));
  for (let i = 0; i < lizaFiles.length && i < 3; i++) {
    const src = path.join(gymLeadersDir, lizaFiles[i]);
    const dest = path.join(organizedDir, i === 0 ? 'liza.png' : `liza-alt${i}.png`);
    await fs.rename(src, dest);
    console.log(`Moved ${lizaFiles[i]} to organized folder`);
  }
  
  console.log('\n✅ Done!');
}

getTateLizaPair().catch(console.error);