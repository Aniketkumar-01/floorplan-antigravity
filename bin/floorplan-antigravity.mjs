#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scripts = path.resolve(here, '../scripts');
const [cmd = 'open', ...args] = process.argv.slice(2);

const map = {
  install: 'install.mjs',
  update: 'install.mjs',
  uninstall: 'install.mjs',
  scan: 'scan.mjs',
  build: 'build.mjs',
  open: 'open.mjs',
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
  open      Open map in browser (default)
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

