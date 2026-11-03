#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scripts = path.resolve(here, '../scripts');
const [cmd = 'open', ...args] = process.argv.slice(2);

if (['--version', '-v', 'version'].includes(cmd) || args.includes('--version') || args.includes('-v')) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(here, '../package.json'), 'utf8'));
    console.log(`floorplan-antigravity v${pkg.version}`);
  } catch {
    console.log('floorplan-antigravity');
  }
  const globalPkg = path.join(os.homedir(), '.gemini', 'config', 'skills', 'floorplan-antigravity', 'package.json');
  if (fs.existsSync(globalPkg)) {
    try {
      const g = JSON.parse(fs.readFileSync(globalPkg, 'utf8'));
      console.log(`Installed skill:       v${g.version} (${path.dirname(globalPkg)})`);
    } catch {}
  }
  process.exit(0);
}

const map = {
  install: 'install.mjs',
  update: 'install.mjs',
  uninstall: 'install.mjs',
  scan: 'scan.mjs',
  build: 'build.mjs',
  open: 'open.mjs',
  serve: 'serve.mjs',
  refresh: 'refresh.mjs',
  plan: 'plan.mjs',
  describe: 'describe.mjs',
  recent: 'recent.mjs',
  status: 'status.mjs',
};

const script = map[cmd];
if (!script) {
  console.log(`Floorplan for Antigravity

Usage:
  npx floorplan-antigravity [command] [options]
  floorplan [command] [options]

Commands:
  install   Install skill into Antigravity (global or --workspace)
  update    Update installed skill to latest version
  uninstall Remove skill from Antigravity
  scan      Scan code, imports and routes
  build     Validate architecture and build map
  open      Open map in browser / webview (default)
  serve     Run live server in foreground in terminal
  refresh   Update map with recent changes
  status    Check map status
  describe  Generate worksheets for file descriptions
  recent    Mark recent git work
  plan      Validate blueprint plan.json
`);
  process.exit(1);
}

const passArgs = cmd === 'uninstall' && !args.includes('uninstall') && !args.includes('--uninstall')
  ? ['uninstall', ...args]
  : args;
const res = spawnSync(process.execPath, [path.join(scripts, script), ...passArgs], { stdio: 'inherit' });
process.exit(res.status ?? 0);

