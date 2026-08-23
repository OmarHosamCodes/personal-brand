#!/usr/bin/env bun
/** Stop Astro dev and wipe build/vite/astro caches. Does not start the server. */
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

console.log('Stopping Astro dev server…');
spawnSync('bun', ['run', 'astro', 'dev', 'stop'], { cwd: root, stdio: 'inherit' });

const cacheDirs = ['dist', 'node_modules/.vite', '.astro'] as const;

for (const rel of cacheDirs) {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) {
    console.log(`Skip ${rel}/ (not present)`);
    continue;
  }
  console.log(`Removing ${rel}/…`);
  rmSync(abs, { recursive: true, force: true });
}

console.log('\nReady. Start manually: bun run dev');
