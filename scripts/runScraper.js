#!/usr/bin/env node
// Scraper CLI Tool
// Run this script to scrape data from Bulbapedia

import { fileURLToPath } from 'url';
import path from 'path';
import { gymLeaderScraper } from '../utils/scrapers/gymLeaderScraper.js';
import { gameScraper } from '../utils/scrapers/gameScraper.js';
import { badgeScraper } from '../utils/scrapers/badgeScraper.js';
import { eliteFourScraper } from '../utils/scrapers/eliteFourScraper.js';
import { energyScraper } from '../utils/scrapers/energyScraper.js';
import { regionMapScraper } from '../utils/scrapers/regionMapScraper.js';
import { archivesCategoryScraper } from '../utils/scrapers/archivesCategoryScraper.js';
import { gymLeaderDirectScraper } from '../utils/scrapers/gymLeaderDirectScraper.js';
import { ensureDirectory } from '../utils/scrapers/scraperUtils.js';
import scraperConfig from '../utils/scrapers/scraperConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Setup directories
async function setupDirectories() {
  colorLog('blue', '📁 Setting up directories...');
  
  const directories = [
    path.join(projectRoot, scraperConfig.storage.dataDir),
    path.join(projectRoot, scraperConfig.storage.imagesDir),
    path.join(projectRoot, scraperConfig.storage.gymLeadersDir),
    path.join(projectRoot, scraperConfig.storage.gamesDir),
    path.join(projectRoot, scraperConfig.storage.pokemonDir),
    path.join(projectRoot, scraperConfig.storage.badgesDir),
    path.join(projectRoot, scraperConfig.storage.cacheDir),
    path.join(projectRoot, scraperConfig.storage.eliteFourDir),
    path.join(projectRoot, scraperConfig.storage.energyDir),
    path.join(projectRoot, scraperConfig.storage.mapsDir),
    path.join(projectRoot, scraperConfig.storage.dataDir, 'gym-leaders'),
    path.join(projectRoot, scraperConfig.storage.dataDir, 'games'),
    path.join(projectRoot, scraperConfig.storage.dataDir, 'pokemon'),
    path.join(projectRoot, scraperConfig.storage.dataDir, 'badges'),
    path.join(projectRoot, scraperConfig.storage.dataDir, 'elite-four'),
    path.join(projectRoot, scraperConfig.storage.dataDir, 'energy'),
    path.join(projectRoot, scraperConfig.storage.dataDir, 'maps'),
    path.join(projectRoot, scraperConfig.storage.dataDir, 'archives'),
    path.join(projectRoot, scraperConfig.storage.imagesDir, 'archives'),
    path.join(projectRoot, scraperConfig.storage.imagesDir, 'tcg-pocket-rarity')
  ];

  for (const dir of directories) {
    await ensureDirectory(dir);
  }
  
  colorLog('green', '✅ Directories created successfully');
}

// Display help
function showHelp() {
  colorLog('cyan', `
🔧 DexTrends Bulbapedia Scraper

Usage: node scripts/runScraper.js [command] [options]

Commands:
  gym-leaders  Scrape all gym leader data and images
  elite-four   Scrape all Elite Four and Champion data
  badges       Scrape all gym badge images
  games        Scrape all Pokemon game data and images
  energy       Scrape TCG energy type images
  maps         Scrape high-quality region maps
  archives     Scrape from Bulbagarden Archives categories
  gym-direct   Direct scrape gym leaders from character categories
  elite-direct Direct scrape elite four from character categories
  champion-direct Direct scrape champions from character categories
  all          Scrape everything
  setup        Setup required directories only
  help         Show this help message

Options:
  --region [region]  Only scrape specific region (for gym-leaders)
                     Regions: kanto, johto, hoenn, sinnoh, unova, kalos, alola, galar, paldea
  
  --cache            Use cached data when available
  --no-images        Skip image downloads
  --verbose          Show detailed logging
  --limit [number]   Override the default download limit for archives scraping
  --categories       Comma-separated list of categories to scrape (archives only)

Examples:
  node scripts/runScraper.js setup
  node scripts/runScraper.js gym-leaders
  node scripts/runScraper.js gym-leaders --region kanto
  node scripts/runScraper.js games
  node scripts/runScraper.js archives
  node scripts/runScraper.js archives --limit 300
  node scripts/runScraper.js archives --categories gymLeaderArt,eliteFourArt --limit 200
  node scripts/runScraper.js all
`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: args[0] || 'help',
    region: null,
    cache: false,
    images: true,
    verbose: false,
    limit: null,
    categories: null
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--region':
        options.region = args[i + 1];
        i++;
        break;
      case '--cache':
        options.cache = true;
        break;
      case '--no-images':
        options.images = false;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--limit':
        options.limit = parseInt(args[i + 1]);
        i++;
        break;
      case '--categories':
        options.categories = args[i + 1];
        i++;
        break;
    }
  }

  return options;
}

