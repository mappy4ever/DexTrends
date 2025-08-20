#!/usr/bin/env node

/**
 * Test that pages are loading complete datasets
 */

const http = require('http');

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testDataCompleteness() {
  console.log('🧪 Testing Data Completeness on Pages...\n');
  
  const tests = [
    {
      name: 'Items Page',
      path: '/pokemon/items',
      expectedMin: 2000,
      searchText: 'Explore all',
      dataPattern: /Explore all (\d+) items/
    },
    {
      name: 'Abilities Page', 
      path: '/pokemon/abilities',
      expectedMin: 350,
      searchText: 'Discover all',
      dataPattern: /Discover all (\d+) unique abilities/
    },
    {
      name: 'Moves Page',
      path: '/pokemon/moves',
      expectedMin: 900,
      searchText: 'Explore all',
      dataPattern: /Explore all (\d+) moves/
    }
  ];

  for (const test of tests) {
    console.log(`📊 Testing ${test.name}...`);
    
    try {
      const html = await fetchPage(test.path);
      
      // Check if page loaded
      if (html.includes('Loading...')) {
        console.log('⏳ Page is still loading data...');
        
        // Wait and retry
        console.log('⏳ Waiting 10 seconds for data to load...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const retryHtml = await fetchPage(test.path);
        
        if (retryHtml.includes('Loading...')) {
          console.log('⚠️ Page still loading after 10 seconds');
        } else {
          const match = retryHtml.match(test.dataPattern);
          if (match) {
            const count = parseInt(match[1]);
            console.log(`✅ Found ${count} items`);
            if (count >= test.expectedMin) {
              console.log(`✅ Meets minimum requirement of ${test.expectedMin}`);
            } else {
              console.log(`❌ Below minimum requirement of ${test.expectedMin}`);
            }
          } else {
            console.log('❌ Could not find data count in page');
          }
        }
      } else {
        // Check for data count
        const match = html.match(test.dataPattern);
        if (match) {
          const count = parseInt(match[1]);
          console.log(`✅ Found ${count} items`);
          if (count >= test.expectedMin) {
            console.log(`✅ Meets minimum requirement of ${test.expectedMin}`);
          } else {
            console.log(`❌ Below minimum requirement of ${test.expectedMin}`);
          }
        } else {
          console.log('❌ Could not find data count in page');
        }
      }
      
      // Check for pagination
      if (html.includes('Page 1 of')) {
        const pageMatch = html.match(/Page 1 of (\d+)/);
        if (pageMatch) {
          console.log(`📄 Has ${pageMatch[1]} pages of data`);
        }
      }
      
      // Check for search functionality
      if (html.includes('placeholder="Search')) {
        console.log('🔍 Search functionality present');
      }
      
      // Check for filters
      if (html.includes('Sort by') || html.includes('Filter')) {
        console.log('🎚️ Filtering/sorting options present');
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${test.name}:`, error.message);
    }
    
    console.log('---\n');
  }
  
  console.log('✅ Test complete!');
  console.log('\n📝 Note: If pages show "Loading...", they may be fetching data from the API.');
  console.log('The pages cache data after first load, so subsequent visits will be instant.');
}

testDataCompleteness().catch(console.error);