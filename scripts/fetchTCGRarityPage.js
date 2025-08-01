const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to fetch the HTML page
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    let data = '';
    https.get(url, (response) => {
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Main function
async function fetchAndExtractImageUrls() {
  try {
    console.log('Fetching Bulbagarden TCG rarity page...');
    const html = await fetchPage('https://archives.bulbagarden.net/wiki/Category:TCG_rarity_icons');
    
    // Save HTML for inspection
    fs.writeFileSync(path.join(__dirname, 'tcg-rarity-page.html'), html);
    console.log('Saved HTML to tcg-rarity-page.html');
    
    // Extract image URLs using regex
    const imageRegex = /src="(\/\/archives\.bulbagarden\.net\/media\/upload\/[^"]+\.png)"/g;
    const fullImageRegex = /href="(\/wiki\/File:[^"]+)"/g;
    
    const thumbnailUrls = [];
    const filePages = [];
    
    let match;
    while ((match = imageRegex.exec(html)) !== null) {
      thumbnailUrls.push('https:' + match[1]);
    }
    
    while ((match = fullImageRegex.exec(html)) !== null) {
      if (match[1].includes('Rarity_')) {
        filePages.push('https://archives.bulbagarden.net' + match[1]);
      }
    }
    
    console.log('\nFound thumbnail URLs:');
    thumbnailUrls.forEach(url => console.log(url));
    
    console.log('\nFound file pages:');
    filePages.forEach(url => console.log(url));
    
    // Extract actual full-size URLs from thumbnails
    console.log('\nConverted full-size URLs:');
    const fullSizeUrls = thumbnailUrls.map(url => {
      // Remove /thumb/ and size info to get full-size URL
      const fullSize = url
        .replace('/thumb/', '/')
        .replace(/\/\d+px-[^\/]+$/, '');
      console.log(fullSize);
      return fullSize;
    });
    
    // Save URLs to file
    const urlData = {
      thumbnails: thumbnailUrls,
      filePages: filePages,
      fullSize: fullSizeUrls
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'tcg-rarity-urls.json'), 
      JSON.stringify(urlData, null, 2)
    );
    
    console.log('\nSaved all URLs to tcg-rarity-urls.json');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the fetcher
fetchAndExtractImageUrls();