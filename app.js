const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

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
