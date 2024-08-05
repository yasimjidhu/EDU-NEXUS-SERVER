const fs = require('fs');
const path = require('path');

function deleteJsFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      deleteJsFiles(filePath);
    } else if (path.extname(file) === '.js') {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    }
  });
}

deleteJsFiles(__dirname + '/src');
