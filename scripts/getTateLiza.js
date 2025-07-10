#!/usr/bin/env node
// Quick script to get Tate and Liza images
import { gymLeaderDirectScraper } from '../utils/scrapers/gymLeaderDirectScraper.js';

async function getTateLiza() {
  console.log('Fetching Tate and Liza images...\n');
  
  const scraper = new gymLeaderDirectScraper.constructor();
  
  // Scrape Tate
  console.log('Scraping Tate...');
  const tateFiles = await scraper.scrapeCharacter('Tate', 'gym-leaders');
  console.log(`Downloaded ${tateFiles.length} images for Tate\n`);
  
  // Scrape Liza
  console.log('Scraping Liza...');
  const lizaFiles = await scraper.scrapeCharacter('Liza', 'gym-leaders');
  console.log(`Downloaded ${lizaFiles.length} images for Liza\n`);
  
  // Now organize them
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const gymLeadersDir = '/Users/moazzam/Documents/GitHub/Mappy/DexTrends/public/images/scraped/gym-leaders';
  const organizedDir = '/Users/moazzam/Documents/GitHub/Mappy/DexTrends/public/images/scraped/gym-leaders-organized';
  
  // Move best Tate images
  if (tateFiles.length > 0) {
    for (let i = 0; i < Math.min(3, tateFiles.length); i++) {
      const src = path.join(gymLeadersDir, tateFiles[i].local);
      const dest = path.join(organizedDir, i === 0 ? 'tate.png' : `tate-alt${i}.png`);
      await fs.rename(src, dest);
      console.log(`Moved ${tateFiles[i].local} to organized folder`);
    }
  }
  
  // Move best Liza images
  if (lizaFiles.length > 0) {
    for (let i = 0; i < Math.min(3, lizaFiles.length); i++) {
      const src = path.join(gymLeadersDir, lizaFiles[i].local);
      const dest = path.join(organizedDir, i === 0 ? 'liza.png' : `liza-alt${i}.png`);
      await fs.rename(src, dest);
      console.log(`Moved ${lizaFiles[i].local} to organized folder`);
    }
  }
  
  console.log('\n✅ Done!');
}

getTateLiza().catch(console.error);