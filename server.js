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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
