import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build the server files
const serverSrc = join(__dirname, 'src/server');
const serverDist = join(__dirname, 'dist/server');

if (!existsSync(serverDist)) {
  mkdirSync(serverDist, { recursive: true });
}

// Simple build - just copy and transform
import { readFileSync, writeFileSync } from 'fs';

const indexTs = readFileSync(join(serverSrc, 'index.ts'), 'utf-8');
const dbTs = readFileSync(join(serverSrc, 'db.ts'), 'utf-8');

// Write as .js
writeFileSync(join(serverDist, 'index.js'), indexTs.replace(/import .* from '.*';/g, (match) => match));
writeFileSync(join(serverDist, 'db.js'), dbTs.replace(/import .* from '.*';/g, (match) => match));

console.log('Server built');
