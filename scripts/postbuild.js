// Postbuild script - delete root index.html to prevent Apache from serving it
const fs = require('fs');
const path = require('path');

const rootIndexPath = path.join(__dirname, '..', 'index.html');

if (fs.existsSync(rootIndexPath)) {
  try {
    fs.unlinkSync(rootIndexPath);
    console.log('✓ Deleted root index.html');
  } catch (e) {
    console.log('Could not delete root index.html:', e.message);
  }
} else {
  console.log('Root index.html does not exist (already deleted or never created)');
}
