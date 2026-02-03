// Postbuild script - prepare production deployment
// NOTE: This script is for LOCAL builds only
// For Hostinger, the built files are in dist/ folder - configure Hostinger to serve from there
// OR set the "Publish directory" to "dist" in Hostinger settings
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distPath = path.join(rootDir, 'dist');
const distIndexPath = path.join(distPath, 'index.html');

// Check that dist/index.html exists (build was successful)
if (fs.existsSync(distIndexPath)) {
  console.log('✓ Build completed successfully');
  console.log('  - Built files are in dist/ folder');
  console.log('');
  console.log('For Hostinger deployment:');
  console.log('  1. Set "Publish directory" to "dist" in Hostinger website settings');
  console.log('  2. Or configure the web server to serve from /dist');
  console.log('');
  console.log('✓ Production build ready');
} else {
  console.log('Warning: dist/index.html not found - build may have failed');
}