// Scrape gym leaders
async function scrapeGymLeaders(options) {
  colorLog('magenta', '🏟️  Starting gym leader scraping...');
  
  try {
    if (options.region) {
      colorLog('yellow', `Scraping ${options.region} gym leaders only...`);
      // TODO: Implement region-specific scraping
      const data = await gymLeaderScraper.scrapeAllGymLeaders();
      return data[options.region] || [];
    } else {
      const data = await gymLeaderScraper.scrapeAllGymLeaders();
      colorLog('green', `✅ Successfully scraped ${Object.keys(data).length} regions`);
      
      // Show summary
      for (const [region, leaders] of Object.entries(data)) {
        colorLog('cyan', `  ${region}: ${leaders.length} gym leaders`);
      }
      
      return data;
    }
  } catch (error) {
    colorLog('red', `❌ Error scraping gym leaders: ${error.message}`);
    throw error;
  }
}

// Scrape games
async function scrapeGames(options) {
  colorLog('magenta', '🎮 Starting game scraping...');
  
  try {
    const data = await gameScraper.scrapeAllGames();
    colorLog('green', `✅ Successfully scraped ${data.length} games`);
    return data;
  } catch (error) {
    colorLog('red', `❌ Error scraping games: ${error.message}`);
    throw error;
  }
}

// Scrape Elite Four
async function scrapeEliteFour(options) {
  colorLog('magenta', '👑 Starting Elite Four scraping...');
  
  try {
    const data = await eliteFourScraper.scrapeAllEliteFour();
    colorLog('green', `✅ Successfully scraped Elite Four and Champions`);
    
    // Show summary
    let totalMembers = 0;
    for (const [region, members] of Object.entries(data)) {
      if (region !== 'champions') {
        colorLog('cyan', `  ${region}: ${members.length} Elite Four members`);
        totalMembers += members.length;
      }
    }
    if (data.champions) {
      const championCount = Object.values(data.champions).flat().length;
      colorLog('cyan', `  Champions: ${championCount} total`);
    }
    
    return data;
  } catch (error) {
    colorLog('red', `❌ Error scraping Elite Four: ${error.message}`);
    throw error;
  }
}

// Scrape badges
async function scrapeBadges(options) {
  colorLog('magenta', '🏅 Starting badge scraping...');
  
  try {
    const data = await badgeScraper.scrapeAllBadges();
    colorLog('green', `✅ Successfully scraped badges`);
    
    // Show summary
    for (const [region, badges] of Object.entries(data)) {
      colorLog('cyan', `  ${region}: ${badges.length} badges`);
    }
    
    return data;
  } catch (error) {
    colorLog('red', `❌ Error scraping badges: ${error.message}`);
    throw error;
  }
}

