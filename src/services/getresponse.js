// GetResponse helper functions: validateApiKey (GET /accounts) and getCampaigns (/campaigns)
// Auth header: X-Auth-Token: api-key {key}
// Base URL: https://api.getresponse.com/v3

const axios = require('axios');

const BASE = 'https://api.getresponse.com/v3';

function authHeader(apiKey) {
  return { 'X-Auth-Token': `api-key ${apiKey}` };
}

/**
 * Validate GetResponse API key by calling /accounts
 */
async function validateApiKey(apiKey) {
  try {
    const resp = await axios.get(`${BASE}/accounts`, {
      headers: authHeader(apiKey),
      timeout: 8000
    });
    // If 200, it's valid. Return some meta (account id/email if present)
    const meta = {};
    if (Array.isArray(resp.data) && resp.data.length > 0) {
      meta.account = resp.data[0];
    } else if (resp.data) {
      meta.account = resp.data;
    }
    return { valid: true, meta };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        const err = new Error('Invalid GetResponse credentials');
        err.isInvalidCredentials = true;
        throw err;
      }
      if (error.response.status === 429) {
        const err = new Error('GetResponse rate limited');
        err.isRateLimit = true;
        throw err;
      }
    }
    throw error;
  }
}

/**
 * Get campaigns (used here as "lists" / audiences) - MVP: first page only
 * GET /v3/campaigns?limit=100
 */
async function getCampaigns(apiKey) {
  try {
    const resp = await axios.get(`${BASE}/campaigns?limit=100`, {
      headers: authHeader(apiKey),
      timeout: 10000
    });

    // Each campaign has id, name, etc.
    if (Array.isArray(resp.data)) {
      return resp.data.map((c) => ({
        id: c.campaignId || c.id || c.name, // be defensive
        name: c.name
      }));
    }
    return [];
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        const err = new Error('Invalid GetResponse credentials');
        err.isInvalidCredentials = true;
        throw err;
      }
      if (error.response.status === 429) {
        const err = new Error('GetResponse rate limited');
        err.isRateLimit = true;
        throw err;
      }
    }
    throw error;
  }
}

/**
 * Get contacts - MVP: first page only
 * GET /v3/contacts?limit=100
 */
async function getContacts(apiKey) {
  try {
    const resp = await axios.get(`${BASE}/contacts?limit=100`, {
      headers: authHeader(apiKey),
      timeout: 10000
    });

    if (Array.isArray(resp.data)) {
      return resp.data.map((c) => ({
        id: c.contactId,
        email: c.email,
        name: c.name,
      }));
    }
    return [];
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        const err = new Error('Invalid GetResponse credentials');
        err.isInvalidCredentials = true;
        throw err;
      }
      if (error.response.status === 429) {
        const err = new Error('GetResponse rate limited');
        err.isRateLimit = true;
        throw err;
      }
    }
    throw error;
  }
}

module.exports = {
  validateApiKey,
  getCampaigns,
  getContacts
};
