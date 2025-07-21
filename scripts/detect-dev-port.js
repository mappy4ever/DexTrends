#!/usr/bin/env node

/**
 * Detects the port where the Next.js dev server is running
 * Checks common ports and returns the first accessible one
 */

const http = require('http');

const checkPort = (port) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 2000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; port-detector/1.0)'
      }
    };

    const req = http.request(options, (res) => {
      // Any response means the server is running
      resolve({ port, available: true, status: res.statusCode });
    });

    req.on('error', (err) => {
      // ECONNREFUSED means port is not in use
      if (err.code === 'ECONNREFUSED') {
        resolve({ port, available: false });
      } else {
        // Other errors might mean the server is there but not responding properly
        resolve({ port, available: true, status: 'error' });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ port, available: false });
    });

    req.end();
  });
};

const findDevServerPort = async () => {
  // Common ports to check
  const portsToCheck = [
    3000, // Default Next.js port
    3001, // First fallback
    3002, // Second fallback
    3003, // Third fallback
    8080, // Common alternative
    8000, // Another common alternative
  ];

  // Check if PORT env var is set
  if (process.env.PORT) {
    portsToCheck.unshift(parseInt(process.env.PORT));
  }

  for (const port of portsToCheck) {
    const result = await checkPort(port);
    if (result.available) {
      return port;
    }
  }

  return null;
};

// If run directly, output the port
if (require.main === module) {
  findDevServerPort().then(port => {
    if (port) {
      console.log(port);
      process.exit(0);
    } else {
      console.error('No dev server found on common ports');
      process.exit(1);
    }
  });
}

module.exports = { findDevServerPort };