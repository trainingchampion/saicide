const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Log startup info
console.log('Starting server...');
console.log('__dirname:', __dirname);
console.log('distPath:', distPath);
console.log('distPath exists:', fs.existsSync(distPath));

// Block requests to development files
app.use((req, res, next) => {
  const blocked = ['/index.tsx', '/index.ts', '/src/', '/components/', '/services/'];
  if (blocked.some(b => req.path.startsWith(b))) {
    console.log('BLOCKED:', req.path);
    return res.status(404).send('Not found');
  }
  next();
});

// Health check BEFORE static
app.get('/health', (req, res) => res.send('OK'));

// Serve ONLY from dist folder
app.use(express.static(distPath, {
  index: 'index.html',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// SPA fallback - serve dist/index.html
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('SPA fallback for:', req.path, '-> serving:', indexPath);
  res.sendFile(indexPath);
});

module.exports = app;

// Start server - required for Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
