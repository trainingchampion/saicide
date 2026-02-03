// Postbuild script - prepare production deployment
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distPath = path.join(rootDir, 'dist');
const distIndexPath = path.join(distPath, 'index.html');

// Check that dist/index.html exists (build was successful)
if (fs.existsSync(distIndexPath)) {
  console.log('✓ Build completed successfully');
  console.log('✓ Production files ready in dist/ folder');
  
  // List what was built
  const distAssets = path.join(distPath, 'assets');
  if (fs.existsSync(distAssets)) {
    const files = fs.readdirSync(distAssets);
    console.log(`  - ${files.length} assets built`);
  }
} else {
  console.log('Warning: dist/index.html not found - build may have failed');
}
