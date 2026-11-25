import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const pairs = [
  ['backend/src/main/java/com/newsrater/dto/StoryDto.java', 'StoryDto', 'Story'],
  ['backend/src/main/java/com/newsrater/dto/StorySummaryDto.java', 'StorySummaryDto', 'StorySummary'],
  ['backend/src/main/java/com/newsrater/dto/ArticleDto.java', 'ArticleDto', 'Article'],
  ['backend/src/main/java/com/newsrater/dto/BiasDistributionDto.java', 'BiasDistributionDto', 'BiasDistribution'],
  ['backend/src/main/java/com/newsrater/dto/CreateStoryRequest.java', 'CreateStoryRequest', 'CreateStoryRequest']
];

function recordFields(file, recordName) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const start = text.indexOf(`public record ${recordName}(`);
  if (start < 0) {
    throw new Error(`${file} has no record ${recordName}`);
  }
  let depth = 0;
  let body = '';
  for (let i = text.indexOf('(', start); i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) break;
    }
    if (depth >= 1 && !(depth === 1 && ch === '(')) body += ch;
  }
  const withoutAnnotations = body.replace(/@\w+(?:\([^)]*\))?/g, ' ');
  return withoutAnnotations
    .split(',')
    .map((part) => part.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ').trim())
    .filter(Boolean)
    .map((part) => part.split(/\s+/).pop());
}

function tsFields(interfaceName) {
  const text = fs.readFileSync(path.join(root, 'frontend/src/app/models.ts'), 'utf8');
  const match = text.match(new RegExp(`export interface ${interfaceName} \\{([\\s\\S]*?)\\n\\}`));
  if (!match) {
    throw new Error(`models.ts has no interface ${interfaceName}`);
  }
  return [...match[1].matchAll(/^\s*(\w+)\??:/gm)].map((found) => found[1]);
}

let failed = false;
for (const [file, recordName, interfaceName] of pairs) {
  const java = recordFields(file, recordName);
  const ts = tsFields(interfaceName);
  const missing = java.filter((name) => !ts.includes(name));
  const extra = ts.filter((name) => !java.includes(name));
  if (missing.length || extra.length) {
    failed = true;
    console.error(
      `${interfaceName} is out of sync with ${recordName}. ` +
        `Update frontend/src/app/models.ts and ${file} in the same change. ` +
        `Missing in TypeScript: ${missing.join(', ') || 'none'}. ` +
        `Missing in Java: ${extra.join(', ') || 'none'}.`
    );
  }
}

if (failed) {
  process.exit(1);
}
console.log('DTO contract matches models.ts');
