// Postbuild script - keep index.html for Vite builds
const fs = require('fs');
const path = require('path');

const rootIndexPath = path.join(__dirname, '..', 'index.html');
const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');

// Check that dist/index.html exists (build was successful)
if (fs.existsSync(distIndexPath)) {
  console.log('✓ Build completed successfully');
  console.log('  - dist/index.html will be served in production');
  console.log('  - Root index.html preserved for development builds');
} else {
  console.log('Warning: dist/index.html not found - build may have failed');
}
