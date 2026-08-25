const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
      callback(dirPath);
    }
  });
}

walkDir('.', function(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Add missing dot
  content = content.replace(/toLocaleString\('en-IN'\)/g, ".toLocaleString('en-IN')");
  
  // Fix cases where it became ..toLocaleString
  content = content.replace(/\.\.toLocaleString\('en-IN'\)/g, ".toLocaleString('en-IN')");
  
  // Fix cases where it became ?toLocaleString (should be ?.toLocaleString)
  content = content.replace(/\?toLocaleString\('en-IN'\)/g, "?.toLocaleString('en-IN')");
  
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed: ' + filePath);
  }
});
