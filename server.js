const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Health check
app.get('/health', (req, res) => res.send('OK'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export for platforms that need it
module.exports = app;

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
