// Postbuild script - prepare production deployment
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const rootIndexPath = path.join(rootDir, 'index.html');
const distPath = path.join(rootDir, 'dist');
const distIndexPath = path.join(distPath, 'index.html');
const devIndexBackupPath = path.join(rootDir, 'index.dev.html');
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
  
  // Backup the development index.html
  if (fs.existsSync(rootIndexPath)) {
    fs.copyFileSync(rootIndexPath, devIndexBackupPath);
    console.log('  - Backed up development index.html to index.dev.html');
  }
  
  // Copy production dist/index.html to root for Hostinger static serving
  fs.copyFileSync(distIndexPath, rootIndexPath);
  console.log('  - Copied dist/index.html to root index.html for production');
  
  // Copy assets folder to root for Hostinger static serving
  if (fs.existsSync(distAssetsPath)) {
    // Remove existing root assets if present
    if (fs.existsSync(rootAssetsPath)) {
      fs.rmSync(rootAssetsPath, { recursive: true, force: true });
    }
    copyDirSync(distAssetsPath, rootAssetsPath);
    console.log('  - Copied dist/assets to root /assets for production');
  }
  
  console.log('✓ Production files ready for static hosting');
} else {
  console.log('Warning: dist/index.html not found - build may have failed');
}
