import fs from 'fs';
import path from 'path';
const foldersToInclude = ['controllers', 'models', 'routes', 'config'];
const outputFile = 'combined-output.txt';
let combined = '';
// Combine files
for (const folder of foldersToInclude) {
  const folderPath = path.join(process.cwd(), folder);
  if (!fs.existsSync(folderPath)) continue;
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    combined += `\n\n// ===== ${folder}/${file} =====\n\n${content}`;
  }
}
// Include root index.js or server.js if exists
['index.js', 'server.js'].forEach((mainFile) => {
  const filePath = path.join(process.cwd(), mainFile);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    combined += `\n\n// ===== ${mainFile} =====\n\n${content}`;
  }
});
fs.writeFileSync(outputFile, combined);
console.log(':white_check_mark: Combined code saved to', outputFile);