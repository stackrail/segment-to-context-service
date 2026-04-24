require('dotenv').config();
const express = require('express');
const config = require('./config');

const healthRoutes = require('./api/routes/health');
const eventRoutes = require('./api/routes/events.routes');
const contextRoutes = require('./api/routes/context.routes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/events', eventRoutes);
app.use('/context', contextRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  if (config.nodeEnv !== 'production') {
    console.error('[ERROR]', err.stack);
  } else {
    console.error('[ERROR]', err.message);
  }

  res.status(500).json({
    error: 'Something went wrong',
  });
});

// 👇 EXPORT APP (CRITICAL)
module.exports = app;

// 👇 ONLY START SERVER IF RUN DIRECTLY
if (require.main === module) {
  const server = app.listen(config.port, () => {
    console.log(
      `Server running on port ${config.port} in ${config.nodeEnv} mode`
    );
  });

  const shutdown = () => {
    console.log('Shutdown signal received, closing server...');

    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

