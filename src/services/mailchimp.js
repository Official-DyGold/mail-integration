// Mailchimp helper functions: validateApiKey, getLists
// Mailchimp authentication: basic auth using anystring:APIKEY
// Base host must use data center from API key suffix (e.g. key ends with "-us19")

const axios = require('axios');

/**
 * Extract data center from Mailchimp API key.
 * Mailchimp keys usually end with -<dc> (e.g. xxxxxxx-us19).
 */
function extractDataCenter(apiKey) {
  const parts = apiKey.split('-');
  if (parts.length < 2) return null;
  return parts[parts.length - 1];
}

/**
 * Validate API key by calling ping endpoint:
 * GET https://{dc}.api.mailchimp.com/3.0/ping
 *
 * If invalid, Mailchimp returns 401 or similar.
 */
async function validateApiKey(apiKey) {
  const dc = extractDataCenter(apiKey);
  if (!dc) {
    const err = new Error('Invalid Mailchimp API key format (missing data center)');
    err.isInvalidCredentials = true;
    throw err;
  }

  const url = `https://${dc}.api.mailchimp.com/3.0/ping`;
  try {
    const resp = await axios.get(url, {
      auth: {
        username: 'anystring',
        password: apiKey
      },
      timeout: 8000
    });

    // Success -> validated
    return { valid: true, meta: { dc } };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        const err = new Error('Invalid Mailchimp credentials');
        err.isInvalidCredentials = true;
        throw err;
      }
      if (error.response.status === 429) {
        const err = new Error('Mailchimp rate limited');
        err.isRateLimit = true;
        throw err;
      }
    }
    // network or unknown
    throw error;
  }
}

/**
 * Get lists (audiences) - MVP: first page only
 * GET https://{dc}.api.mailchimp.com/3.0/lists?count=100
 */
async function getLists(apiKey) {
  const dc = extractDataCenter(apiKey);
  if (!dc) {
    const err = new Error('Invalid Mailchimp API key format (missing data center)');
    err.isInvalidCredentials = true;
    throw err;
  }

  const url = `https://${dc}.api.mailchimp.com/3.0/lists?count=100`;

  try {
    const resp = await axios.get(url, {
      auth: { username: 'anystring', password: apiKey },
      timeout: 10000
    });

    // Mailchimp returns lists in resp.data.lists
    return (resp.data && resp.data.lists) ? resp.data.lists.map((l) => ({
      id: l.id,
      name: l.name,
      member_count: l.stats ? l.stats.member_count : undefined
    })) : [];
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        const err = new Error('Invalid Mailchimp credentials');
        err.isInvalidCredentials = true;
        throw err;
      }
      if (error.response.status === 429) {
        const err = new Error('Mailchimp rate limited');
        err.isRateLimit = true;
        throw err;
      }
    }
    throw error;
  }
}

module.exports = {
  validateApiKey,
  getLists
};