const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const rulesDir = 'src/sdk/Dependencies/LocalDependency/pegjs.rules';
const parsersDir = 'src/sdk/Dependencies/LocalDependency/pegjs.parsers';

// Ensure parsers directory exists
if (!fs.existsSync(parsersDir)) {
  fs.mkdirSync(parsersDir);
}

// Read the rules directory
fs.readdir(rulesDir, (err, files) => {
  if (err) {
    console.error('Error reading the directory', err);
    return;
  }

  files.forEach((file) => {
    const rule = path.join(rulesDir, file);
    const parser = path.join(parsersDir, file.replace(/\.pegjs$/, '.js'));

    try {
      // Execute the pegjs command
      const command = `npx pegjs --output ${parser} ${rule}`;
      execSync(command);

      console.log(`Generating parser for ${file}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  });
});
