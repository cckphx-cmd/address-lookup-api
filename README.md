# Address Lookup API

Fuzzy address matching API for Tree Grant Eligible Addresses chatbot.

## Features

- 🔍 Fuzzy string matching using Fuse.js
- 📍 651 eligible addresses loaded from CSV
- 🎯 Confidence scoring for matches
- 🔄 Alternative suggestions
- 🌐 CORS enabled for Voiceflow integration

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start
```

Server runs on http://localhost:3001

## Test It

```bash
curl -X POST http://localhost:3001/lookup \
  -H "Content-Type: application/json" \
  -d '{"query":"2133 w edgemint"}'
```

**Response:**
```json
{
  "success": true,
  "match": "2133 W EDGEMONT AVE",
  "confidence": 74
}
```

## Voiceflow Integration

See [VOICEFLOW_INTEGRATION.md](./VOICEFLOW_INTEGRATION.md) for complete setup instructions.

## API Endpoints

### `POST /lookup`
Search for an address match.

**Request:**
```json
{
  "query": "address to search"
}
```

**Response:**
```json
{
  "success": true,
  "query": "user input",
  "match": "MATCHED ADDRESS",
  "confidence": 85,
  "alternates": [
    {"address": "ALTERNATE 1", "confidence": 70},
    {"address": "ALTERNATE 2", "confidence": 65}
  ]
}
```

### `GET /health`
Check API status.

**Response:**
```json
{
  "status": "ok",
  "addressCount": 651
}
```

## Files

- `index.js` - Main API server
- `addresses.csv` - 651 eligible addresses
- `package.json` - Dependencies
- `VOICEFLOW_INTEGRATION.md` - Detailed integration guide

## Deployment

Deploy to Railway, Vercel, or any Node.js hosting platform.

See deployment instructions in [VOICEFLOW_INTEGRATION.md](./VOICEFLOW_INTEGRATION.md).

## Configuration

Adjust fuzzy matching sensitivity in `index.js`:

```javascript
const fuseOptions = {
  threshold: 0.4  // 0 = exact match, 1 = match anything
};
```

## Tech Stack

- Node.js
- Express.js
- Fuse.js (fuzzy matching)
- csv-parser
- CORS
