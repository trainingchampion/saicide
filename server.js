import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Debug info endpoint - always available
app.get('/debug', (req, res) => {
  const info = {
    nodeVersion: process.version,
    cwd: process.cwd(),
    dirname: __dirname,
    distPath: distPath,
    distExists: fs.existsSync(distPath),
    indexExists: fs.existsSync(indexPath),
    env: {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV
    },
    files: fs.existsSync(__dirname) ? fs.readdirSync(__dirname).slice(0, 20) : []
  };
  res.json(info);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Check if dist folder and index.html exist
if (!fs.existsSync(distPath) || !fs.existsSync(indexPath)) {
  console.error('WARNING: dist folder or index.html does not exist');
  console.error('distPath:', distPath, 'exists:', fs.existsSync(distPath));
  console.error('indexPath:', indexPath, 'exists:', fs.existsSync(indexPath));
  
  app.get('*', (req, res) => {
    res.status(503).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Build Required</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1>Build Not Found</h1>
          <p>Visit <a href="/debug">/debug</a> for more info.</p>
        </body>
      </html>
    `);
  });
} else {
  console.log('Serving static files from:', distPath);

  // Serve static files from dist
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.js' || ext === '.mjs') {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));

  // SPA fallback - serve index.html for all other routes
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
