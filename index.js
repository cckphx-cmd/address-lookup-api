const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const Fuse = require('fuse.js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for Voiceflow
app.use(cors());
app.use(express.json());

// Store addresses in memory
let addresses = [];

// Load addresses from CSV on startup
function loadAddresses() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream('addresses.csv')
      .pipe(csv())
      .on('data', (data) => {
        if (data.Address && data.Address.trim()) {
          results.push({ address: data.Address.trim() });
        }
      })
      .on('end', () => {
        addresses = results;
        console.log(`Loaded ${addresses.length} addresses`);
        resolve();
      })
      .on('error', reject);
  });
}

// Configure Fuse.js for fuzzy matching
const fuseOptions = {
  keys: ['address'],
  threshold: 0.4, // 0 = exact match, 1 = match anything
  distance: 100,
  minMatchCharLength: 3,
  includeScore: true
};

// API endpoint for address lookup
app.post('/lookup', (req, res) => {
  const { query } = req.body;

  if (!query || query.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Query must be at least 3 characters'
    });
  }

  // Create new Fuse instance with current addresses
  const fuse = new Fuse(addresses, fuseOptions);

  // Search for matches
  const results = fuse.search(query.trim());

  if (results.length === 0) {
    return res.json({
      success: false,
      message: `No matching address found for "${query}"`
    });
  }

  // Get the best match
  const bestMatch = results[0];
  const confidence = Math.round((1 - bestMatch.score) * 100);

  return res.json({
    success: true,
    query: query,
    match: bestMatch.item.address,
    confidence: confidence,
    alternates: results.slice(1, 4).map(r => ({
      address: r.item.address,
      confidence: Math.round((1 - r.score) * 100)
    }))
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    addressCount: addresses.length
  });
});

// Start server
loadAddresses().then(() => {
  app.listen(PORT, () => {
    console.log(`Address Lookup API running on http://localhost:${PORT}`);
    console.log(`Test it: curl -X POST http://localhost:${PORT}/lookup -H "Content-Type: application/json" -d '{"query":"2133 w edgemint"}'`);
  });
}).catch(err => {
  console.error('Failed to load addresses:', err);
  process.exit(1);
});
