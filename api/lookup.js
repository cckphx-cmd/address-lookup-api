const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Fuse = require('fuse.js');

// Cache for addresses (persists across function invocations)
let addressesCache = null;

// Load addresses from CSV
async function loadAddresses() {
  if (addressesCache) {
    return addressesCache;
  }

  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(process.cwd(), 'public', 'addresses.csv');

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (data.Address && data.Address.trim()) {
          results.push({ address: data.Address.trim() });
        }
      })
      .on('end', () => {
        addressesCache = results;
        console.log(`Loaded ${results.length} addresses`);
        resolve(results);
      })
      .on('error', reject);
  });
}

// Configure Fuse.js for fuzzy matching
const fuseOptions = {
  keys: ['address'],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 3,
  includeScore: true
};

// Serverless function handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;

  if (!query || query.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Query must be at least 3 characters'
    });
  }

  try {
    // Load addresses
    const addresses = await loadAddresses();

    // Create Fuse instance
    const fuse = new Fuse(addresses, fuseOptions);

    // Search for matches
    const results = fuse.search(query.trim());

    if (results.length === 0) {
      return res.status(200).json({
        success: false,
        message: `No matching address found for "${query}"`
      });
    }

    // Get the best match
    const bestMatch = results[0];
    const confidence = Math.round((1 - bestMatch.score) * 100);

    return res.status(200).json({
      success: true,
      query: query,
      match: bestMatch.item.address,
      confidence: confidence,
      alternates: results.slice(1, 4).map(r => ({
        address: r.item.address,
        confidence: Math.round((1 - r.score) * 100)
      }))
    });
  } catch (error) {
    console.error('Lookup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
