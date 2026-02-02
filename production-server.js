const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Remove or rename root index.html to prevent Apache from serving it
const rootIndexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(rootIndexPath)) {
  try {
    // Try to delete it first
    fs.unlinkSync(rootIndexPath);
    console.log('Deleted root index.html');
  } catch (e) {
    console.log('Could not delete root index.html:', e.message);
    // Try rename as fallback
    try {
      fs.renameSync(rootIndexPath, path.join(__dirname, '_index.dev.html'));
      console.log('Renamed root index.html to _index.dev.html');
    } catch (e2) {
      console.log('Could not rename root index.html:', e2.message);
    }
  }
}

// Log startup info
console.log('Starting server...');
console.log('PORT:', PORT);
console.log('distPath:', distPath);
console.log('dist exists:', fs.existsSync(distPath));

// Health check - place first so it always works
app.get('/health', (req, res) => res.send('OK'));

// Debug endpoint
app.get('/debug', (req, res) => {
  const indexContent = fs.existsSync(path.join(distPath, 'index.html')) 
    ? fs.readFileSync(path.join(distPath, 'index.html'), 'utf8').substring(0, 500)
    : 'NOT FOUND';
  const rootIndexExists = fs.existsSync(path.join(__dirname, 'index.html'));
  const info = {
    distPath: distPath,
    distExists: fs.existsSync(distPath),
    distFiles: fs.existsSync(distPath) ? fs.readdirSync(distPath) : [],
    rootFiles: fs.readdirSync(__dirname).slice(0, 20),
    rootIndexHtmlExists: rootIndexExists,
    indexHtmlPreview: indexContent
  };
  res.json(info);
});

// Test endpoint - explicitly serve dist/index.html
app.get('/test', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Health check
app.get('/health', (req, res) => res.send('OK'));

// IMPORTANT: Handle root path BEFORE static middleware
// This prevents Apache/root index.html from being served
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Serve static files from dist ONLY (not root)
app.use('/assets', express.static(path.join(distPath, 'assets')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
