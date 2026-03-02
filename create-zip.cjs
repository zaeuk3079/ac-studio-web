const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip();

// Add src folder
zip.addLocalFolder('./src', 'src');

// Add public folder (excluding the zip file itself)
if (fs.existsSync('./public')) {
  const publicFiles = fs.readdirSync('./public');
  publicFiles.forEach(file => {
    if (file !== 'aging-studio-source.zip' && file !== 'aging-studio.zip') {
      const filePath = path.join('./public', file);
      if (fs.statSync(filePath).isDirectory()) {
        zip.addLocalFolder(filePath, path.join('public', file));
      } else {
        zip.addLocalFile(filePath, 'public');
      }
    }
  });
}

// Add root files
const files = [
  'index.html',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  '.env.example',
  '.gitignore',
  'metadata.json'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    zip.addLocalFile(file);
  }
});

// Ensure public directory exists
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public');
}

// Write zip
zip.writeZip('./public/aging-studio-source.zip');
console.log('Zip file created successfully at public/aging-studio-source.zip');
