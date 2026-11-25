import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'frontend/src');
const banned = /distribution\.(left|center|right)\b(?!Pct)/;

function htmlFiles(directory) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...htmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      found.push(full);
    }
  }
  return found;
}

let failed = false;
for (const file of htmlFiles(dir)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (banned.test(line)) {
      failed = true;
      console.error(
        `${path.relative(root, file)}:${index + 1} recomputes a bias side from a count. ` +
          'Use BiasDistribution.leftPct, centerPct, and rightPct from StoryApiService. Do not divide counts in the template.'
      );
    }
  });
}

if (failed) {
  process.exit(1);
}
console.log('templates use API bias percents');
