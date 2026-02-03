// Postbuild script - prepare production deployment for Hostinger
// Hostinger serves from root, so we need to move dist contents there
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distPath = path.join(rootDir, 'dist');
const distIndexPath = path.join(distPath, 'index.html');
const rootIndexPath = path.join(rootDir, 'index.html');
const rootAssetsPath = path.join(rootDir, 'assets');
const distAssetsPath = path.join(distPath, 'assets');

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Check that dist/index.html exists (build was successful)
if (fs.existsSync(distIndexPath)) {
  console.log('✓ Build completed successfully');
  
  // Copy dist/index.html to root (overwriting dev version)
  fs.copyFileSync(distIndexPath, rootIndexPath);
  console.log('  - Copied dist/index.html to root');
  
  // Copy assets folder to root
  if (fs.existsSync(distAssetsPath)) {
    if (fs.existsSync(rootAssetsPath)) {
      fs.rmSync(rootAssetsPath, { recursive: true, force: true });
    }
    copyDirSync(distAssetsPath, rootAssetsPath);
    console.log('  - Copied dist/assets/ to root/assets/');
  }
  
  console.log('✓ Production files ready for Hostinger');
} else {
  console.log('Warning: dist/index.html not found - build may have failed');
}
