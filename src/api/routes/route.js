const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/controller');

/**
 * @swagger
 * /api/integrations/esp:
 *   post:
 *     summary: Create a new integration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *               apiKey:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', integrationsController.createIntegration);

// /**
//  * @swagger
//  * /api/integrations/esp:
//  *   get:
//  *     summary: Retrieve all integrations
//  *     responses:
//  *       200:
//  *         description: A list of integrations.
//  */
// router.get('/', integrationsController.getAllIntegrations);

// /**
//  * @swagger
//  * /api/integrations/esp/lists:
//  *   get:
//  *     summary: Retrieve lists for a specific integration
//  *     parameters:
//  *       - in: query
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: A list of campaigns or lists.
//  */
// router.get('/lists', integrationsController.getIntegrationLists);

/**
 * @swagger
 * /api/integrations/esp/contacts:
 *   get:
 *     summary: Retrieve contacts for a specific integration
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of contacts or subscribers.
 */
router.get('/contacts', integrationsController.getIntegrationContacts);

module.exports = router;
