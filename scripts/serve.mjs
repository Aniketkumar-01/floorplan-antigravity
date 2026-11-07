#!/usr/bin/env node
// Run the floorplan server in the foreground for CLI / webviews
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { parseArgs, mapDir } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const dir = mapDir(root);
const serveFile = path.join(dir, 'serve.mjs');

if (!fs.existsSync(serveFile) || !fs.existsSync(path.join(dir, 'index.html'))) {
  console.error('✗ No built map found. Run "npx floorplan-antigravity build" first.');
  process.exit(1);
}

const pass = ['port'].flatMap((k) => (args[k] ? ['--' + k, String(args[k])] : []));
if (args['no-open']) pass.push('--no-open');

console.log('Starting Floorplan server in foreground (Ctrl+C to stop)...');
const child = spawn(process.execPath, [serveFile, ...pass], {
  cwd: root,
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 0));

