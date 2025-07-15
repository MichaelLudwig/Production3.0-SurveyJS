// Simple test to start the server and identify issues
const express = require('express');

console.log('Testing basic Express setup...');

const app = express();
const PORT = 3001;

app.get('/test', (req, res) => {
  res.json({ message: 'Test server running!' });
});

console.log('Starting test server...');
const server = app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}/test`);
});

// Graceful shutdown after 5 seconds
setTimeout(() => {
  console.log('Shutting down test server...');
  server.close(() => {
    console.log('✅ Test server closed');
    process.exit(0);
  });
}, 5000);