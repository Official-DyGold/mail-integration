const { nanoid } = require('nanoid');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const mailchimpService = require('../../services/mailchimp');
const getresponseService = require('../../services/getresponse');

const file = path.join(__dirname, '..', '..', 'db', 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { integrations: [] });

async function initDB() {
  await db.read();
  await db.write();
}
initDB();


/**
 * POST /api/integrations/esp
 * Body: { provider: 'mailchimp'|'getresponse', apiKey: '...' }
 * Response: saved integration object (id, provider, validated, meta)
 */
exports.createIntegration = async (req, res) => {
  const { provider, apiKey } = req.body;
  if (!provider || !apiKey) {
    return res.status(400).json({ error: 'provider and apiKey are required' });
  }

  const supported = ['mailchimp', 'getresponse'];
  if (!supported.includes(provider)) {
    return res.status(400).json({ error: `provider must be one of: ${supported.join(', ')}` });
  }

  try {
    let validationResult;
    if (provider === 'mailchimp') {
      validationResult = await mailchimpService.validateApiKey(apiKey);
    } else if (provider === 'getresponse') {
      validationResult = await getresponseService.validateApiKey(apiKey);
    }

    await db.read();
    const integration = {
      id: nanoid(),
      provider,
      apiKey,
      validated: validationResult.valid,
      meta: validationResult.meta || {},
      createdAt: new Date().toISOString()
    };

    db.data.integrations.push(integration);
    await db.write();

    return res.status(201).json(integration);
  } catch (err) {
    // Distinguish between credential errors and network/other errors
    if (err.isInvalidCredentials) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (err.isRateLimit) {
      return res.status(429).json({ error: 'Rate limit from provider' });
    }
    // Generic network/unknown error
    // eslint-disable-next-line no-console
    console.error('Validation error', err);
    return res.status(502).json({ error: 'Failed to validate with provider', details: err.message });
  }
};

/**
 * GET /api/integrations/esp
 * Response: all integration objects
 */
exports.getAllIntegrations = async (req, res) => {
  await db.read();
  res.json(db.data.integrations);
};

/**
 * GET /api/integrations/esp/lists
 * Query: ?id=<integrationId>
 * Response: provider lists/audiences (MVP: first page)
 */
exports.getIntegrationLists = async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'integration id is required as ?id=' });

  await db.read();
  const integration = db.data.integrations.find((i) => i.id === id);
  if (!integration) return res.status(404).json({ error: 'integration not found' });

  try {
    if (integration.provider === 'mailchimp') {
      const lists = await mailchimpService.getLists(integration.apiKey);
      return res.json({ provider: 'mailchimp', lists });
    } else if (integration.provider === 'getresponse') {
      const lists = await getresponseService.getCampaigns(integration.apiKey);
      return res.json({ provider: 'getresponse', lists });
    }
    return res.status(400).json({ error: 'unsupported provider' });
  } catch (err) {
    if (err.isInvalidCredentials) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (err.isRateLimit) {
      return res.status(429).json({ error: 'Rate limit from provider' });
    }
    // eslint-disable-next-line no-console
    console.error('Error fetching lists', err);
    return res.status(502).json({ error: 'Failed to fetch lists', details: err.message });
  }
};
