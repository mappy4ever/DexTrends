const https = require('https');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const baseUrl = 'https://archives.bulbagarden.net';
const targetUrl = `${baseUrl}/wiki/Category:TCG_rarity_icons`;
const outputDir = path.join(__dirname, '..', 'public', 'images', 'TCG-rarity');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to download image
function downloadImage(imageUrl, fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outputDir, fileName);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ Already exists: ${fileName}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    
    https.get(imageUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${fileName}`);
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${fileName}`);
          resolve();
        });
      }
    }).on('error', reject);
  });
}

// Function to fetch page content
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Main scraping function
async function scrapeTCGRarityIcons() {
  try {
    console.log('Fetching TCG rarity icons page...');
    const html = await fetchPage(targetUrl);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Find all gallery items
    const galleryItems = document.querySelectorAll('.gallerybox');
    console.log(`Found ${galleryItems.length} rarity icons`);

    const downloadPromises = [];

    galleryItems.forEach((item) => {
      try {
        // Get the image link
        const imageLink = item.querySelector('.image img');
        if (!imageLink) return;

        // Get the thumbnail URL and convert to full-size URL
        let imageUrl = imageLink.src;
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }

        // Extract filename from gallery text or use URL
        const galleryText = item.querySelector('.gallerytext');
        let fileName = '';
        
        if (galleryText && galleryText.textContent) {
          // Clean up the filename
          fileName = galleryText.textContent.trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-\.]/g, '')
            .toLowerCase();
          
          // Add .png extension if not present
          if (!fileName.endsWith('.png') && !fileName.endsWith('.jpg')) {
            fileName += '.png';
          }
        } else {
          // Fallback to URL-based naming
          fileName = imageUrl.split('/').pop().split('?')[0];
        }

        // Get full-size image URL by removing thumbnail parameters
        const fullSizeUrl = imageUrl.replace(/\/thumb\//, '/').replace(/\/\d+px-[^\/]+$/, '');

        console.log(`Queuing download: ${fileName}`);
        downloadPromises.push(downloadImage(fullSizeUrl, fileName));

      } catch (error) {
        console.error('Error processing gallery item:', error);
      }
    });

    // Download all images
    console.log(`\nDownloading ${downloadPromises.length} images...`);
    await Promise.all(downloadPromises);

    console.log('\n✅ All TCG rarity icons downloaded successfully!');
    console.log(`Output directory: ${outputDir}`);

  } catch (error) {
    console.error('Error scraping TCG rarity icons:', error);
  }
}

// Run the scraper
scrapeTCGRarityIcons();