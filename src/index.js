// Entry point for the MVP Express API

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const integrationsRouter = require('./api/routes/route');

const app = express();

app.use(express.json());

// Routes
app.use('/api/integrations/esp', integrationsRouter);

// Basic health check
app.get('/ping', (req, res) => res.json({ status: 'ok' }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${PORT}`);
});
