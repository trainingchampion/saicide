const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Log startup info
console.log('Starting server...');
console.log('PORT:', PORT);
console.log('__dirname:', __dirname);
console.log('distPath:', distPath);
console.log('distPath exists:', fs.existsSync(distPath));
console.log('index.html exists:', fs.existsSync(indexPath));

// List dist contents if it exists
if (fs.existsSync(distPath)) {
  console.log('dist contents:', fs.readdirSync(distPath));
}

// Health check - FIRST route, always responds
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Block requests to development files
app.use((req, res, next) => {
  const blocked = ['/index.tsx', '/index.ts', '/src/', '/components/', '/services/'];
  if (blocked.some(b => req.path.startsWith(b))) {
    return res.status(404).send('Not found');
  }
  next();
});

// Serve static files from dist folder
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));
}

// SPA fallback - serve dist/index.html
app.get('/{*path}', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Application not built. dist/index.html not found.');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Server error');
});

// Start server IMMEDIATELY - required for Cloud Run
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
