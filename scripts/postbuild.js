// Postbuild script - prepare production deployment for Hostinger
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distPath = path.join(rootDir, 'dist');
const distIndexPath = path.join(distPath, 'index.html');
const rootIndexPath = path.join(rootDir, 'index.html');
const devIndexBackup = path.join(rootDir, 'index.dev.html');

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
  
  // Backup development index.html
  if (fs.existsSync(rootIndexPath)) {
    const content = fs.readFileSync(rootIndexPath, 'utf8');
    if (content.includes('/index.tsx')) {
      fs.copyFileSync(rootIndexPath, devIndexBackup);
      console.log('  - Backed up development index.html');
    }
  }
  
  // Copy all dist contents to root for Hostinger static serving
  const distFiles = fs.readdirSync(distPath);
  for (const file of distFiles) {
    const srcPath = path.join(distPath, file);
    const destPath = path.join(rootDir, file);
    
    // Skip source directories we don't want to overwrite
    const skipDirs = ['node_modules', 'src', 'components', 'services', 'scripts', 'server', '.git', 'hooks', 'modules', 'electron', 'terraform', '__tests__'];
    if (skipDirs.includes(file)) {
      continue;
    }
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      copyDirSync(srcPath, destPath);
      console.log(`  - Copied dist/${file}/ to root`);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  - Copied dist/${file} to root`);
    }
  }
  
  console.log('✓ Production files ready for Hostinger static hosting');
} else {
  console.log('Warning: dist/index.html not found - build may have failed');
}
