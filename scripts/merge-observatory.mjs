import { readdirSync, existsSync, readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'apps/observatory/dist');
const target = join(root, 'dist');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
for (const file of ['index.html', 'observatory.html', 'prototype.html', 'observatory/stage.glb']) {
  if (!existsSync(join(source, file))) throw new Error(`Missing original Observatory output: ${file}`);
}
const anatomyEntry = readFileSync(join(target, 'index.html'));
let copied = 0;
let shared = 0;
for (const path of walk(source)) {
  const name = relative(source, path);
  // Original postbuild aliases prototype.html as index.html; keep Anatomy at the root.
  if (name === 'index.html') continue;
  const destination = join(target, name);
  if (existsSync(destination)) {
    if (!readFileSync(path).equals(readFileSync(destination))) {
      throw new Error(`Refusing to replace a different Anatomy asset: ${name}`);
    }
    shared++;
    continue;
  }
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(path, destination);
  copied++;
}
if (!readFileSync(join(target, 'index.html')).equals(anatomyEntry)) throw new Error('Anatomy root entry changed');
console.log(`Original Observatory added: ${copied} files, ${shared} identical shared assets; Anatomy root preserved.`);
