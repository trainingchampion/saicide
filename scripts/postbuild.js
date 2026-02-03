// Postbuild script - prepare production deployment for Hostinger
// Vite uses index.dev.html as entry, outputs to dist/
// This script copies dist contents to root for Hostinger to serve
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distPath = path.join(rootDir, 'dist');
// Vite outputs as index.dev.html (same name as input), we need to rename to index.html
const distDevIndexPath = path.join(distPath, 'index.dev.html');
const distIndexPath = path.join(distPath, 'index.html');

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

// First, rename index.dev.html to index.html in dist/ if it exists
if (fs.existsSync(distDevIndexPath)) {
  fs.renameSync(distDevIndexPath, distIndexPath);
  console.log('✓ Renamed dist/index.dev.html to dist/index.html');
}

// Check that dist/index.html exists (build was successful)
if (fs.existsSync(distIndexPath)) {
  console.log('✓ Build completed successfully');
  
  // Copy all dist contents to root for Hostinger
  const distContents = fs.readdirSync(distPath);
  for (const item of distContents) {
    const srcPath = path.join(distPath, item);
    const destPath = path.join(rootDir, item);
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      // Remove existing directory if it exists
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      copyDirSync(srcPath, destPath);
      console.log(`  - Copied dist/${item}/ to root/${item}/`);
    } else {
      fs.copyFileSync(srcPath, destPath);
      if (item === 'index.html') {
        console.log('  - Copied dist/index.html to root/index.html');
      }
    }
  }
  
  console.log('✓ Production files deployed to root for Hostinger');
} else {
  console.log('Warning: dist/index.html not found - build may have failed');
}
