# Mail Integration API

## Overview
A simple Node.js/Express API to integrate with email service providers (ESPs). This project allows you to:
- Save and validate API keys for Mailchimp and GetResponse.
- Fetch lists/audiences from saved integrations.
- Fetch contacts/subscribers from saved integrations.
- Explore the API interactively using Swagger documentation.

## Install
1. Clone the repository.
2. `cd mail-integration`
3. `npm install`
4. Start the server: `npm start` (or `npm run dev` for development with nodemon).

The server will start on `http://localhost:3000`.

## API Documentation (Swagger)
This project uses Swagger for interactive API documentation. Once the server is running, you can access the Swagger UI at:

**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

From there, you can view all available endpoints, see their request/response schemas, and execute API calls directly from your browser.

## Endpoints

### `POST /api/integrations/esp`
Save and validate an API key for a provider.

**Body (JSON):**
```json
{
  "provider": "mailchimp" | "getresponse",
  "apiKey": "your_key_here"
}
```

**Response:** The saved integration record.
```json
{
  "id": "...",
  "provider": "mailchimp",
  "apiKey": "xxx",
  "validated": true,
  "meta": { ... },
  "createdAt": "..."
}
```

### `GET /api/integrations/esp`
Fetch all saved integrations.

**Response:** An array of integration records.

### `GET /api/integrations/esp/lists?id=<integrationId>`
Fetch lists/audiences for a specific saved integration.

**Response:**
```json
{
  "provider": "mailchimp",
  "lists": [ { "id": "...", "name": "...", "member_count": 0 }, ... ]
}
```

### `GET /api/integrations/esp/contacts?id=<integrationId>`
Fetch contacts/subscribers for a specific saved integration.

**Response:**
```json
{
  "provider": "mailchimp",
  "contacts": [ { "id": "...", "email": "...", "name": "..." }, ... ]
}
```

## Database
- Uses `lowdb` (a simple JSON file database) located at `src/db/db.json`.
- The database is automatically created if it doesn't exist.
- If the `db.json` file becomes corrupted, the application will automatically reset it to a default empty state to prevent crashes.
- **Schema:** The database stores an array of `integrations` with the following structure:
  - `id`: string (nanoid)
  - `provider`: 'mailchimp' | 'getresponse'
  - `apiKey`: The raw API key.
  - `validated`: boolean
  - `meta`: object (contains provider-specific metadata, like Mailchimp's data center).
  - `createdAt`: ISO timestamp

## Security Notes (Important)
- For simplicity, this project stores API keys in plaintext in a JSON file. **This is not secure for production.**
- For any production use, you should:
  - Encrypt secrets at rest or store them in a secure secret manager (e.g., HashiCorp Vault, AWS Secrets Manager).
  - Ensure secrets are not committed to git (the `.gitignore` should be configured to exclude sensitive files).
  - Use OAuth for user-facing integrations when possible, as recommended by providers like Mailchimp for multi-user applications.

## Provider Specifics (References)
- **Mailchimp:** The API key is used in Basic Auth as `anystring:APIKEY`. The base URL is constructed using the data center suffix from the key (e.g., `-us19` -> `https://us19.api.mailchimp.com/3.0`).
- **GetResponse:** The API key is used in the `X-Auth-Token: api-key {key}` header. The base URL is `https://api.getresponse.com/v3`.
