# Voiceflow Integration Guide

## Overview
This API provides fuzzy address matching for your Tree Grant Eligible Addresses chatbot in Voiceflow.

**Example:**
- User types: `2133 w edgemint` (misspelled)
- API returns: `2133 W EDGEMONT AVE` (correct match)
- Confidence: 74%

---

## API Details

**Endpoint:** `POST http://localhost:3001/lookup`

**Request:**
```json
{
  "query": "2133 w edgemint"
}
```

**Response:**
```json
{
  "success": true,
  "query": "2133 w edgemint",
  "match": "2133 W EDGEMONT AVE",
  "confidence": 74,
  "alternates": [
    {"address": "2130 W EDGEMONT AVE", "confidence": 63},
    {"address": "2033 W EDGEMONT AVE", "confidence": 63}
  ]
}
```

---

## Voiceflow Setup

### Step 1: Deploy the API

You need to deploy this API to a public URL so Voiceflow can access it.

**Option A: Railway (Recommended - Free tier)**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your GitHub account and create a new repo for this code
5. Railway will auto-detect Node.js and deploy
6. Copy your public URL (e.g., `https://your-app.railway.app`)

**Option B: Vercel (Free)**
1. Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.js" }]
}
```
2. Run: `npm install -g vercel && vercel`
3. Follow prompts to deploy

**Option C: ngrok (Testing only - not permanent)**
1. Download ngrok: https://ngrok.com/download
2. Run: `ngrok http 3001`
3. Copy the public URL (e.g., `https://abc123.ngrok.io`)
4. **Note:** This URL changes every time you restart ngrok

---

### Step 2: Create Voiceflow Flow

Here's the conversation flow structure:

```
1. [Capture Block] - Get user's address input
   ↓
2. [API Block] - Call lookup API
   ↓
3. [Condition Block] - Check if match found
   ↓
4a. [Text Block] - Ask "Did you mean {match}?"
   ↓
5. [Buttons Block] - Yes / No / Try Again
   ↓
6a. [Yes] → Store address → Next step
6b. [No] → Show alternates or ask to re-enter
6c. [Try Again] → Back to step 1
```

---

### Step 3: Configure API Block in Voiceflow

1. **Add API Block** to your canvas
2. **Configure Request:**
   - Method: `POST`
   - URL: `https://your-deployed-url.com/lookup`
   - Body Type: `JSON`
   - Body Content:
   ```json
   {
     "query": "{user_address}"
   }
   ```
   (Replace `{user_address}` with your Capture variable)

3. **Map Response:**
   - Variable: `address_match` → `{response.match}`
   - Variable: `confidence` → `{response.confidence}`
   - Variable: `success` → `{response.success}`

4. **Add Condition Block:**
   ```
   IF {success} == true
     → Show confirmation
   ELSE
     → No match found, ask to try again
   ```

---

### Step 4: Confirmation Flow

**Text Block:**
```
Did you mean **{address_match}**?
```

**Buttons Block:**
- Button 1: "Yes, that's correct"
  - Action: Set variable `confirmed_address = {address_match}`
  - Go to: Next step in your flow

- Button 2: "No, that's not right"
  - Action: Show alternates or ask to re-enter

- Button 3: "Try again"
  - Action: Go back to address input

---

### Step 5: Store Address

When user confirms "Yes":

1. **Set Block:**
   - Variable: `confirmed_address`
   - Value: `{address_match}`

2. This variable persists through the conversation
3. You can reference it later: `Your address is {confirmed_address}`
4. Can be used in forms or sent to external systems

---

## Example Voiceflow Variables

Create these variables in Voiceflow:

| Variable Name | Type | Purpose |
|--------------|------|---------|
| `user_address` | Text | Raw input from user |
| `address_match` | Text | Best match from API |
| `confidence` | Number | Match confidence % |
| `confirmed_address` | Text | Final confirmed address |
| `success` | Boolean | Whether API found a match |

---

## Testing in Voiceflow

1. Click "Test" button in Voiceflow
2. Try these inputs:
   - `2133 w edgemint` → Should match `2133 W EDGEMONT AVE`
   - `2056 edgemont` → Should match `2056 W EDGEMONT AVE`
   - `2713 23rd` → Should match `2713 N 23RD AVE`

---

## Troubleshooting

**API not responding:**
- Check if API is running: `curl http://localhost:3001/health`
- Check deployment logs on Railway/Vercel
- Make sure CORS is enabled (already configured)

**Low confidence matches:**
- Adjust `threshold` in `index.js` (line 34)
- Lower = stricter matching
- Current: 0.4 (good balance)

**No matches found:**
- User input too short (minimum 3 characters)
- User input too different from any address
- Show alternates or ask to re-enter

---

## Advanced: Show Alternates

If user says "No", show alternate matches:

**API Block 2:**
Store alternate addresses:
- `alternate_1 = {response.alternates[0].address}`
- `alternate_2 = {response.alternates[1].address}`
- `alternate_3 = {response.alternates[2].address}`

**Buttons Block:**
```
Perhaps you meant one of these?
- {alternate_1}
- {alternate_2}
- {alternate_3}
- None of these / Try again
```

---

## Running Locally

```bash
cd /Users/CCK85/Desktop/address-lookup-api
npm start
```

API will be available at: http://localhost:3001

**Test it:**
```bash
curl -X POST http://localhost:3001/lookup \
  -H "Content-Type: application/json" \
  -d '{"query":"2133 w edgemint"}'
```

---

## Deployment Checklist

- [ ] API tested locally
- [ ] Deployed to Railway/Vercel
- [ ] Public URL obtained
- [ ] URL added to Voiceflow API block
- [ ] Variables created in Voiceflow
- [ ] Conversation flow tested
- [ ] Confirmation buttons working
- [ ] Address stored in variable

---

## Support

If you need help:
1. Check API health: `https://your-url.com/health`
2. Test API directly with curl or Postman
3. Check Voiceflow API block logs
4. Verify variable mapping is correct

---

## Next Steps

1. Deploy the API (Railway recommended)
2. Update the API URL in Voiceflow
3. Test the full conversation flow
4. Add error handling for edge cases
5. Consider adding logging for analytics
