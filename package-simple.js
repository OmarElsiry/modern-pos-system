const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Creating simple package...');

// Create output directory
const outDir = path.join(__dirname, 'release-simple');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy necessary files
const filesToCopy = [
  'dist',
  'package.json',
  'node_modules'
];

console.log('Copying files...');
filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(outDir, file);
  
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
    console.log(`Copied: ${file}`);
  }
});

console.log('\nPackage created in: release-simple/');
console.log('To run: cd release-simple && npx electron .');
