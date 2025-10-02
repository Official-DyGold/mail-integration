# Mail Integration

## Overview
Simple Node.js/Express to:
- Save & validate API keys for Mailchimp and GetResponse
- Fetch lists/audiences from saved integrations

## Install
1. Clone repo "github/Official-DyGold"
2. `cd mail-integration`
3. `npm install`
4. Start: `npm start` (or `npm run dev` with nodemon)

## Endpoints

### POST /api/integrations/esp
Save and validate API key.

Body (JSON):
{
  "provider": "mailchimp" | "getresponse",
  "apiKey": "your_key_here"
}

Response: saved integration record:
{
  "id": "...",
  "provider": "mailchimp",
  "apiKey": "xxx",
  "validated": true,
  "meta": { ... },
  "createdAt": "..."
}

### GET /api/integrations/esp/lists?id=<integrationId>
Fetch lists/audiences for the saved integration.

Response:
{
  "provider": "mailchimp",
  "lists": [ { id, name, member_count }, ... ]
}

## Database
- Uses `lowdb` (JSON file) located at `src/db/db.json`.
- Schema (stored as an array `integrations`):
  - id: string (nanoid)
  - provider: 'mailchimp' | 'getresponse'
  - apiKey: the raw API key (for production you should encrypt)
  - validated: boolean
  - meta: object (contains provider metadata like Mailchimp dc)
  - createdAt: ISO timestamp

## Security notes (important)
- This stores API keys in plaintext in a JSON file (for simplicity). For any production use:
  - Encrypt secrets at rest or store in a secure secret manager.
  - Which will not commit secrets to git.
  - Also to use OAuth for user-facing integrations when possible (Mailchimp recommends OAuth for multi-user apps).

## Provider specifics (references)
- Mailchimp: API key is used in basic auth as `anystring:APIKEY`. Use the data center suffix (e.g. `-us19`) to build base URL (e.g. `https://us19.api.mailchimp.com/3.0/ping`). (Mailchimp docs). :contentReference[oaicite:2]{index=2}
- GetResponse: use the `X-Auth-Token: api-key {key}` header. Base URL `https://api.getresponse.com/v3`. Use `/accounts` to validate and `/campaigns` to list campaigns (audiences). :contentReference[oaicite:3]{index=3}