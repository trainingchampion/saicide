// Hostinger may look for app.js - redirect to server.js
const app = require('./server');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
