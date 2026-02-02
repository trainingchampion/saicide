const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Debug endpoint
app.get('/debug', (req, res) => {
  const indexContent = fs.existsSync(path.join(distPath, 'index.html')) 
    ? fs.readFileSync(path.join(distPath, 'index.html'), 'utf8').substring(0, 500)
    : 'NOT FOUND';
  const info = {
    distPath: distPath,
    distExists: fs.existsSync(distPath),
    distFiles: fs.existsSync(distPath) ? fs.readdirSync(distPath) : [],
    rootFiles: fs.readdirSync(__dirname).slice(0, 15),
    indexHtmlPreview: indexContent
  };
  res.json(info);
});

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Serve static files from dist
app.use(express.static(distPath));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
