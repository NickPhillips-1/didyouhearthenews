import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'frontend/src');
const banned = /com\.newsrater|from ['"][^'"]*backend\//;

function files(directory) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...files(full));
    } else if (/\.(ts|html)$/.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

let failed = false;
for (const file of files(dir)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (banned.test(line)) {
      failed = true;
      console.error(
        `${path.relative(root, file)}:${index + 1} imports the backend from the UI. ` +
          'Keep the processes split. Call StoryApiService, which talks to /api/stories.'
      );
    }
  });
}

if (failed) {
  process.exit(1);
}
console.log('frontend does not import backend packages');
