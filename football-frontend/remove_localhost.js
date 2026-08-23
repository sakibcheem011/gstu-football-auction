const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

walkDir('.', function(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace: 
  // Also catch double quotes and backticks
  content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:4000['"]\}/g, '');
  
  // Replace: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:4000['"]/g, 'process.env.NEXT_PUBLIC_API_URL');
  
  // Just in case of nested weirdness like ${process.env.NEXT_PUBLIC_API_URL || \\\}
  // Let's do it a few times to be sure
  content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:4000['"]\}/g, '');
  
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
});
