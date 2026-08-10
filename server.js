const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Serve a simple homepage
app.get('/', (req, res) => {
  res.send('<h1>Coderight</h1><p>Simple demo app running.</p>');
});

// Health check for Render / uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({status: 'ok'});
});

// Example API route (replace with your real logic)
app.get('/api/status', (req, res) => {
  res.json({app: 'Coderight', version: '0.1.0'});
});

// Simple error-handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({error: 'internal_server_error'});
  }
});

// Export the app for tests or server runtime
module.exports = app;

// If run directly, start the server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down server');
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
