const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We moved these files one directory deeper.
      // So any import starting with '../' needs an extra '../' prepended.
      content = content.replace(/from\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, dotdots, rest) => {
        // match is the full string like: from '../../../theme'
        // we want to add one more '../' after the quote
        return match.replace(/['"]\.\.\//, "'../../");
      });
      
      fs.writeFileSync(fullPath, content);
      console.log('Fixed', fullPath);
    }
  }
}

fixImports(path.join(__dirname, 'app/(student)/(tabs)'));
