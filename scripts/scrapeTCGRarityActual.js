const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const outputDir = path.join(__dirname, '..', 'public', 'images', 'TCG-rarity');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Actual TCG rarity icons from Bulbagarden archives (verified URLs)
const rarityIcons = [
  // Letters and basic
  { name: 'rarity-a.png', url: 'https://archives.bulbagarden.net/media/upload/2/2d/Rarity_A.png' },
  { name: 'rarity-c.png', url: 'https://archives.bulbagarden.net/media/upload/f/f9/Rarity_C.png' },
  { name: 'rarity-cc.png', url: 'https://archives.bulbagarden.net/media/upload/7/72/Rarity_CC.png' },
  { name: 'rarity-common.png', url: 'https://archives.bulbagarden.net/media/upload/2/20/Rarity_Common_SV.png' },
  { name: 'rarity-uncommon.png', url: 'https://archives.bulbagarden.net/media/upload/d/d0/Rarity_Uncommon_SV.png' },
  { name: 'rarity-rare.png', url: 'https://archives.bulbagarden.net/media/upload/d/d5/Rarity_Rare_SV.png' },
  
  // Holo variants
  { name: 'rarity-h.png', url: 'https://archives.bulbagarden.net/media/upload/3/32/Rarity_H.png' },
  { name: 'rarity-hr.png', url: 'https://archives.bulbagarden.net/media/upload/d/d2/Rarity_HR.png' },
  { name: 'rarity-rare-holo.png', url: 'https://archives.bulbagarden.net/media/upload/0/08/Rarity_Rare_Holo_SV.png' },
  
  // Special/Ultra rare
  { name: 'rarity-rrr.png', url: 'https://archives.bulbagarden.net/media/upload/6/60/Rarity_RRR.png' },
  { name: 'rarity-rr.png', url: 'https://archives.bulbagarden.net/media/upload/f/fc/Rarity_RR.png' },
  { name: 'rarity-sr.png', url: 'https://archives.bulbagarden.net/media/upload/e/ed/Rarity_SR.png' },
  { name: 'rarity-ssr.png', url: 'https://archives.bulbagarden.net/media/upload/2/28/Rarity_SSR.png' },
  { name: 'rarity-sar.png', url: 'https://archives.bulbagarden.net/media/upload/9/9c/Rarity_SAR.png' },
  { name: 'rarity-ur.png', url: 'https://archives.bulbagarden.net/media/upload/c/c1/Rarity_UR.png' },
  
  // ACE variants
  { name: 'rarity-ace.png', url: 'https://archives.bulbagarden.net/media/upload/4/44/Rarity_ACE.png' },
  { name: 'rarity-ace-spec-rare.png', url: 'https://archives.bulbagarden.net/media/upload/f/f6/Rarity_ACE_SPEC_Rare.png' },
  
  // Amazing Rare
  { name: 'rarity-ar.png', url: 'https://archives.bulbagarden.net/media/upload/4/42/Rarity_AR.png' },
  
  // K variant
  { name: 'rarity-k.png', url: 'https://archives.bulbagarden.net/media/upload/d/d4/Rarity_K.png' },
  
  // PR (Promo)
  { name: 'rarity-pr.png', url: 'https://archives.bulbagarden.net/media/upload/3/30/Rarity_PR.png' },
  
  // R variants
  { name: 'rarity-r.png', url: 'https://archives.bulbagarden.net/media/upload/0/0f/Rarity_R.png' },
  
  // Shiny variants
  { name: 'rarity-sh.png', url: 'https://archives.bulbagarden.net/media/upload/e/e3/Rarity_SH.png' },
  { name: 'rarity-shiny-common.png', url: 'https://archives.bulbagarden.net/media/upload/3/38/Rarity_Shiny_C.png' },
  { name: 'rarity-shiny-r.png', url: 'https://archives.bulbagarden.net/media/upload/d/d3/Rarity_Shiny_R.png' },
  { name: 'rarity-shiny-rr.png', url: 'https://archives.bulbagarden.net/media/upload/3/3f/Rarity_Shiny_RR.png' },
  { name: 'rarity-shiny-uc.png', url: 'https://archives.bulbagarden.net/media/upload/e/ee/Rarity_Shiny_UC.png' },
  
  // TR variant
  { name: 'rarity-tr.png', url: 'https://archives.bulbagarden.net/media/upload/7/74/Rarity_TR.png' },
  
  // U/UC variants
  { name: 'rarity-u.png', url: 'https://archives.bulbagarden.net/media/upload/8/84/Rarity_U.png' },
  { name: 'rarity-uc.png', url: 'https://archives.bulbagarden.net/media/upload/1/1f/Rarity_UC.png' },
  
  // Black & White era
  { name: 'rarity-black-white-rare.png', url: 'https://archives.bulbagarden.net/media/upload/f/fb/Rarity_Black_White_Rare.png' },
  
  // Trainer Gallery
  { name: 'rarity-tg.png', url: 'https://archives.bulbagarden.net/media/upload/5/54/Rarity_TG.png' },
  
  // Scarlet & Violet specific
  { name: 'rarity-double-rare.png', url: 'https://archives.bulbagarden.net/media/upload/2/2e/Rarity_Double_Rare_SV.png' },
  { name: 'rarity-illustration-rare.png', url: 'https://archives.bulbagarden.net/media/upload/f/fa/Rarity_Illustration_Rare_SV.png' },
  { name: 'rarity-ultra-rare.png', url: 'https://archives.bulbagarden.net/media/upload/b/b9/Rarity_Ultra_Rare_SV.png' },
  { name: 'rarity-special-illustration-rare.png', url: 'https://archives.bulbagarden.net/media/upload/1/19/Rarity_Special_Illustration_Rare_SV.png' },
  { name: 'rarity-hyper-rare.png', url: 'https://archives.bulbagarden.net/media/upload/e/e2/Rarity_Hyper_Rare_SV.png' }
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
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n✅ TCG rarity icon download process completed!');
  
  // List downloaded files
  const files = fs.readdirSync(outputDir);
  console.log(`\nDownloaded ${files.length} files:`);
  files.forEach(file => console.log(`  - ${file}`));
}

// Run the downloader
downloadAllRarityIcons();