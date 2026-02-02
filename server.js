import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('WARNING: dist folder does not exist. Serving placeholder...');
  console.error('Looking for:', distPath);
  console.error('Current directory contents:', fs.readdirSync(__dirname));
  
  // Start a minimal server that shows the error
  app.get('*', (req, res) => {
    res.status(503).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Build Required</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1>Build Not Found</h1>
          <p>The dist/ folder doesn't exist. Run <code>npm run build</code> first.</p>
          <p>Looking for: ${distPath}</p>
        </body>
      </html>
    `);
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (BUILD MISSING)`);
  });
} else {

// Check if index.html exists in dist
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('ERROR: dist/index.html does not exist.');
  process.exit(1);
}

console.log('Serving static files from:', distPath);
console.log('Index file:', indexPath);

// Block any requests to development files (prevent serving root index.html)
app.use((req, res, next) => {
  const blockedPaths = ['/index.tsx', '/index.ts', '/src/', '/components/', '/services/', '/modules/'];
  if (blockedPaths.some(blocked => req.path.startsWith(blocked))) {
    console.log('Blocked development file request:', req.path);
    return res.status(404).send('Not found');
  }
  next();
});

// MIME types for proper static file serving
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
};

// Serve static files from dist with proper MIME types
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    // Cache static assets for 1 year
    if (ext === '.js' || ext === '.css' || ext === '.woff2') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

} // end of else block for dist exists check