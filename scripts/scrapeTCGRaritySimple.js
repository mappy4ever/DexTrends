const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const outputDir = path.join(__dirname, '..', 'public', 'images', 'TCG-rarity');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Known TCG rarity icons from Bulbagarden archives
// These are the direct file URLs for the full-size images
const rarityIcons = [
  // Common rarities
  { name: 'common.png', url: 'https://archives.bulbagarden.net/media/upload/e/e7/Rarity_Common.png' },
  { name: 'uncommon.png', url: 'https://archives.bulbagarden.net/media/upload/e/e1/Rarity_Uncommon.png' },
  { name: 'rare.png', url: 'https://archives.bulbagarden.net/media/upload/8/88/Rarity_Rare.png' },
  
  // Holo and special rarities
  { name: 'rare-holo.png', url: 'https://archives.bulbagarden.net/media/upload/d/d4/Rarity_Rare_Holo.png' },
  { name: 'rare-holo-ex.png', url: 'https://archives.bulbagarden.net/media/upload/b/b0/Rarity_Rare_Holo_ex.png' },
  { name: 'rare-holo-gx.png', url: 'https://archives.bulbagarden.net/media/upload/1/1e/Rarity_Rare_Holo_GX.png' },
  { name: 'rare-holo-v.png', url: 'https://archives.bulbagarden.net/media/upload/a/ad/Rarity_Rare_Holo_V.png' },
  { name: 'rare-holo-vmax.png', url: 'https://archives.bulbagarden.net/media/upload/f/fa/Rarity_Rare_Holo_VMAX.png' },
  { name: 'rare-holo-vstar.png', url: 'https://archives.bulbagarden.net/media/upload/3/30/Rarity_Rare_Holo_VSTAR.png' },
  
  // Ultra and Secret rarities
  { name: 'rare-ultra.png', url: 'https://archives.bulbagarden.net/media/upload/5/5a/Rarity_Rare_Ultra.png' },
  { name: 'rare-secret.png', url: 'https://archives.bulbagarden.net/media/upload/e/e8/Rarity_Rare_Secret.png' },
  { name: 'rare-rainbow.png', url: 'https://archives.bulbagarden.net/media/upload/8/8b/Rarity_Rare_Rainbow.png' },
  { name: 'rare-shining.png', url: 'https://archives.bulbagarden.net/media/upload/a/ac/Rarity_Rare_Shining.png' },
  { name: 'rare-shiny.png', url: 'https://archives.bulbagarden.net/media/upload/9/99/Rarity_Rare_Shiny.png' },
  
  // Special types
  { name: 'rare-ace.png', url: 'https://archives.bulbagarden.net/media/upload/8/84/Rarity_Rare_ACE.png' },
  { name: 'rare-break.png', url: 'https://archives.bulbagarden.net/media/upload/f/fd/Rarity_Rare_BREAK.png' },
  { name: 'rare-prime.png', url: 'https://archives.bulbagarden.net/media/upload/6/67/Rarity_Rare_Prime.png' },
  { name: 'rare-prism-star.png', url: 'https://archives.bulbagarden.net/media/upload/a/a9/Rarity_Rare_Prism_Star.png' },
  { name: 'amazing-rare.png', url: 'https://archives.bulbagarden.net/media/upload/f/f1/Rarity_Amazing_Rare.png' },
  
  // Trainer Gallery and special sets
  { name: 'trainer-gallery.png', url: 'https://archives.bulbagarden.net/media/upload/5/5d/Rarity_TG.png' },
  { name: 'classic-collection.png', url: 'https://archives.bulbagarden.net/media/upload/7/72/Rarity_Classic_Collection.png' },
  
  // Scarlet & Violet era
  { name: 'double-rare.png', url: 'https://archives.bulbagarden.net/media/upload/4/44/Rarity_Double_Rare.png' },
  { name: 'illustration-rare.png', url: 'https://archives.bulbagarden.net/media/upload/e/ef/Rarity_Illustration_Rare.png' },
  { name: 'ultra-rare.png', url: 'https://archives.bulbagarden.net/media/upload/b/b1/Rarity_Ultra_Rare.png' },
  { name: 'special-illustration-rare.png', url: 'https://archives.bulbagarden.net/media/upload/c/c9/Rarity_Special_Illustration_Rare.png' },
  { name: 'hyper-rare.png', url: 'https://archives.bulbagarden.net/media/upload/5/58/Rarity_Hyper_Rare.png' },
  
  // Promotional
  { name: 'promo.png', url: 'https://archives.bulbagarden.net/media/upload/d/d0/Rarity_Promo.png' }
];

// Function to download image
function downloadImage(imageData) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outputDir, imageData.name);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ Already exists: ${imageData.name}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    
    https.get(imageData.url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${imageData.name}`);
            resolve();
          });
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${imageData.name}`);
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(filePath);
        console.log(`✗ Failed to download ${imageData.name}: HTTP ${response.statusCode}`);
        resolve(); // Continue with other downloads
      }
    }).on('error', (err) => {
      console.error(`✗ Error downloading ${imageData.name}:`, err.message);
      resolve(); // Continue with other downloads
    });
  });
}

// Main function
async function downloadAllRarityIcons() {
  console.log('Starting TCG rarity icon downloads...');
  console.log(`Output directory: ${outputDir}\n`);

  // Download all icons with a small delay between each
  for (const icon of rarityIcons) {
    await downloadImage(icon);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ TCG rarity icon download process completed!');
  
  // List downloaded files
  const files = fs.readdirSync(outputDir);
  console.log(`\nDownloaded ${files.length} files:`);
  files.forEach(file => console.log(`  - ${file}`));
}

// Run the downloader
downloadAllRarityIcons();