// Scrape energy types
async function scrapeEnergy(options) {
  colorLog('magenta', '⚡ Starting TCG energy type scraping...');
  
  try {
    const data = await energyScraper.scrapeAllEnergyTypes();
    colorLog('green', `✅ Successfully scraped ${Object.keys(data).length} energy types`);
    
    // Show summary
    for (const [type, energyData] of Object.entries(data)) {
      const imageCount = 1 + energyData.images.special.length + energyData.images.cards.length;
      colorLog('cyan', `  ${type}: ${imageCount} images`);
    }
    
    return data;
  } catch (error) {
    colorLog('red', `❌ Error scraping energy types: ${error.message}`);
    throw error;
  }
}

// Scrape region maps
async function scrapeMaps(options) {
  colorLog('magenta', '🗺️  Starting region map scraping...');
  
  try {
    const data = await regionMapScraper.scrapeAllRegionMaps();
    colorLog('green', `✅ Successfully scraped ${Object.keys(data).length} region maps`);
    
    // Show summary
    for (const [region, mapData] of Object.entries(data)) {
      const totalMaps = 1 + mapData.maps.variants.length + mapData.maps.detailed.length;
      colorLog('cyan', `  ${region}: ${totalMaps} maps`);
    }
    
    return data;
  } catch (error) {
    colorLog('red', `❌ Error scraping maps: ${error.message}`);
    throw error;
  }
}

// Scrape from Bulbagarden Archives categories
async function scrapeArchives(options) {
  colorLog('magenta', '📦 Starting Bulbagarden Archives category scraping...');
  
  try {
    // If specific categories requested
    if (options.categories) {
      const categories = options.categories.split(',');
      const data = await archivesCategoryScraper.scrapeCategories(categories, options.limit);
      colorLog('green', `✅ Successfully scraped ${categories.length} categories`);
      return data;
    }
    
    // Otherwise scrape all categories
    const data = await archivesCategoryScraper.scrapeAllCategories(options.limit);
    colorLog('green', `✅ Successfully scraped all Archive categories`);
    
    // Show summary
    for (const [key, categoryData] of Object.entries(data)) {
      colorLog('cyan', `  ${categoryData.category}: ${categoryData.downloadedFiles} files`);
    }
    
    return data;
  } catch (error) {
    colorLog('red', `❌ Error scraping archives: ${error.message}`);
    throw error;
  }
}

// Main function
async function main() {
  const options = parseArgs();
  
  colorLog('bright', '🚀 DexTrends Bulbapedia Scraper');
  colorLog('blue', '================================');
  
  if (options.verbose) {
    console.log('Options:', options);
  }

  try {
    // Always setup directories first
    await setupDirectories();

    switch (options.command) {
      case 'help':
        showHelp();
        break;

      case 'setup':
        colorLog('green', '✅ Setup completed successfully');
        break;

      case 'gym-leaders':
        await scrapeGymLeaders(options);
        break;

      case 'games':
        await scrapeGames(options);
        break;

      case 'elite-four':
        await scrapeEliteFour(options);
        break;

      case 'badges':
        await scrapeBadges(options);
        break;

      case 'energy':
        await scrapeEnergy(options);
        break;

      case 'maps':
        await scrapeMaps(options);
        break;

      case 'archives':
        await scrapeArchives(options);
        break;

      case 'gym-direct':
        await gymLeaderDirectScraper.scrapeAllGymLeaders();
        break;

      case 'elite-direct':
        await gymLeaderDirectScraper.scrapeAllEliteFour();
        break;

      case 'champion-direct':
        await gymLeaderDirectScraper.scrapeAllChampions();
        break;

      case 'all':
        colorLog('cyan', '🔄 Starting comprehensive scraping...');
        await scrapeGymLeaders(options);
        await scrapeEliteFour(options);
        await scrapeBadges(options);
        await scrapeGames(options);
        await scrapeEnergy(options);
        await scrapeMaps(options);
        colorLog('green', '🎉 All scraping completed successfully!');
        break;

      default:
        colorLog('red', `❌ Unknown command: ${options.command}`);
        showHelp();
        process.exit(1);
    }

  } catch (error) {
    colorLog('red', `💥 Fatal error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  colorLog('red', '💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  colorLog('red', '💥 Uncaught Exception:', error.message);
  process.exit(1);
});

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}